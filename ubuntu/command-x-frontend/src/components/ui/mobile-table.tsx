import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";

interface MobileTableProps<T> {
  data: T[];
  columns: {
    id: string;
    header: string;
    cell: (item: T) => React.ReactNode;
    className?: string;
  }[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  renderActions?: (item: T) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
}

export function MobileTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  renderActions,
  className,
  emptyMessage = "No data available",
}: MobileTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {data.map((item) => (
        <Card
          key={keyExtractor(item)}
          className={cn(
            "overflow-hidden",
            onRowClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
          )}
          onClick={onRowClick ? () => onRowClick(item) : undefined}
        >
          <CardContent className="p-0">
            <div className="grid grid-cols-1 divide-y">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className={cn("flex justify-between p-3", column.className)}
                >
                  <div className="font-medium text-sm text-gray-500">
                    {column.header}
                  </div>
                  <div className="text-right">{column.cell(item)}</div>
                </div>
              ))}
              {renderActions && (
                <div className="p-3 flex justify-end">
                  {renderActions(item)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default MobileTable;
