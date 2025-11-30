import { CustomerData } from "@/types/customer";

let mockCustomers: CustomerData[] = [
  {
    customer_id: "cust-1",
    name: "Smith Family",
    email: "john@smithresidence.com",
    phone: "555-111-2222",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "94016",
    billing_contact: "John Smith",
    tax_id: "12-3456789",
    notes: "Primary residential client",
  },
  {
    customer_id: "cust-2",
    name: "ABC Corporation",
    email: "ap@abc-corp.com",
    phone: "555-333-4444",
    address: "456 Commerce Ave",
    city: "Anytown",
    state: "CA",
    zip: "94105",
    billing_contact: "Mary Doe",
    tax_id: "98-7654321",
    notes: "Commercial office build-out",
  },
  {
    customer_id: "cust-3",
    name: "Riverfront Development",
    email: "projects@riverfrontdev.com",
    phone: "555-777-9999",
    address: "321 River View Dr",
    city: "Anytown",
    state: "CA",
    zip: "94118",
    billing_contact: "Alex Perez",
    tax_id: "23-9876543",
    notes: "Multi-family projects",
  },
  {
    customer_id: "cust-4",
    name: "Anytown Municipality",
    email: "procurement@anytown.gov",
    phone: "555-222-7777",
    city: "Anytown",
    state: "CA",
    billing_contact: "Procurement Office",
    tax_id: "11-1111111",
    notes: "Public works projects",
  },
  {
    customer_id: "cust-5",
    name: "State Transportation Department",
    email: "contracts@statetransport.gov",
    phone: "555-000-1212",
    city: "Capital City",
    state: "CA",
    billing_contact: "Contracts",
    tax_id: "22-2222222",
  },
  {
    customer_id: "cust-6",
    name: "Test Client",
    email: "client@test.com",
    city: "Test City",
    state: "CA",
    billing_contact: "QA",
  },
];

export const customerApi = {
  list: async (): Promise<CustomerData[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...mockCustomers];
  },
  create: async (payload: Omit<CustomerData, "customer_id">) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newCustomer: CustomerData = {
      ...payload,
      customer_id: `cust-${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockCustomers.push(newCustomer);
    return newCustomer;
  },
  update: async (id: string, payload: Partial<CustomerData>) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const idx = mockCustomers.findIndex((c) => c.customer_id === id);
    if (idx === -1) throw new Error("Customer not found");
    mockCustomers[idx] = {
      ...mockCustomers[idx],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    return { ...mockCustomers[idx] };
  },
};

export default customerApi;
