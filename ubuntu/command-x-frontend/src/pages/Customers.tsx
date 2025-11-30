import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/services/customerApi";
import { CustomerData } from "@/types/customer";
import { ProjectData } from "@/types/project";
import { getProjects } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Customers = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Omit<CustomerData, "customer_id">>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
    billing_contact: "",
    tax_id: "",
  });

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: customerApi.list,
  });

  const { data: projects = [] } = useQuery<ProjectData[]>({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const createMutation = useMutation({
    mutationFn: () => customerApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer added");
      setDialogOpen(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        notes: "",
        billing_contact: "",
        tax_id: "",
      });
    },
    onError: () => toast.error("Failed to add customer"),
  });

  const filtered = useMemo(
    () =>
      customers.filter((c) => {
        const haystack = `${c.name} ${c.email} ${c.phone} ${c.city}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      }),
    [customers, search]
  );

  const projectsByCustomer = useMemo(() => {
    const map: Record<string, ProjectData[]> = {};
    projects.forEach((p) => {
      if (!p.customer_id) return;
      map[p.customer_id] = map[p.customer_id] || [];
      map[p.customer_id].push(p);
    });
    return map;
  }, [projects]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Track clients, contacts, and the projects under each customer.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Add Customer</Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No customers yet</CardTitle>
              <CardDescription>
                Add your first customer to start grouping projects.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          filtered.map((customer) => (
            <Card key={customer.customer_id} className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{customer.name}</span>
                  <Badge variant="outline">
                    {projectsByCustomer[customer.customer_id]?.length || 0}{" "}
                    projects
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {customer.city ? `${customer.city}, ${customer.state || ""}` : "No location"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                {customer.email && <div>Email: {customer.email}</div>}
                {customer.phone && <div>Phone: {customer.phone}</div>}
                {customer.billing_contact && (
                  <div>Billing contact: {customer.billing_contact}</div>
                )}
                {customer.tax_id && <div>Tax ID: {customer.tax_id}</div>}
                {projectsByCustomer[customer.customer_id]?.length ? (
                  <div className="pt-2">
                    <div className="text-xs uppercase text-slate-500 mb-1">
                      Projects
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {projectsByCustomer[customer.customer_id].map((p) => (
                        <Badge key={p.project_id} variant="secondary">
                          {p.project_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={form.state}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, state: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Billing Contact</Label>
                <Input
                  value={form.billing_contact}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, billing_contact: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Tax ID</Label>
                <Input
                  value={form.tax_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tax_id: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Payment terms, references, etc."
              />
            </div>
            <Button onClick={() => createMutation.mutate()} className="w-full">
              Save Customer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
