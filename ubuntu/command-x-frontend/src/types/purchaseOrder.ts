export interface VendorData {
  vendor_id?: number;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrderItemData {
  item_id?: number;
  purchase_order_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  received_quantity?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrderData {
  purchase_order_id?: number;
  work_order_id: number;
  vendor_id: number;
  po_number?: string;
  status: string; // "Draft", "Sent", "Partially Fulfilled", "Fulfilled", "Cancelled"
  issue_date?: string;
  expected_delivery_date?: string;
  notes?: string;
  total_amount?: number;
  items: PurchaseOrderItemData[];
  vendor?: VendorData;
  created_at?: string;
  updated_at?: string;
}

export interface FulfillmentItemData {
  fulfillment_item_id?: number;
  fulfillment_id?: number;
  purchase_order_item_id: number;
  quantity_received: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FulfillmentData {
  fulfillment_id?: number;
  purchase_order_id: number;
  delivery_date: string;
  received_by?: string;
  notes?: string;
  items: FulfillmentItemData[];
  created_at?: string;
  updated_at?: string;
}

export interface SplitOrderData {
  original_purchase_order_id: number;
  new_vendor_id: number;
  items: {
    purchase_order_item_id: number;
    quantity: number;
  }[];
}
