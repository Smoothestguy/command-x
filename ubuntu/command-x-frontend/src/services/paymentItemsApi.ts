import {
  PaymentItemData,
  LocationData,
  mockPaymentItems,
  mockLocations,
} from "../types/paymentItem";
import { supabase } from "../lib/supabase";

// Flag to use mock data (set to false when backend is ready)
const USE_MOCK_DATA = false; // Using real Supabase data

// Payment Items API

// Get all payment items with optional filters
export const getPaymentItems = async (filters?: {
  workOrderId?: number;
  locationId?: number;
  projectId?: string | number; // Support both UUID strings and legacy numbers
  category?: string;
  status?: string;
  vendorId?: number;
  purchaseOrderId?: number;
}): Promise<PaymentItemData[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (USE_MOCK_DATA) {
    console.log("🔍 getPaymentItems - Using mock data with filters:", filters);
    console.log(
      "🔍 getPaymentItems - Total mock items:",
      mockPaymentItems.length
    );

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
      console.log(
        "🔍 getPaymentItems - Filtering by projectId:",
        filters.projectId
      );
      console.log(
        "🔍 getPaymentItems - Available project IDs:",
        filteredItems.map((item) => ({
          id: item.project_id,
          desc: item.description,
        }))
      );

      filteredItems = filteredItems.filter(
        (item) => String(item.project_id) === String(filters.projectId)
      );

      console.log(
        "🔍 getPaymentItems - Filtered items count:",
        filteredItems.length
      );
      console.log(
        "🔍 getPaymentItems - Filtered items:",
        filteredItems.map((item) => ({
          id: item.item_id,
          desc: item.description,
        }))
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

  // Real Supabase implementation
  try {
    console.log("Fetching payment items from Supabase with filters:", filters);

    let query = supabase.from("payment_items").select(`
        *,
        locations(name),
        vendors(name)
      `);

    // Apply filters
    if (filters?.projectId) {
      query = query.eq("project_id", filters.projectId);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.locationId) {
      query = query.eq("location_id", filters.locationId);
    }

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.workOrderId) {
      query = query.eq("work_order_id", filters.workOrderId);
    }

    if (filters?.vendorId) {
      query = query.eq("vendor_id", filters.vendorId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching payment items:", error);
      throw error;
    }

    console.log("Payment items fetched from Supabase:", data);

    // Transform the data to match our interface
    const transformedData: PaymentItemData[] = (data || []).map((item) => ({
      item_id: item.item_id,
      project_id: item.project_id,
      work_order_id: item.work_order_id,
      location_id: item.location_id,
      vendor_id: item.vendor_id,
      description: item.description,
      category: item.category,
      quantity: item.original_quantity || item.quantity, // Use original_quantity if available
      unit_price: item.unit_price,
      total_price: item.total_price,
      status: item.status,
      notes: item.notes,
      unit_of_measure: item.unit_of_measure || "each",
      item_code: item.item_code,
      original_quantity: item.original_quantity || item.quantity,
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Add location and vendor names from joins
      location_name: item.locations?.name,
      vendor_name: item.vendors?.name,
    }));

    return transformedData;
  } catch (error) {
    console.error("Error in getPaymentItems:", error);
    throw error;
  }
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
  if (USE_MOCK_DATA) {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

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

  // Real Supabase implementation
  try {
    console.log("Updating payment item in Supabase:", itemId, data);

    // Prepare update data with correct column names
    const updateData: any = {};

    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.original_quantity !== undefined)
      updateData.original_quantity = data.original_quantity;
    if (data.unit_price !== undefined) updateData.unit_price = data.unit_price;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.unit_of_measure !== undefined)
      updateData.unit_of_measure = data.unit_of_measure;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Calculate total_price if quantity or unit_price changed
    if (data.original_quantity !== undefined || data.unit_price !== undefined) {
      // We need to get current values to calculate total
      const { data: currentItem } = await supabase
        .from("payment_items")
        .select("original_quantity, unit_price")
        .eq("item_id", itemId)
        .single();

      const quantity =
        data.original_quantity ?? currentItem?.original_quantity ?? 0;
      const unitPrice = data.unit_price ?? currentItem?.unit_price ?? 0;
      updateData.total_price = quantity * unitPrice;
    }

    const { data: updatedData, error } = await supabase
      .from("payment_items")
      .update(updateData)
      .eq("item_id", itemId)
      .select()
      .single();

    if (error) {
      console.error("Error updating payment item:", error);
      throw error;
    }

    console.log("Payment item updated successfully:", updatedData);

    // Transform the response to match our interface
    return {
      item_id: updatedData.item_id,
      project_id: updatedData.project_id,
      work_order_id: updatedData.work_order_id,
      location_id: updatedData.location_id,
      vendor_id: updatedData.vendor_id,
      description: updatedData.description,
      category: updatedData.category,
      quantity: updatedData.original_quantity,
      unit_price: updatedData.unit_price,
      total_price: updatedData.total_price,
      status: updatedData.status,
      notes: updatedData.notes,
      unit_of_measure: updatedData.unit_of_measure || "each",
      item_code: updatedData.item_code,
      original_quantity: updatedData.original_quantity,
      created_at: updatedData.created_at,
      updated_at: updatedData.updated_at,
    };
  } catch (error) {
    console.error("Error in updatePaymentItem:", error);
    throw error;
  }
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
  projectId?: string | number; // Support both UUID strings and legacy numbers
}): Promise<LocationData[]> => {
  if (USE_MOCK_DATA) {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredLocations = [...mockLocations];

    if (filters?.projectId) {
      filteredLocations = filteredLocations.filter(
        (location) => String(location.project_id) === String(filters.projectId)
      );
    }

    return filteredLocations;
  }

  // Real Supabase implementation
  try {
    console.log("Fetching locations from Supabase with filters:", filters);

    let query = supabase.from("locations").select("*");

    if (filters?.projectId) {
      query = query.eq("project_id", filters.projectId);
    }

    const { data, error } = await query.order("name", { ascending: true });

    if (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }

    console.log("Locations fetched from Supabase:", data);

    // Transform the data to match our interface
    const transformedData: LocationData[] = (data || []).map((location) => ({
      location_id: location.location_id,
      project_id: location.project_id,
      location_name: location.name,
      name: location.name,
      description: location.description,
      created_at: location.created_at,
      updated_at: location.updated_at,
    }));

    return transformedData;
  } catch (error) {
    console.error("Error in getLocations:", error);
    throw error;
  }
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
