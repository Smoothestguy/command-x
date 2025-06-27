import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const DialogDebugTest: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [testMessage, setTestMessage] = useState("No dialog opened yet");

  const handleOpenDialog = () => {
    console.log("Opening dialog debug test");
    setIsDialogOpen(true);
    setTestMessage("Dialog should be open now");
  };

  const handleCloseDialog = () => {
    console.log("Closing dialog debug test");
    setIsDialogOpen(false);
    setTestMessage("Dialog closed");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dialog Debug Test
          </h1>
          <p className="text-muted-foreground">
            Debug dialog state without using Dialog component
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="flex items-center gap-2">
          Open Test Dialog
        </Button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
        <p><strong>Dialog Open State:</strong> {isDialogOpen ? "TRUE" : "FALSE"}</p>
        <p><strong>Test Message:</strong> {testMessage}</p>
      </div>

      {/* Manual Dialog Implementation */}
      {isDialogOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={handleCloseDialog}
        >
          <div 
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Test Dialog</h2>
            <p className="mb-4">
              If you can see this, the dialog state is working correctly!
            </p>
            <p className="mb-4 text-sm text-gray-600">
              The issue might be with the shadcn Dialog component or the PaymentItemForm.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button 
                variant="outline" 
                onClick={() => alert("Test button works!")}
              >
                Test Button
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ If you can see this dialog, React state management works</li>
          <li>✅ If the overlay appears, CSS positioning works</li>
          <li>✅ If you can click buttons, event handling works</li>
          <li>❓ If this works but shadcn Dialog doesn't, there's a component issue</li>
        </ul>
      </div>
    </div>
  );
};

export default DialogDebugTest;
