export type UnitMeasure =
  | "ea"
  | "ft"
  | "sqft"
  | "lf"
  | "hr"
  | "lot"
  | "cuft";

export interface ProductData {
  product_id: string;
  name: string;
  description?: string;
  unit: UnitMeasure;
  cost: number;
  sale_price: number;
  tax_bracket: "standard" | "reduced" | "exempt";
  is_taxable?: boolean;
  created_at?: string;
  updated_at?: string;
}
