import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentItemDialog from "@/components/payment-items/PaymentItemDialog";
import { useQuery } from "@tanstack/react-query";
import { getPaymentItems } from "@/services/paymentItemsApi";
import { Plus } from "lucide-react";

const AddPaymentItemTest: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Use a test project ID - you can change this to any valid project ID
  const testProjectId = "5ec5a5c4-1cc8-4ea8-9f8f-e683b5c1fe96";

  // Fetch payment items to show the current list
  const { data: paymentItems, isLoading, refetch } = useQuery({
    queryKey: ["paymentItems", testProjectId],
    queryFn: () => getPaymentItems({ projectId: testProjectId }),
  });

  const handleOpenDialog = () => {
    console.log("Opening Add Payment Item dialog");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    console.log("Closing Add Payment Item dialog");
    setIsDialogOpen(false);
    // Refetch payment items to show the newly added item
    refetch();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Add Payment Item Test
          </h1>
          <p className="text-muted-foreground">
            Test the "Add Custom Item" functionality
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Custom Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Payment Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading payment items...</div>
          ) : (
            <div className="space-y-2">
              {paymentItems && paymentItems.length > 0 ? (
                paymentItems.map((item) => (
                  <div
                    key={item.item_id}
                    className="p-3 border rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.original_quantity} {item.unit_of_measure} × $
                        {item.unit_price} = ${item.total_price}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Status: {item.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payment items found. Try adding one!
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentItemDialog
        projectId={testProjectId}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>Project ID: {testProjectId}</div>
            <div>Dialog Open: {isDialogOpen ? "Yes" : "No"}</div>
            <div>Payment Items Count: {paymentItems?.length || 0}</div>
            <div>Loading: {isLoading ? "Yes" : "No"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddPaymentItemTest;
