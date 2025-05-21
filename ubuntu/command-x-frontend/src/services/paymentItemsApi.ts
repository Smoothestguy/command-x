import {
  PaymentItemData,
  LocationData,
  mockPaymentItems,
  mockLocations,
} from "../types/paymentItem";

// Flag to use mock data (set to false when backend is ready)
const USE_MOCK_DATA = true;

// Payment Items API

// Get all payment items with optional filters
export const getPaymentItems = async (filters?: {
  workOrderId?: number;
  locationId?: number;
  projectId?: number;
  category?: string;
  status?: string;
  vendorId?: number;
  purchaseOrderId?: number;
}): Promise<PaymentItemData[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (USE_MOCK_DATA) {
    // Create enhanced mock data with additional fields for the new UI
    const enhancedMockItems = mockPaymentItems.map((item) => ({
      ...item,
      // Add random categories if not present
      category:
        item.category ||
        [
          "GENERAL",
          "ELECTRICAL",
          "PLUMBING",
          "HVAC",
          "INSULATION",
          "WALLS & CEILINGS",
        ][Math.floor(Math.random() * 6)],
      // Add specifications
      specifications:
        item.specifications ||
        "Standard installation per manufacturer specifications",
      // Add vendor information
      vendor_id: item.vendor_id || Math.floor(Math.random() * 5) + 1,
      vendor_name:
        item.vendor_name || `Vendor ${Math.floor(Math.random() * 5) + 1}`,
      // Add purchase order information
      purchase_order_id:
        item.purchase_order_id || Math.floor(Math.random() * 1000) + 2000,
      purchase_order_number:
        item.purchase_order_number ||
        `PO-${Math.floor(Math.random() * 1000) + 2000}`,
      // Add balance and received quantity
      balance:
        item.balance || item.total_price - (item.actual_total_price || 0),
      received_quantity: item.received_quantity || item.actual_quantity || 0,
    }));

    let filteredItems = [...enhancedMockItems];

    if (filters?.workOrderId) {
      filteredItems = filteredItems.filter(
        (item) => item.work_order_id === filters.workOrderId
      );
    }

    if (filters?.locationId) {
      filteredItems = filteredItems.filter(
        (item) => item.location_id === filters.locationId
      );
    }

    if (filters?.projectId) {
      filteredItems = filteredItems.filter(
        (item) => item.project_id === filters.projectId
      );
    }

    if (filters?.category) {
      filteredItems = filteredItems.filter(
        (item) => item.category === filters.category
      );
    }

    if (filters?.status) {
      filteredItems = filteredItems.filter(
        (item) => item.status === filters.status
      );
    }

    if (filters?.vendorId) {
      filteredItems = filteredItems.filter(
        (item) => item.vendor_id === filters.vendorId
      );
    }

    if (filters?.purchaseOrderId) {
      filteredItems = filteredItems.filter(
        (item) => item.purchase_order_id === filters.purchaseOrderId
      );
    }

    return filteredItems;
  }

  // In a real implementation, we would make an API call here
  // This is just a placeholder for when the backend is ready
  return [];
};

// Get a single payment item by ID
export const getPaymentItemById = async (
  itemId: number
): Promise<PaymentItemData> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (USE_MOCK_DATA) {
    const item = mockPaymentItems.find((item) => item.item_id === itemId);
    if (!item) {
      throw new Error(`Payment item with ID ${itemId} not found`);
    }
    return item;
  }

  // In a real implementation, we would make an API call here
  // This is just a placeholder for when the backend is ready
  throw new Error(`Payment item with ID ${itemId} not found`);
};

