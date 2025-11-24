import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Search,
  ArrowUpDown,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  Filter,
  MapPin,
  Tag,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PaymentItemData, LocationData } from "@/types/paymentItem";
import { getPaymentItems, getLocations } from "@/services/paymentItemsApi";
import { getWorkOrders, WorkOrderData } from "@/services/api";
import BasicEditPaymentItemButton from "./BasicEditPaymentItemButton";
import MobileTable from "@/components/ui/mobile-table";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentItemsTableProps {
  workOrderId?: number;
  locationId?: number;
  projectId?: string | number; // Support both UUID strings and legacy numbers
  onEditItem?: (item: PaymentItemData) => void;
  onViewItem?: (item: PaymentItemData) => void;
  onDeleteItem?: (item: PaymentItemData) => void;
}

const PaymentItemsTable: React.FC<PaymentItemsTableProps> = ({
  workOrderId,
  locationId,
  projectId,
  onEditItem,
  onViewItem,
  onDeleteItem,
}) => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState<number | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [workOrderFilter, setWorkOrderFilter] = useState<number | "all">("all");
  const [dateFromFilter, setDateFromFilter] = useState<Date | undefined>(
    undefined
  );
  const [dateToFilter, setDateToFilter] = useState<Date | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<string>("line_number");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch payment items
  const {
    data: paymentItems,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery<PaymentItemData[]>({
    queryKey: ["paymentItems", workOrderId, locationId, projectId],
    queryFn: () => {
      console.log("Fetching payment items with filters:", {
        workOrderId,
        locationId,
        projectId,
      });
      return getPaymentItems({ workOrderId, locationId, projectId });
    },
  });

  // Fetch locations for filtering
  const {
    data: locations,
    isLoading: isLoadingLocations,
    error: locationsError,
  } = useQuery<LocationData[]>({
    queryKey: ["locations", projectId],
    queryFn: () => getLocations({ projectId }),
    enabled: !!projectId, // Only fetch locations if projectId is provided
  });

  // Fetch work orders for filtering
  const {
    data: workOrders,
    isLoading: isLoadingWorkOrders,
    error: workOrdersError,
  } = useQuery({
    queryKey: ["workOrders", projectId],
    queryFn: () => getWorkOrders(projectId || 0),
    enabled: !!projectId, // Only fetch work orders if projectId is provided
  });

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort payment items
  const filteredItems = React.useMemo(() => {
    if (!paymentItems) return [];

    return paymentItems
      .filter((item) => {
        // Search filter
        const searchMatch =
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.item_code &&
            item.item_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
          false;

        // Status filter
        const statusMatch =
          statusFilter === "all" || item.status === statusFilter;

        // Location filter
        const locationMatch =
          locationFilter === "all" || item.location_id === locationFilter;

        // Category filter
        const categoryMatch =
          categoryFilter === "all" ||
          (item.category &&
            item.category.toUpperCase() === categoryFilter.toUpperCase());

        // Work order filter
        const workOrderMatch =
          workOrderFilter === "all" || item.work_order_id === workOrderFilter;

        // Date range filter
        let dateMatch = true;
        if (dateFromFilter) {
          const itemDate = new Date(item.created_at);
          dateMatch = dateMatch && itemDate >= dateFromFilter;
        }
        if (dateToFilter) {
          const itemDate = new Date(item.created_at);
          dateMatch = dateMatch && itemDate <= dateToFilter;
        }

        return (
          searchMatch &&
          statusMatch &&
          locationMatch &&
          categoryMatch &&
          workOrderMatch &&
          dateMatch
        );
      })
      .sort((a, b) => {
        // Sort by field
        let comparison = 0;

        if (sortField === "line_number") {
          comparison = (a.line_number || "") > (b.line_number || "") ? 1 : -1;
        } else if (sortField === "description") {
          comparison = a.description > b.description ? 1 : -1;
        } else if (sortField === "original_quantity") {
          comparison = (a.original_quantity || 0) - (b.original_quantity || 0);
        } else if (sortField === "actual_quantity") {
          comparison = (a.actual_quantity || 0) - (b.actual_quantity || 0);
        } else if (sortField === "unit_price") {
          comparison = (a.unit_price || 0) - (b.unit_price || 0);
        } else if (sortField === "total_price") {
          comparison = (a.total_price || 0) - (b.total_price || 0);
        } else if (sortField === "status") {
          comparison = (a.status || "") > (b.status || "") ? 1 : -1;
        }

        // Apply sort direction
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [
    paymentItems,
    searchTerm,
    statusFilter,
    locationFilter,
    categoryFilter,
    workOrderFilter,
    dateFromFilter,
    dateToFilter,
    sortField,
    sortDirection,
  ]);

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      case "in_progress":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            <Clock className="h-3 w-3 mr-1" /> In Progress
          </Badge>
        );
      case "in_review":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            <Clock className="h-3 w-3 mr-1" /> In Review
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-300"
          >
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  // Get approval status indicators
  const getApprovalStatus = (status: string | undefined) => {
    if (!status) return null;

    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  if (isLoadingItems) {
    return <div>Loading payment items...</div>;
  }

  if (itemsError) {
    return <div>Error loading payment items</div>;
  }

  // Define mobile table columns and actions
  const renderMobileTable = () => {
    return (
      <MobileTable
        data={filteredItems}
        keyExtractor={(item) => item.item_id}
        emptyMessage="No payment items found"
        onRowClick={onViewItem}
        columns={[
          {
            id: "description",
            header: "Description",
            cell: (item) => (
              <span className="font-medium">{item.description}</span>
            ),
          },
          {
            id: "location",
            header: "Location",
            cell: (item) => (
              <div className="flex items-center justify-end">
                <MapPin className="h-3 w-3 mr-1 inline" />
                <span>
                  {item.location_id && locations
                    ? locations.find(
                        (loc) => loc.location_id === item.location_id
                      )?.name || "-"
                    : "-"}
                </span>
              </div>
            ),
          },
          {
            id: "category",
            header: "Category",
            cell: (item) => (
              <div className="flex items-center justify-end">
                <Tag className="h-3 w-3 mr-1 inline" />
                <span>{item.category || "-"}</span>
              </div>
            ),
          },
          {
            id: "price",
            header: "Price",
            cell: (item) => (
              <span className="font-medium">
                ${(item.total_price || 0).toFixed(2)}
              </span>
            ),
          },
          {
            id: "status",
            header: "Status",
            cell: (item) => getStatusBadge(item.status),
          },
        ]}
        renderActions={(item) => (
          <div className="flex justify-end gap-2">
            {onEditItem && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEditItem(item);
                }}
                title="Edit item"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDeleteItem && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteItem(item);
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                title="Delete item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payment items..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-gray-200" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div
            className={`grid grid-cols-1 ${
              isMobile ? "" : "md:grid-cols-3"
            } gap-4 pt-4 border-t border-gray-200`}
          >
            {/* Location Filter */}
            {locations && locations.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-1 block">
                  <MapPin className="h-4 w-4 inline-block mr-1" /> Location
                </label>
                <Select
                  value={locationFilter.toString()}
                  onValueChange={(value) =>
                    setLocationFilter(value === "all" ? "all" : parseInt(value))
                  }
                >
                  <SelectTrigger className={isMobile ? "h-10" : ""}>
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem
                        key={location.location_id}
                        value={location.location_id.toString()}
                      >
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                <Tag className="h-4 w-4 inline-block mr-1" /> Category
              </label>
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value)}
              >
                <SelectTrigger className={isMobile ? "h-10" : ""}>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                  <SelectItem value="PLUMBING">Plumbing</SelectItem>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="INSULATION">Insulation</SelectItem>
                  <SelectItem value="WALLS & CEILINGS">
                    Walls & Ceilings
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Work Order Filter */}
            {workOrders && workOrders.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Work Order
                </label>
                <Select
                  value={workOrderFilter.toString()}
                  onValueChange={(value) =>
                    setWorkOrderFilter(
                      value === "all" ? "all" : parseInt(value)
                    )
                  }
                >
                  <SelectTrigger className={isMobile ? "h-10" : ""}>
                    <SelectValue placeholder="Select Work Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Work Orders</SelectItem>
                    {workOrders.map((workOrder: WorkOrderData) => {
                      const idValue = workOrder.work_order_id ?? "";
                      return (
                        <SelectItem
                          key={idValue?.toString()}
                          value={idValue?.toString()}
                        >
                          {workOrder.work_order_number || workOrder.description}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium mb-1 block">
                Date Range
              </label>
              <div className={`flex ${isMobile ? "flex-col" : ""} gap-2`}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`${
                        isMobile ? "h-10" : ""
                      } w-full justify-start text-left font-normal`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFromFilter ? (
                        format(dateFromFilter, "PPP")
                      ) : (
                        <span>From Date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFromFilter}
                      onSelect={setDateFromFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`${
                        isMobile ? "h-10 mt-2" : ""
                      } w-full justify-start text-left font-normal`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateToFilter ? (
                        format(dateToFilter, "PPP")
                      ) : (
                        <span>To Date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateToFilter}
                      onSelect={setDateToFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Reset Filters Button */}
            <div
              className={`${isMobile ? "" : "md:col-span-3"} flex ${
                isMobile ? "justify-center mt-4" : "justify-end"
              }`}
            >
              <Button
                variant="outline"
                className={isMobile ? "w-full h-10" : ""}
                onClick={() => {
                  setLocationFilter("all");
                  setCategoryFilter("all");
                  setWorkOrderFilter("all");
                  setDateFromFilter(undefined);
                  setDateToFilter(undefined);
                  setStatusFilter("all");
                  setSearchTerm("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Items Table */}
      {isMobile ? (
        /* Mobile Table View */
        <MobileTable
          data={filteredItems}
          keyExtractor={(item) => item.item_id}
          emptyMessage="No payment items found"
          onRowClick={onViewItem}
          columns={[
            {
              id: "description",
              header: "Description",
              cell: (item) => (
                <span className="font-medium">{item.description}</span>
              ),
            },
            {
              id: "location",
              header: "Location",
              cell: (item) => (
                <div className="flex items-center justify-end">
                  <MapPin className="h-3 w-3 mr-1 inline" />
                  <span>
                    {item.location_id && locations
                      ? locations.find(
                          (loc) => loc.location_id === item.location_id
                        )?.name || "-"
                      : "-"}
                  </span>
                </div>
              ),
            },
            {
              id: "category",
              header: "Category",
              cell: (item) => (
                <div className="flex items-center justify-end">
                  <Tag className="h-3 w-3 mr-1 inline" />
                  <span>{item.category || "-"}</span>
                </div>
              ),
            },
            {
              id: "price",
              header: "Price",
              cell: (item) => (
                <span className="font-medium">
                  ${(item.total_price || 0).toFixed(2)}
                </span>
              ),
            },
            {
              id: "status",
              header: "Status",
              cell: (item) => getStatusBadge(item.status),
            },
          ]}
          renderActions={(item) => (
            <div className="flex justify-end gap-2">
              {onEditItem && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditItem(item);
                  }}
                  title="Edit item"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDeleteItem && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteItem(item);
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Delete item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        />
      ) : (
        /* Desktop Table View */
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("line_number")}
                >
                  <div className="flex items-center">
                    Line #
                    {sortField === "line_number" && (
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("description")}
                >
                  <div className="flex items-center">
                    Description
                    {sortField === "description" && (
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" /> Location
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" /> Category
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right"
                  onClick={() => handleSort("original_quantity")}
                >
                  <div className="flex items-center justify-end">
                    Original Qty
                    {sortField === "original_quantity" && (
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right"
                  onClick={() => handleSort("unit_price")}
                >
                  <div className="flex items-center justify-end">
                    Unit Price
                    {sortField === "unit_price" && (
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right"
                  onClick={() => handleSort("total_price")}
                >
                  <div className="flex items-center justify-end">
                    Total
                    {sortField === "total_price" && (
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === "status" && (
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    No payment items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow
                    key={item.item_id}
                    className={
                      item.status === "approved" || item.status === "completed"
                        ? "bg-green-50"
                        : item.status === "rejected"
                        ? "bg-red-50"
                        : ""
                    }
                  >
                    <TableCell>{item.line_number || "-"}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      {item.location_id && locations
                        ? locations.find(
                            (loc) => loc.location_id === item.location_id
                          )?.name || "-"
                        : "-"}
                    </TableCell>
                    <TableCell>{item.category || "-"}</TableCell>
                    <TableCell className="text-right">
                      {item.original_quantity} {item.unit_of_measure}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.unit_price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${(item.total_price || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onViewItem && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewItem(item)}
                            title="View details"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        {onEditItem && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log(
                                "Edit button clicked in table for item:",
                                item.item_id
                              );
                              onEditItem(item);
                            }}
                            title="Edit item"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDeleteItem && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteItem(item)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PaymentItemsTable;
