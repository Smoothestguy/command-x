import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const MinimalDialogTest: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    console.log("Opening minimal dialog");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    console.log("Closing minimal dialog");
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Minimal Dialog Test
          </h1>
          <p className="text-muted-foreground">
            Test if the basic dialog component works
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Open Test Dialog
        </Button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
        <p><strong>Dialog Open:</strong> {isDialogOpen ? "Yes" : "No"}</p>
      </div>

      {/* Minimal Test Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>
              This is a minimal test dialog to check if the dialog component works
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p>If you can see this text, the dialog is working!</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button variant="outline" onClick={() => console.log("Test button clicked")}>
                Test Button
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MinimalDialogTest;