// Create a new payment item
export const createPaymentItem = async (
  data: Partial<PaymentItemData>
): Promise<PaymentItemData> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (USE_MOCK_DATA) {
    const newItem: PaymentItemData = {
      ...data,
      item_id: Date.now(),
      status: data.status || "pending",
      qc_approval_status: "pending",
      supervisor_approval_status: "pending",
      accountant_approval_status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_price: (data.original_quantity || 0) * (data.unit_price || 0),
      // Add enhanced fields
      category:
        data.category ||
        [
          "GENERAL",
          "ELECTRICAL",
          "PLUMBING",
          "HVAC",
          "INSULATION",
          "WALLS & CEILINGS",
        ][Math.floor(Math.random() * 6)],
      specifications:
        data.specifications ||
        "Standard installation per manufacturer specifications",
      vendor_id: data.vendor_id || Math.floor(Math.random() * 5) + 1,
      vendor_name:
        data.vendor_name || `Vendor ${Math.floor(Math.random() * 5) + 1}`,
      purchase_order_id:
        data.purchase_order_id || Math.floor(Math.random() * 1000) + 2000,
      purchase_order_number:
        data.purchase_order_number ||
        `PO-${Math.floor(Math.random() * 1000) + 2000}`,
      balance:
        data.balance || (data.original_quantity || 0) * (data.unit_price || 0),
      received_quantity: data.received_quantity || 0,
    } as PaymentItemData;

    mockPaymentItems.push(newItem);
    return newItem;
  }

  // In a real implementation, we would make an API call here
  // This is just a placeholder for when the backend is ready
  throw new Error("Failed to create payment item");
};

// Update an existing payment item
export const updatePaymentItem = async (
  itemId: number,
  data: Partial<PaymentItemData>
): Promise<PaymentItemData> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (USE_MOCK_DATA) {
    const index = mockPaymentItems.findIndex((item) => item.item_id === itemId);
    if (index === -1) {
      throw new Error(`Payment item with ID ${itemId} not found`);
    }

    const updatedItem = {
      ...mockPaymentItems[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    // Recalculate total price if quantity or unit price changed
    if (data.original_quantity !== undefined || data.unit_price !== undefined) {
      updatedItem.total_price =
        updatedItem.original_quantity * updatedItem.unit_price;
    }

    // Recalculate actual total price if actual quantity or unit price changed
    if (data.actual_quantity !== undefined || data.unit_price !== undefined) {
      updatedItem.actual_total_price =
        (updatedItem.actual_quantity || updatedItem.original_quantity) *
        updatedItem.unit_price;
    }

    mockPaymentItems[index] = updatedItem;
    return updatedItem;
  }

  // In a real implementation, we would make an API call here
  // This is just a placeholder for when the backend is ready
  throw new Error(`Failed to update payment item with ID ${itemId}`);
};

// Delete a payment item
export const deletePaymentItem = async (itemId: number): Promise<void> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (USE_MOCK_DATA) {
    const index = mockPaymentItems.findIndex((item) => item.item_id === itemId);
    if (index === -1) {
      throw new Error(`Payment item with ID ${itemId} not found`);
    }

    mockPaymentItems.splice(index, 1);
    return;
  }

  // In a real implementation, we would make an API call here
  // This is just a placeholder for when the backend is ready
  throw new Error(`Failed to delete payment item with ID ${itemId}`);
};

// Locations API

// Get all locations with optional project filter
export const getLocations = async (filters?: {
  projectId?: number;
}): Promise<LocationData[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (USE_MOCK_DATA) {
    let filteredLocations = [...mockLocations];

    if (filters?.projectId) {
      filteredLocations = filteredLocations.filter(
        (location) => location.project_id === filters.projectId
      );
    }

    return filteredLocations;
  }

  // In a real implementation, we would make an API call here
  // This is just a placeholder for when the backend is ready
  return [];
};

// Get a single location by ID
export const getLocationById = async (
  locationId: number
): Promise<LocationData> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (USE_MOCK_DATA) {
    const location = mockLocations.find(
      (location) => location.location_id === locationId
    );
    if (!location) {
      throw new Error(`Location with ID ${locationId} not found`);
    }

    // Add children
    location.children = mockLocations.filter(
      (loc) => loc.parent_location_id === locationId
    );

    // Add payment items
    location.payment_items = mockPaymentItems.filter(
      (item) => item.location_id === locationId
    );

    return location;
  }

  // In a real implementation, we would make an API call here
  // This is just a placeholder for when the backend is ready
  throw new Error(`Location with ID ${locationId} not found`);
};
