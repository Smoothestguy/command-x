import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  personnelApi,
  Worker,
  WorkerWithTotals,
  TimeEntry,
} from "@/services/personnelApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  Pencil,
  Trash2,
  TimerReset,
  UserPlus,
  Calendar,
  Loader2,
  Download,
  Upload,
  ChevronsUpDown,
} from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  exportWorkersToPDF,
  exportTimeEntriesToPDF,
  exportWorkerDetailsToCSV,
  exportTimeEntriesToCSV,
} from "@/utils/exportUtils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAuth } from "@/contexts/AuthContext";
import { workOrdersApi } from "@/services/supabaseApi";

const useWorkers = (subcontractorId?: string) => {
  return useQuery<Worker[]>({
    queryKey: ["workers", subcontractorId ?? "all"],
    queryFn: () => personnelApi.getWorkers(subcontractorId),
  });
};

export default function Personnel() {
  const qc = useQueryClient();
  const { user, userRole } = useAuth();
  const subcontractorFilter =
    userRole === "subcontractor" && (user as any)?.subcontractor_id
      ? String((user as any).subcontractor_id)
      : undefined;
  const { data: workers = [], isLoading } = useWorkers(subcontractorFilter);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<DateRange | undefined>();

  const [selected, setSelected] = useState<Worker | null>(null);
  const [isTimeDialogOpen, setTimeDialogOpen] = useState(false);
  const [isAddWorkerDialogOpen, setAddWorkerDialogOpen] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const emptyWorkerForm: Omit<Worker, "worker_id"> = {
    first_name: "",
    last_name: "",
    email: null,
    phone: null,
    home_address: null,
    position_applying_for: null,
    role: null,
    hire_date: null,
    is_active: true,
  };
  const [timeForm, setTimeForm] = useState<Omit<TimeEntry, "entry_id">>({
    worker_id: "",
    date: new Date().toISOString(),
    hours: 8,
    project_id: null,
    work_order_id: null,
    notes: "",
  });
  const [workerForm, setWorkerForm] = useState<Omit<Worker, "worker_id">>(
    emptyWorkerForm
  );
  const [projects, setProjects] = useState<
    Array<{ project_id: string; project_name: string }>
  >([]);
  const [workOrders, setWorkOrders] = useState<
    Array<{ work_order_id: string; description: string }>
  >([]);

  // Lightweight searchable Combobox built from Popover + Command
  const Combobox: React.FC<{
    items: { value: string; label: string }[];
    value?: string | null;
    onChange: (v: string) => void;
    placeholder: string;
    ariaLabel: string;
  }> = ({ items, value, onChange, placeholder, ariaLabel }) => {
    const [open, setOpen] = useState(false);
    const selected = items.find((i) => i.value === value);
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selected ? selected.label : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
          <Command>
            <CommandInput
              placeholder={`Search ${ariaLabel.toLowerCase()}...`}
            />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.label}
                    onSelect={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const loadWorkOrders = async (projectId: string) => {
    try {
      const data = await workOrdersApi.getAll(projectId);
      setWorkOrders(
        (data as any[]).map((w: any) => ({
          work_order_id: w.work_order_id,
          description: w.description,
        }))
      );
    } catch (e) {
      console.error("Failed to load work orders", e);
    }
  };

  const onSelectProject = async (pid: string) => {
    setTimeForm({ ...timeForm, project_id: pid || null, work_order_id: null });
    if (pid) await loadWorkOrders(pid);
    else setWorkOrders([]);
  };

  // openTimeDialog already defined above with project loader

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleExportTimeEntriesCSV = async () => {
    const from = range?.from ? new Date(range.from) : undefined;
    const to = range?.to ? new Date(range.to) : undefined;
    const fmt = (d: Date) => d.toISOString();
    const entries: any[] = [];
    for (const w of filtered) {
      const data = await personnelApi.getTimeEntriesByWorker(
        w.worker_id,
        from ? fmt(from) : undefined,
        to ? fmt(to) : undefined
      );
      data.forEach((e) =>
        entries.push({
          worker_id: w.worker_id,
          worker_name: `${w.first_name} ${w.last_name}`,
          date: e.date,
          hours: e.hours,
          project_id: e.project_id || "",
          work_order_id: e.work_order_id || "",
          notes: e.notes || "",
        })
      );
    }
    exportTimeEntriesToCSV(entries);
  };

  const handleExportTimeEntriesPDF = async () => {
    const from = range?.from ? new Date(range.from) : undefined;
    const to = range?.to ? new Date(range.to) : undefined;
    const fmt = (d: Date) => d.toISOString();
    const entries: any[] = [];
    for (const w of filtered) {
      const data = await personnelApi.getTimeEntriesByWorker(
        w.worker_id,
        from ? fmt(from) : undefined,
        to ? fmt(to) : undefined
      );
      data.forEach((e) =>
        entries.push({
          worker_id: w.worker_id,
          worker_name: `${w.first_name} ${w.last_name}`,
          date: e.date,
          hours: e.hours,
          project_id: e.project_id || "",
          work_order_id: e.work_order_id || "",
          notes: e.notes || "",
        })
      );
    }
    exportTimeEntriesToPDF(entries, new Map(), { from, to });
  };

  const handleExportWorkersPDF = () => {
    exportWorkersToPDF(filtered);
  };

  const handleExportWorkersCSV = () => {
    exportWorkerDetailsToCSV(filtered);
  };

  const handleImportCSV = async (file: File) => {
    const text = await file.text();
    const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
    const headers = headerLine.split(",").map((h) => h.trim());
    for (const line of lines) {
      const vals = line.split(",");
      const rec: any = {};
      headers.forEach((h, i) => (rec[h] = vals[i]));
      if (!rec.worker_id || !rec.date || !rec.hours) continue;
      await personnelApi.addTimeEntry({
        worker_id: rec.worker_id,
        date: new Date(rec.date).toISOString(),
        hours: Number(rec.hours),
        project_id: rec.project_id || null,
        work_order_id: rec.work_order_id || null,
        notes: rec.notes || "",
      });
    }
    qc.invalidateQueries({ queryKey: ["workers"] });
  };

  const sparkData = React.useRef<Record<string, number[]>>({});
  const loadSpark = async (workerId: string) => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const fmt = (d: Date) => d.toISOString();
    const entries = await personnelApi.getTimeEntriesByWorker(
      workerId,
      fmt(start)
    );
    const days: number[] = Array(7).fill(0);
    entries.forEach((e) => {
      const d = new Date(e.date);
      const diff = Math.floor(
        (d.getTime() - start.getTime()) / (24 * 3600 * 1000)
      );
      if (diff >= 0 && diff < 7) days[diff] += e.hours || 0;
    });
    sparkData.current[workerId] = days;
  };

  const Sparkline: React.FC<{ data?: number[] }> = ({ data }) => {
    if (!data || data.length === 0) return <span>-</span>;
    const w = 80,
      h = 24;
    const max = Math.max(1, ...data);
    const pts = data
      .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
      .join(" ");
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <polyline fill="none" stroke="#0ea5e9" strokeWidth="2" points={pts} />
      </svg>
    );
  };

  const addTimeMutation = useMutation({
    mutationFn: personnelApi.addTimeEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workers"] });
      setTimeDialogOpen(false);
    },
  });

  const createWorkerMutation = useMutation({
    mutationFn: (w: Omit<Worker, "worker_id">) => personnelApi.createWorker(w),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workers"] }),
  });

  const updateWorkerMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Worker> }) =>
      personnelApi.updateWorker(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workers"] }),
  });

  const deleteWorkerMutation = useMutation({
    mutationFn: (id: string) => personnelApi.deleteWorker(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workers"] }),
  });

  const filtered = useMemo(() => {
    return workers.filter((w) =>
      `${w.first_name} ${w.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [workers, search]);

  const [metrics, setMetrics] = useState<
    Record<string, WorkerWithTotals["totals"] & WorkerWithTotals["assignments"]>
  >({});

  const loadMetrics = async (workerId: string) => {
    setMetrics((prev) => ({
      ...prev,
      [workerId]: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        overtime: 0,
        projects: 0,
        work_orders_assigned: 0,
        work_orders_completed: 0,
      },
    }));
    const m = await personnelApi.getWorkerMetrics(workerId);
    setMetrics((prev) => ({ ...prev, [workerId]: m }));
  };

  const openTimeDialog = (w: Worker) => {
    setSelected(w);
    setTimeForm({ ...timeForm, worker_id: w.worker_id });
    setTimeDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-3xl font-bold">Personnel</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={async (e) => {
              if (e.target.files?.[0]) await handleImportCSV(e.target.files[0]);
              e.currentTarget.value = "";
            }}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" /> Export Workers
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleExportWorkersPDF}
                >
                  📄 Export as PDF
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleExportWorkersCSV}
                >
                  📊 Export as CSV
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" /> Export Time Entries
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleExportTimeEntriesPDF}
                >
                  📄 Export as PDF
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleExportTimeEntriesCSV}
                >
                  📊 Export as CSV
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" /> Import CSV
          </Button>
          <Input
            placeholder="Search workers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button
            onClick={() => {
              setWorkerForm({
                first_name: "",
                last_name: "",
                email: null,
                phone: null,
                home_address: null,
                position_applying_for: null,
                role: null,
                hire_date: null,
                is_active: true,
              });
              setAddWorkerDialogOpen(true);
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" /> Quick Add
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="floating-toolbar overflow-x-auto">
          <TabsTrigger
            value="list"
            className="pill-tab text-sm font-semibold"
          >
            Workers
          </TabsTrigger>
          <TabsTrigger
            value="time"
            className="pill-tab text-sm font-semibold"
          >
            Time Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5}>Loading...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>No workers found.</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((w) => (
                    <TableRow key={w.worker_id}>
                      <TableCell className="font-medium">
                        {w.first_name} {w.last_name}
                      </TableCell>
                      <TableCell>{w.role || "-"}</TableCell>
                      <TableCell>{w.email || w.phone || "-"}</TableCell>
                      <TableCell>
                        {w.hire_date
                          ? new Date(w.hire_date).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openTimeDialog(w)}
                        >
                          <Calendar className="h-4 w-4 mr-1" /> Time
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingWorkerId(w.worker_id);
                            setWorkerForm({
                              first_name: w.first_name,
                              last_name: w.last_name,
                              email: w.email,
                              phone: w.phone,
                              home_address: w.home_address,
                              position_applying_for: w.position_applying_for,
                              role: w.role,
                              hire_date: w.hire_date,
                              is_active: w.is_active ?? true,
                              subcontractor_id: w.subcontractor_id,
                              personal_id_document_id: w.personal_id_document_id,
                            });
                            setAddWorkerDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            deleteWorkerMutation.mutate(w.worker_id)
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="time">
          <div className="flex items-center gap-3 mb-3">
            <DatePickerWithRange date={range} setDate={setRange} />
          </div>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Daily</TableHead>
                  <TableHead>Weekly</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>WOs Assigned</TableHead>
                  <TableHead>WOs Completed</TableHead>
                  <TableHead>Trend (7d)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((w) => (
                  <TableRow key={w.worker_id}>
                    <TableCell className="font-medium">
                      {w.first_name} {w.last_name}
                    </TableCell>
                    <TableCell>{metrics[w.worker_id]?.daily ?? "-"}</TableCell>
                    <TableCell>{metrics[w.worker_id]?.weekly ?? "-"}</TableCell>
                    <TableCell>
                      {metrics[w.worker_id]?.monthly ?? "-"}
                    </TableCell>
                    <TableCell>
                      {metrics[w.worker_id]?.overtime ?? "-"}
                    </TableCell>
                    <TableCell>
                      {metrics[w.worker_id]?.projects ?? "-"}
                    </TableCell>
                    <TableCell>
                      {metrics[w.worker_id]?.work_orders_assigned ?? "-"}
                    </TableCell>
                    <TableCell>
                      {metrics[w.worker_id]?.work_orders_completed ?? "-"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadMetrics(w.worker_id)}
                      >
                        <TimerReset className="h-4 w-4 mr-1" /> Refresh
                      </Button>
                      <div className="inline-block mr-2 align-middle">
                        <Sparkline data={sparkData.current[w.worker_id]} />
                      </div>
                      <Button
                        size="sm"
                        onClick={async () => {
                          await loadSpark(w.worker_id);
                          await loadMetrics(w.worker_id);
                          openTimeDialog(w);
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" /> Add Time
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isTimeDialogOpen} onOpenChange={setTimeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add Time Entry{" "}
              {selected
                ? `for ${selected.first_name} ${selected.last_name}`
                : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Date</Label>
              <Input
                type="datetime-local"
                value={new Date(timeForm.date).toISOString().slice(0, 16)}
                onChange={(e) =>
                  setTimeForm({
                    ...timeForm,
                    date: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </div>
            <div>
              <Label>Hours</Label>
              <Input
                type="number"
                min={0}
                step={0.25}
                value={timeForm.hours}
                onChange={(e) =>
                  setTimeForm({ ...timeForm, hours: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Project (optional)</Label>
              <Combobox
                items={projects.map((p) => ({
                  value: p.project_id,
                  label: p.project_name,
                }))}
                value={timeForm.project_id ?? ""}
                onChange={(pid) => onSelectProject(pid)}
                placeholder="Select project"
                ariaLabel="Project"
              />
            </div>
            <div>
              <Label>Work Order (optional)</Label>
              <Combobox
                items={workOrders.map((w) => ({
                  value: w.work_order_id,
                  label: w.description,
                }))}
                value={timeForm.work_order_id ?? ""}
                onChange={(wid) =>
                  setTimeForm({ ...timeForm, work_order_id: wid || null })
                }
                placeholder="Select work order"
                ariaLabel="Work Order"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={timeForm.notes ?? ""}
                onChange={(e) =>
                  setTimeForm({ ...timeForm, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => addTimeMutation.mutate(timeForm)}
              disabled={addTimeMutation.isPending}
            >
              {addTimeMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddWorkerDialogOpen}
        onOpenChange={setAddWorkerDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Worker</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>First Name *</Label>
              <Input
                placeholder="Enter first name"
                value={workerForm.first_name}
                onChange={(e) =>
                  setWorkerForm({ ...workerForm, first_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                placeholder="Enter last name"
                value={workerForm.last_name}
                onChange={(e) =>
                  setWorkerForm({ ...workerForm, last_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter email"
                value={workerForm.email || ""}
                onChange={(e) =>
                  setWorkerForm({
                    ...workerForm,
                    email: e.target.value || null,
                  })
                }
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                placeholder="Enter phone number"
                value={workerForm.phone || ""}
                onChange={(e) =>
                  setWorkerForm({
                    ...workerForm,
                    phone: e.target.value || null,
                  })
                }
              />
            </div>
            <div>
              <Label>Home Address</Label>
              <Input
                placeholder="Enter home address"
                value={workerForm.home_address || ""}
                onChange={(e) =>
                  setWorkerForm({
                    ...workerForm,
                    home_address: e.target.value || null,
                  })
                }
              />
            </div>
            <div>
              <Label>Position Applying For</Label>
              <Input
                placeholder="Enter position"
                value={workerForm.position_applying_for || ""}
                onChange={(e) =>
                  setWorkerForm({
                    ...workerForm,
                    position_applying_for: e.target.value || null,
                  })
                }
              />
            </div>
            <div>
              <Label>Role</Label>
              <Input
                placeholder="Enter role (e.g., Laborer, Electrician)"
                value={workerForm.role || ""}
                onChange={(e) =>
                  setWorkerForm({
                    ...workerForm,
                    role: e.target.value || null,
                  })
                }
              />
            </div>
            <div>
              <Label>Hire Date</Label>
              <Input
                type="date"
                value={
                  workerForm.hire_date
                    ? new Date(workerForm.hire_date).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setWorkerForm({
                    ...workerForm,
                    hire_date: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddWorkerDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!workerForm.first_name || !workerForm.last_name) {
                  alert("First name and last name are required");
                  return;
                }
                if (editingWorkerId) {
                  updateWorkerMutation.mutate({
                    id: editingWorkerId,
                    updates: workerForm,
                  });
                } else {
                  createWorkerMutation.mutate(workerForm);
                }
                setAddWorkerDialogOpen(false);
                setEditingWorkerId(null);
                setWorkerForm(emptyWorkerForm);
              }}
              disabled={
                createWorkerMutation.isPending || updateWorkerMutation.isPending
              }
            >
              {(createWorkerMutation.isPending ||
                updateWorkerMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingWorkerId ? "Save Changes" : "Add Worker"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
