import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TestDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenDialog = () => {
    console.log("Test button clicked");
    setIsOpen(true);
    console.log("Dialog state set to true");
  };

  const handleCloseDialog = () => {
    console.log("Closing dialog");
    setIsOpen(false);
  };

  console.log("TestDialog rendered, isOpen:", isOpen);

  return (
    <div className="p-4">
      <Button onClick={handleOpenDialog}>
        Test Dialog Button
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>
              This is a test dialog to verify the dialog functionality works.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p>If you can see this, the dialog is working!</p>
            <Button onClick={handleCloseDialog} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestDialog;
