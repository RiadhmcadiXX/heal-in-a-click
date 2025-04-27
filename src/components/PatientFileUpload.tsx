
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PatientFileUploadProps {
  patientId: string;
  doctorId: string;
  onUploadComplete?: () => void;
}

export function PatientFileUpload({ patientId, doctorId, onUploadComplete }: PatientFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [fileCategory, setFileCategory] = useState<string>("");
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const fileType = file.type;
      if (!fileType.startsWith('image/') && fileType !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload only images or PDF files",
          variant: "destructive",
        });
        return;
      }

      // Upload file to storage
      const fileName = `${patientId}/${Date.now()}-${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('patient_files')
        .upload(fileName, file);

      if (storageError) throw storageError;

      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('patient_files')
        .getPublicUrl(fileName);

      // Save file metadata to database
      const { error: dbError } = await supabase.from('patient_files').insert({
        doctor_id: doctorId,
        patient_id: patientId,
        file_path: publicUrl,
        file_name: file.name,
        file_type: fileType,
        description,
        file_category: fileCategory,
      });

      if (dbError) throw dbError;

      toast({
        title: "File uploaded successfully",
        description: "The file has been uploaded and associated with the patient.",
      });

      // Reset form
      setDescription("");
      setFileCategory("");
      if (onUploadComplete) onUploadComplete();

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Category</Label>
        <Select value={fileCategory} onValueChange={setFileCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select file category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prescription">Prescription</SelectItem>
            <SelectItem value="test_result">Test Result</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description for this file"
        />
      </div>

      <div>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <Button
          variant="outline"
          className="w-full"
          disabled={uploading}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <FileText className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload File"}
        </Button>
      </div>
    </div>
  );
}
