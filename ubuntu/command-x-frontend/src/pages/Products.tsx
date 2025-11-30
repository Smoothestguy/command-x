import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/services/productApi";
import { ProductData } from "@/types/product";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Products = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Omit<ProductData, "product_id">>({
    name: "",
    description: "",
    unit: "ea",
    cost: 0,
    sale_price: 0,
    tax_bracket: "standard",
    is_taxable: true,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.list,
  });

  const createMutation = useMutation({
    mutationFn: () => productApi.create(form),
    onSuccess: () => {
      toast.success("Product saved");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
      setForm({
        name: "",
        description: "",
        unit: "ea",
        cost: 0,
        sale_price: 0,
        tax_bracket: "standard",
        is_taxable: true,
      });
    },
    onError: () => toast.error("Unable to save product"),
  });

  const filtered = products.filter((p) =>
    `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products & Services</h1>
          <p className="text-muted-foreground">
            Maintain your catalog with cost, sell price, units, and tax treatment.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Add Product</Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No products</CardTitle>
              <CardDescription>Add items to price your work.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          filtered.map((product) => (
            <Card key={product.product_id} className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-2">
                  <span>{product.name}</span>
                  <Badge variant="secondary">{product.unit}</Badge>
                </CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Cost</span>
                  <span className="font-semibold">${product.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sale price</span>
                  <span className="font-semibold">${product.sale_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Tax</span>
                  <span>
                    {product.tax_bracket}
                    {product.is_taxable === false ? " (exempt)" : ""}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Product / Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Unit</Label>
                <Input
                  value={form.unit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unit: e.target.value as any }))
                  }
                />
              </div>
              <div>
                <Label>Tax Bracket</Label>
                <Input
                  value={form.tax_bracket}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tax_bracket: e.target.value as any }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Cost</Label>
                <Input
                  type="number"
                  value={form.cost}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      cost: Number.isNaN(parseFloat(e.target.value))
                        ? 0
                        : parseFloat(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <Label>Sale Price</Label>
                <Input
                  type="number"
                  value={form.sale_price}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sale_price: Number.isNaN(parseFloat(e.target.value))
                        ? 0
                        : parseFloat(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Taxable</Label>
              <input
                type="checkbox"
                checked={form.is_taxable ?? true}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_taxable: e.target.checked }))
                }
              />
            </div>
            <Button onClick={() => createMutation.mutate()} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
