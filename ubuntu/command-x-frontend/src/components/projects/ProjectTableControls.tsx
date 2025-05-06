import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectData } from '@/services/api';
import { 
  Columns, 
  Download, 
  FileText, 
  Save, 
  Settings, 
  Table as TableIcon 
} from 'lucide-react';

// Available columns for the project table
export const availableColumns = [
  { id: 'name', label: 'Name', default: true },
  { id: 'location', label: 'Location', default: true },
  { id: 'client', label: 'Client', default: true },
  { id: 'status', label: 'Status', default: true },
  { id: 'priority', label: 'Priority', default: false },
  { id: 'category', label: 'Category', default: false },
  { id: 'progress', label: 'Progress', default: false },
  { id: 'start_date', label: 'Start Date', default: true },
  { id: 'end_date', label: 'End Date', default: true },
  { id: 'budget', label: 'Budget', default: true },
  { id: 'manager', label: 'Manager', default: false },
  { id: 'tags', label: 'Tags', default: false },
];

// View configuration interface
export interface ViewConfig {
  id: string;
  name: string;
  columns: string[];
}

interface ProjectTableControlsProps {
  projects: ProjectData[];
  activeColumns: string[];
  onColumnsChange: (columns: string[]) => void;
  savedViews: ViewConfig[];
  onSaveView: (view: ViewConfig) => void;
  onLoadView: (view: ViewConfig) => void;
}

const ProjectTableControls: React.FC<ProjectTableControlsProps> = ({
  projects,
  activeColumns,
  onColumnsChange,
  savedViews,
  onSaveView,
  onLoadView
}) => {
  const [isSaveViewDialogOpen, setIsSaveViewDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [exportColumns, setExportColumns] = useState<string[]>(activeColumns);

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    if (activeColumns.includes(columnId)) {
      // Don't allow removing the last column
      if (activeColumns.length > 1) {
        onColumnsChange(activeColumns.filter(id => id !== columnId));
      }
    } else {
      onColumnsChange([...activeColumns, columnId]);
    }
  };

  // Save current view
  const saveCurrentView = () => {
    if (!newViewName.trim()) return;
    
    const newView: ViewConfig = {
      id: Date.now().toString(),
      name: newViewName,
      columns: [...activeColumns],
    };
    
    onSaveView(newView);
    setNewViewName('');
    setIsSaveViewDialogOpen(false);
  };

  // Toggle export column
  const toggleExportColumn = (columnId: string) => {
    if (exportColumns.includes(columnId)) {
      setExportColumns(exportColumns.filter(id => id !== columnId));
    } else {
      setExportColumns([...exportColumns, columnId]);
    }
  };

  // Export data
  const exportData = () => {
    // Get column labels for header row
    const headers = availableColumns
      .filter(col => exportColumns.includes(col.id))
      .map(col => col.label);
    
    // Prepare data rows
    const rows = projects.map(project => {
      const row: Record<string, any> = {};
      
      exportColumns.forEach(colId => {
        switch (colId) {
          case 'name':
            row['Name'] = project.project_name;
            break;
          case 'location':
            row['Location'] = project.location || '';
            break;
          case 'client':
            row['Client'] = project.client_name || '';
            break;
          case 'status':
            row['Status'] = project.status || '';
            break;
          case 'priority':
            row['Priority'] = project.priority || '';
            break;
          case 'category':
            row['Category'] = project.category || '';
            break;
          case 'progress':
            row['Progress'] = `${project.progress_percentage || 0}%`;
            break;
          case 'start_date':
            row['Start Date'] = project.start_date 
              ? new Date(project.start_date).toLocaleDateString() 
              : '';
            break;
          case 'end_date':
            row['End Date'] = project.end_date 
              ? new Date(project.end_date).toLocaleDateString() 
              : '';
            break;
          case 'budget':
            row['Budget'] = project.budget 
              ? `$${project.budget.toLocaleString()}` 
              : '';
            break;
          case 'manager':
            row['Manager'] = project.manager_name || '';
            break;
          case 'tags':
            row['Tags'] = project.tags?.join(', ') || '';
            break;
        }
      });
      
      return row;
    });
    
    if (exportFormat === 'csv') {
      // Generate CSV
      const headerRow = headers.join(',');
      const dataRows = rows.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      );
      const csv = [headerRow, ...dataRows].join('\n');
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projects_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'excel') {
      // For Excel, we'd typically use a library like xlsx
      // This is a simplified version that creates a CSV with Excel mime type
      const headerRow = headers.join(',');
      const dataRows = rows.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      );
      const csv = [headerRow, ...dataRows].join('\n');
      
      const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projects_export_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'pdf') {
      // For PDF, we'd typically use a library like jsPDF
      alert('PDF export would be implemented here with a library like jsPDF');
    }
    
    setIsExportDialogOpen(false);
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableColumns.map(column => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={activeColumns.includes(column.id)}
                onCheckedChange={() => toggleColumn(column.id)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <TableIcon className="h-4 w-4 mr-2" />
              Views
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Saved Views</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {savedViews.map(view => (
              <DropdownMenuCheckboxItem
                key={view.id}
                checked={false}
                onCheckedChange={() => onLoadView(view)}
              >
                {view.name}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={false}
              onCheckedChange={() => setIsSaveViewDialogOpen(true)}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Current View
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsExportDialogOpen(true)}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Save View Dialog */}
      <Dialog open={isSaveViewDialogOpen} onOpenChange={setIsSaveViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save View</DialogTitle>
            <DialogDescription>
              Save your current column configuration as a custom view.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="view-name">View Name</Label>
            <Input
              id="view-name"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="My Custom View"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveViewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCurrentView}>Save View</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Projects</DialogTitle>
            <DialogDescription>
              Select the format and columns to include in your export.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>Export Format</Label>
              <div className="flex gap-2 mt-1">
                <Button 
                  variant={exportFormat === 'csv' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setExportFormat('csv')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button 
                  variant={exportFormat === 'excel' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setExportFormat('excel')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button 
                  variant={exportFormat === 'pdf' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setExportFormat('pdf')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Columns to Include</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {availableColumns.map(column => (
                  <div key={column.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`export-${column.id}`}
                      checked={exportColumns.includes(column.id)}
                      onChange={() => toggleExportColumn(column.id)}
                      className="mr-2"
                    />
                    <Label htmlFor={`export-${column.id}`} className="text-sm">
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={exportData}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectTableControls;
