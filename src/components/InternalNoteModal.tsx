
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function InternalNoteModal({
  appointment,
  open,
  onOpenChange,
  onSaved,
}: {
  appointment: any;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // Effect to load note from the existing notes field
  useEffect(() => {
    setNote(appointment.notes || "");
  }, [appointment, open]);

  async function saveNote() {
    setSaving(true);
    // Use the notes field that exists in the database
    const { error } = await supabase
      .from("appointments")
      .update({ notes: note })
      .eq("id", appointment.id);

    setSaving(false);
    if (error) {
      toast({ variant: "destructive", title: "Failed to save internal note" });
    } else {
      toast({ title: "Internal note saved" });
      onSaved();
      onOpenChange(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Internal Notes</DialogTitle>
        </DialogHeader>
        <textarea
          className="w-full border rounded min-h-[80px] p-2 mb-4"
          placeholder="Add internal notes here (only visible to you)"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={saveNote} disabled={saving}>Save</Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
