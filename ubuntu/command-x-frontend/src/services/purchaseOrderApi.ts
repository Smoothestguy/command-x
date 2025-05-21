import {
  PurchaseOrderData,
  VendorData,
  FulfillmentData,
  SplitOrderData,
} from "../types/purchaseOrder";

// Mock data for vendors
const mockVendors: VendorData[] = [
  {
    vendor_id: 1,
    name: "ABC Supplies",
    contact_name: "John Smith",
    email: "john@abcsupplies.com",
    phone: "555-123-4567",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "12345",
  },
  {
    vendor_id: 2,
    name: "XYZ Materials",
    contact_name: "Jane Doe",
    email: "jane@xyzmaterials.com",
    phone: "555-987-6543",
    address: "456 Oak Ave",
    city: "Somewhere",
    state: "NY",
    zip: "67890",
  },
  {
    vendor_id: 3,
    name: "123 Hardware",
    contact_name: "Bob Johnson",
    email: "bob@123hardware.com",
    phone: "555-456-7890",
    address: "789 Pine Rd",
    city: "Nowhere",
    state: "TX",
    zip: "54321",
  },
];

// Mock data for purchase orders
let mockPurchaseOrders: PurchaseOrderData[] = [
  {
    purchase_order_id: 1,
    work_order_id: 101,
    vendor_id: 1,
    po_number: "PO-2023-001",
    status: "Partially Fulfilled",
    issue_date: "2023-05-15",
    expected_delivery_date: "2023-05-30",
    vendor: { vendor_id: 1, name: "ABC Supplies" },
    items: [
      {
        item_id: 1,
        description: "Lumber 2x4",
        quantity: 100,
        unit_price: 5.99,
        received_quantity: 50,
      },
      {
        item_id: 2,
        description: "Nails (box)",
        quantity: 20,
        unit_price: 12.99,
        received_quantity: 20,
      },
      {
        item_id: 3,
        description: "Paint (gallon)",
        quantity: 10,
        unit_price: 24.99,
        received_quantity: 0,
      },
    ],
  },
  {
    purchase_order_id: 2,
    work_order_id: 102,
    vendor_id: 2,
    po_number: "PO-2023-002",
    status: "Sent",
    issue_date: "2023-05-20",
    expected_delivery_date: "2023-06-05",
    vendor: { vendor_id: 2, name: "XYZ Materials" },
    items: [
      {
        item_id: 4,
        description: "Concrete (bag)",
        quantity: 50,
        unit_price: 8.99,
        received_quantity: 0,
      },
      {
        item_id: 5,
        description: "Rebar",
        quantity: 30,
        unit_price: 15.99,
        received_quantity: 0,
      },
    ],
  },
  {
    purchase_order_id: 3,
    work_order_id: 103,
    vendor_id: 3,
    po_number: "PO-2023-003",
    status: "Fulfilled",
    issue_date: "2023-05-10",
    expected_delivery_date: "2023-05-25",
    vendor: { vendor_id: 3, name: "123 Hardware" },
    items: [
      {
        item_id: 6,
        description: "Screws (box)",
        quantity: 15,
        unit_price: 9.99,
        received_quantity: 15,
      },
      {
        item_id: 7,
        description: "Drill Bits (set)",
        quantity: 5,
        unit_price: 29.99,
        received_quantity: 5,
      },
    ],
  },
];

// Get all purchase orders for a work order
// If workOrderId is -1, return all purchase orders (special case for the PurchaseOrders page)
export const getPurchaseOrders = async (
  workOrderId: number
): Promise<PurchaseOrderData[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (workOrderId === -1) {
    // Special case: return all purchase orders
    return mockPurchaseOrders;
  }

  // Normal case: filter by work order ID
  return mockPurchaseOrders.filter((po) => po.work_order_id === workOrderId);
};

// Get a single purchase order by ID
export const getPurchaseOrder = async (
  purchaseOrderId: number
): Promise<PurchaseOrderData> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const purchaseOrder = mockPurchaseOrders.find(
    (po) => po.purchase_order_id === purchaseOrderId
  );

  if (!purchaseOrder) {
    throw new Error(`Purchase order with ID ${purchaseOrderId} not found`);
  }

  return purchaseOrder;
};

// Create a new purchase order
export const createPurchaseOrder = async (
  purchaseOrderData: PurchaseOrderData
): Promise<PurchaseOrderData> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newPurchaseOrder: PurchaseOrderData = {
    ...purchaseOrderData,
    purchase_order_id: Date.now(), // Generate a unique ID
    po_number: `PO-${Date.now().toString().slice(-6)}`, // Generate a PO number
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vendor: mockVendors.find(
      (v) => v.vendor_id === purchaseOrderData.vendor_id
    ),
  };

  mockPurchaseOrders.push(newPurchaseOrder);

  return newPurchaseOrder;
};

