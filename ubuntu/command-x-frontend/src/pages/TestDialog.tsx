import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TestDialog: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    console.log("Opening dialog");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    console.log("Closing dialog");
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Dialog Page</h1>
      
      <div className="mb-4">
        <Button 
          onClick={handleOpenDialog}
          className="bg-red-500 hover:bg-red-600"
        >
          Open Test Dialog
        </Button>
      </div>

      {/* Simple dialog using conditional rendering */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Test Dialog</h2>
            <p className="mb-4">
              This is a simple test dialog using conditional rendering.
            </p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 rounded mr-2"
                onClick={handleCloseDialog}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => {
                  alert("Action completed!");
                  handleCloseDialog();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog component from UI library */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>
              This is a test dialog using the Dialog component.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Dialog content goes here.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={() => {
              alert("Action completed!");
              handleCloseDialog();
            }}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestDialog;
