
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface PatientFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
  description: string;
  file_category: string;
}

interface PatientFilesListProps {
  patientId: string;
}

export function PatientFilesList({ patientId }: PatientFilesListProps) {
  const [files, setFiles] = useState<PatientFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [patientId]);

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_files')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'prescription':
        return 'bg-blue-100 text-blue-800';
      case 'test_result':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div>Loading files...</div>;

  return (
    <div className="space-y-4">
      {files.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          No files uploaded yet
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="p-4 border rounded-lg flex items-center justify-between"
            >
              <div className="flex items-start gap-4">
                <FileText className="h-5 w-5 text-gray-500 mt-1" />
                <div>
                  <div className="font-medium">{file.file_name}</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(file.created_at), 'MMM d, yyyy')}
                  </div>
                  {file.description && (
                    <div className="text-sm text-gray-600 mt-1">
                      {file.description}
                    </div>
                  )}
                  <Badge 
                    variant="secondary" 
                    className={`mt-2 ${getCategoryColor(file.file_category)}`}
                  >
                    {file.file_category}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => window.open(file.file_path, '_blank')}
              >
                View
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
