import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PaymentItemData, LocationData } from "@/types/paymentItem";
import {
  updatePaymentItem,
  deletePaymentItem,
} from "@/services/paymentItemsApi";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import DeletePaymentItemDialog from "@/components/payment-items/DeletePaymentItemDialog";

interface EditablePaymentItemRowProps {
  item: PaymentItemData;
  locations?: LocationData[];
  isSelected: boolean;
  onSelectionChange: (checked: boolean) => void;
  projectId?: string;
}

const EditablePaymentItemRow: React.FC<EditablePaymentItemRowProps> = ({
  item,
  locations,
  isSelected,
  onSelectionChange,
  projectId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedItem, setEditedItem] = useState({
    description: item.description,
    quantity: item.original_quantity,
    unit_price: item.unit_price,
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: number;
      data: Partial<PaymentItemData>;
    }) => updatePaymentItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentItems"] });
      toast.success("Payment item updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(
        `Failed to update payment item: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });

  const handleSave = () => {
    const updateData = {
      description: editedItem.description,
      original_quantity: editedItem.quantity,
      unit_price: editedItem.unit_price,
      total_price: editedItem.quantity * editedItem.unit_price,
    };

    updateMutation.mutate({
      itemId: item.item_id,
      data: updateData,
    });
  };

  const handleCancel = () => {
    setEditedItem({
      description: item.description,
      quantity: item.original_quantity,
      unit_price: item.unit_price,
    });
    setIsEditing(false);
  };

  const calculatedTotal = editedItem.quantity * editedItem.unit_price;

  return (
    <TableRow>
      <TableCell>
        <Checkbox checked={isSelected} onCheckedChange={onSelectionChange} />
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editedItem.description}
            onChange={(e) =>
              setEditedItem({ ...editedItem, description: e.target.value })
            }
            className="min-w-[200px]"
          />
        ) : (
          <div>
            <div className="font-medium">{item.description}</div>
            {item.item_code && (
              <div className="text-sm text-gray-500">{item.item_code}</div>
            )}
          </div>
        )}
      </TableCell>
      <TableCell>
        {item.location_id && locations
          ? locations.find((loc) => loc.location_id === item.location_id)
              ?.name || "-"
          : "-"}
      </TableCell>
      <TableCell>
        {item.category && <Badge variant="outline">{item.category}</Badge>}
      </TableCell>
      <TableCell className="text-right">
        {isEditing ? (
          <div className="flex items-center space-x-1">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={editedItem.quantity}
              onChange={(e) =>
                setEditedItem({
                  ...editedItem,
                  quantity: parseFloat(e.target.value) || 0,
                })
              }
              className="w-20"
            />
            <span className="text-sm text-gray-500">
              {item.unit_of_measure}
            </span>
          </div>
        ) : (
          `${item.original_quantity} ${item.unit_of_measure}`
        )}
      </TableCell>
      <TableCell className="text-right">
        {isEditing ? (
          <Input
            type="number"
            step="0.01"
            min="0"
            value={editedItem.unit_price}
            onChange={(e) =>
              setEditedItem({
                ...editedItem,
                unit_price: parseFloat(e.target.value) || 0,
              })
            }
            className="w-24"
          />
        ) : (
          `$${item.unit_price.toFixed(2)}`
        )}
      </TableCell>
      <TableCell className="text-right">
        {isEditing ? (
          <span className="font-medium">${calculatedTotal.toFixed(2)}</span>
        ) : (
          `$${(item.total_price || 0).toFixed(2)}`
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>

      {/* Delete Confirmation Dialog */}
      {projectId && (
        <DeletePaymentItemDialog
          projectId={projectId}
          itemId={item.item_id}
          itemDescription={item.description}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </TableRow>
  );
};

export default EditablePaymentItemRow;
