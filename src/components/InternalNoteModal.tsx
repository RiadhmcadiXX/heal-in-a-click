
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

  // Effect to load note (simulate fetching "private_notes" if it exists)
  useEffect(() => {
    setNote(appointment.private_notes || "");
  }, [appointment, open]);

  async function saveNote() {
    setSaving(true);
    // Use a "private_notes" field if it exists, otherwise save into notes
    const { error } = await supabase
      .from("appointments")
      .update({ private_notes: note })
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
