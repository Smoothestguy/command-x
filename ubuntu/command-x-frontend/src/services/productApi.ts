import { ProductData } from "@/types/product";

let mockProducts: ProductData[] = [
  {
    product_id: "prod-1",
    name: "Concrete (3000 PSI)",
    description: "Standard mix for footings and slabs",
    unit: "cuft",
    cost: 80,
    sale_price: 125,
    tax_bracket: "standard",
    is_taxable: true,
  } as ProductData,
  {
    product_id: "prod-2",
    name: "Framing Lumber",
    description: "2x4 kiln dried SPF",
    unit: "ea",
    cost: 3.25,
    sale_price: 5.5,
    tax_bracket: "standard",
    is_taxable: true,
  },
  {
    product_id: "prod-3",
    name: "Project Management Hours",
    description: "Senior PM services",
    unit: "hr",
    cost: 45,
    sale_price: 95,
    tax_bracket: "reduced",
    is_taxable: false,
  },
  {
    product_id: "prod-4",
    name: "Appliance Package",
    description: "Kitchen appliance bundle",
    unit: "lot",
    cost: 2500,
    sale_price: 3800,
    tax_bracket: "standard",
    is_taxable: true,
  },
];

export const productApi = {
  list: async (): Promise<ProductData[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...mockProducts];
  },
  create: async (payload: Omit<ProductData, "product_id">) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newProduct: ProductData = {
      ...payload,
      product_id: `prod-${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  },
  update: async (id: string, payload: Partial<ProductData>) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const idx = mockProducts.findIndex((p) => p.product_id === id);
    if (idx === -1) throw new Error("Product not found");
    mockProducts[idx] = {
      ...mockProducts[idx],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    return { ...mockProducts[idx] };
  },
};

export default productApi;