// Update an existing purchase order
export const updatePurchaseOrder = async (
  purchaseOrderId: number,
  purchaseOrderData: Partial<PurchaseOrderData>
): Promise<PurchaseOrderData> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const index = mockPurchaseOrders.findIndex(
    (po) => po.purchase_order_id === purchaseOrderId
  );

  if (index === -1) {
    throw new Error(`Purchase order with ID ${purchaseOrderId} not found`);
  }

  const updatedPurchaseOrder: PurchaseOrderData = {
    ...mockPurchaseOrders[index],
    ...purchaseOrderData,
    updated_at: new Date().toISOString(),
  };

  mockPurchaseOrders[index] = updatedPurchaseOrder;

  return updatedPurchaseOrder;
};

// Delete a purchase order
export const deletePurchaseOrder = async (
  purchaseOrderId: number
): Promise<void> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const index = mockPurchaseOrders.findIndex(
    (po) => po.purchase_order_id === purchaseOrderId
  );

  if (index === -1) {
    throw new Error(`Purchase order with ID ${purchaseOrderId} not found`);
  }

  mockPurchaseOrders.splice(index, 1);
};

// Get all vendors
export const getVendors = async (): Promise<VendorData[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return mockVendors;
};

// Create a fulfillment record
export const createFulfillment = async (
  fulfillmentData: FulfillmentData
): Promise<FulfillmentData> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In a real implementation, this would create a fulfillment record in the database
  // and update the received quantities on the purchase order items

  // For our mock implementation, we'll just update the purchase order items
  const purchaseOrder = mockPurchaseOrders.find(
    (po) => po.purchase_order_id === fulfillmentData.purchase_order_id
  );

  if (!purchaseOrder) {
    throw new Error(
      `Purchase order with ID ${fulfillmentData.purchase_order_id} not found`
    );
  }

  // Update received quantities on purchase order items
  fulfillmentData.items.forEach((fulfillmentItem) => {
    const poItem = purchaseOrder.items.find(
      (item) => item.item_id === fulfillmentItem.purchase_order_item_id
    );

    if (poItem) {
      poItem.received_quantity =
        (poItem.received_quantity || 0) + fulfillmentItem.quantity_received;
    }
  });

  // Update purchase order status based on fulfillment
  const allItemsFulfilled = purchaseOrder.items.every(
    (item) => (item.received_quantity || 0) >= item.quantity
  );

  const anyItemsFulfilled = purchaseOrder.items.some(
    (item) => (item.received_quantity || 0) > 0
  );

  if (allItemsFulfilled) {
    purchaseOrder.status = "Fulfilled";
  } else if (anyItemsFulfilled) {
    purchaseOrder.status = "Partially Fulfilled";
  }

  // Return the fulfillment data with a generated ID
  return {
    ...fulfillmentData,
    fulfillment_id: Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

// Split a purchase order between vendors
export const splitPurchaseOrder = async (
  splitOrderData: SplitOrderData
): Promise<PurchaseOrderData> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const originalPO = mockPurchaseOrders.find(
    (po) => po.purchase_order_id === splitOrderData.original_purchase_order_id
  );

  if (!originalPO) {
    throw new Error(
      `Purchase order with ID ${splitOrderData.original_purchase_order_id} not found`
    );
  }

  // Create items for the new purchase order
  const newItems = splitOrderData.items.map((splitItem) => {
    const originalItem = originalPO.items.find(
      (item) => item.item_id === splitItem.purchase_order_item_id
    );

    if (!originalItem) {
      throw new Error(
        `Item with ID ${splitItem.purchase_order_item_id} not found in original purchase order`
      );
    }

    // Reduce the quantity in the original item
    originalItem.quantity -= splitItem.quantity;

    // Create a new item for the new purchase order
    return {
      description: originalItem.description,
      quantity: splitItem.quantity,
      unit_price: originalItem.unit_price,
      received_quantity: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  // Create the new purchase order
  const newPurchaseOrder: PurchaseOrderData = {
    work_order_id: originalPO.work_order_id,
    vendor_id: splitOrderData.new_vendor_id,
    status: "Draft",
    po_number: `PO-${Date.now().toString().slice(-6)}`,
    issue_date: new Date().toISOString(),
    items: newItems,
    vendor: mockVendors.find(
      (v) => v.vendor_id === splitOrderData.new_vendor_id
    ),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    purchase_order_id: Date.now(),
  };

  mockPurchaseOrders.push(newPurchaseOrder);

  return newPurchaseOrder;
};
