import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  Save, 
  RotateCcw 
} from 'lucide-react';
import { format } from 'date-fns';
import { ProjectData } from '@/services/api';

// Define filter types
export interface ProjectFilters {
  search: string;
  status: string[];
  priority: string[];
  category: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  budgetRange: {
    min: number | undefined;
    max: number | undefined;
  };
  client: string[];
  tags: string[];
}

// Define props
interface ProjectFiltersProps {
  onFilterChange: (filters: ProjectFilters) => void;
  projects: ProjectData[];
  savedFilters: SavedFilter[];
  onSaveFilter: (filter: SavedFilter) => void;
}

// Define saved filter type
export interface SavedFilter {
  id: string;
  name: string;
  filters: ProjectFilters;
}

// Default filters
const defaultFilters: ProjectFilters = {
  search: '',
  status: [],
  priority: [],
  category: [],
  dateRange: {
    from: undefined,
    to: undefined,
  },
  budgetRange: {
    min: undefined,
    max: undefined,
  },
  client: [],
  tags: [],
};

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ 
  onFilterChange, 
  projects, 
  savedFilters, 
  onSaveFilter 
}) => {
  // State for filters
  const [filters, setFilters] = useState<ProjectFilters>(defaultFilters);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [isSaveFilterOpen, setIsSaveFilterOpen] = useState(false);

  // Extract unique values from projects for filter options
  const statuses = [...new Set(projects.map(p => p.status).filter(Boolean) as string[])];
  const priorities = [...new Set(projects.map(p => p.priority).filter(Boolean) as string[])];
  const categories = [...new Set(projects.map(p => p.category).filter(Boolean) as string[])];
  const clients = [...new Set(projects.map(p => p.client_name).filter(Boolean) as string[])];
  
  // Collect all tags from all projects
  const allTags = projects.reduce((acc: string[], project) => {
    if (project.tags && project.tags.length > 0) {
      return [...acc, ...project.tags];
    }
    return acc;
  }, []);
  const uniqueTags = [...new Set(allTags)];

  // Handle filter changes
  const handleFilterChange = (key: keyof ProjectFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Handle multi-select filters (status, priority, etc.)
  const toggleArrayFilter = (key: keyof ProjectFilters, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    handleFilterChange(key, newValues);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  // Save current filter
  const saveCurrentFilter = () => {
    if (!newFilterName.trim()) return;
    
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: newFilterName,
      filters: { ...filters },
    };
    
    onSaveFilter(newFilter);
    setNewFilterName('');
    setIsSaveFilterOpen(false);
  };

  // Load a saved filter
  const loadSavedFilter = (filter: SavedFilter) => {
    setFilters(filter.filters);
    onFilterChange(filter.filters);
  };

  // Quick filter toggles
  const applyQuickFilter = (type: 'current' | 'overdue' | 'upcoming') => {
    let newFilters = { ...defaultFilters };
    const today = new Date();
    
    if (type === 'current') {
      newFilters.status = ['In Progress'];
    } else if (type === 'overdue') {
      newFilters.dateRange.to = today;
      // Filter for projects with end dates in the past
    } else if (type === 'upcoming') {
      newFilters.status = ['Planning', 'Pending'];
      // Filter for projects starting soon
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-lg">
      {/* Search and quick actions row */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full"
          />
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => applyQuickFilter('current')}
        >
          Current
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => applyQuickFilter('overdue')}
        >
          Overdue
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => applyQuickFilter('upcoming')}
        >
          Upcoming
        </Button>
        
        <Button 
          variant={isAdvancedOpen ? "default" : "outline"} 
          size="sm"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={resetFilters}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Active filters display */}
      {(filters.status.length > 0 || 
        filters.priority.length > 0 || 
        filters.category.length > 0 || 
        filters.client.length > 0 ||
        filters.tags.length > 0 ||
        filters.dateRange.from ||
        filters.dateRange.to ||
        filters.budgetRange.min ||
        filters.budgetRange.max) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Active filters:</span>
          
          {filters.status.map(status => (
            <Badge key={`status-${status}`} variant="outline" className="flex items-center gap-1">
              Status: {status}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('status', status)} 
              />
            </Badge>
          ))}
          
          {filters.priority.map(priority => (
            <Badge key={`priority-${priority}`} variant="outline" className="flex items-center gap-1">
              Priority: {priority}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('priority', priority)} 
              />
            </Badge>
          ))}
          
          {filters.category.map(category => (
            <Badge key={`category-${category}`} variant="outline" className="flex items-center gap-1">
              Category: {category}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('category', category)} 
              />
            </Badge>
          ))}
          
          {filters.client.map(client => (
            <Badge key={`client-${client}`} variant="outline" className="flex items-center gap-1">
              Client: {client}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('client', client)} 
              />
            </Badge>
          ))}
          
          {filters.tags.map(tag => (
            <Badge key={`tag-${tag}`} variant="outline" className="flex items-center gap-1">
              Tag: {tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('tags', tag)} 
              />
            </Badge>
          ))}
          
          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="outline" className="flex items-center gap-1">
              Date: {filters.dateRange.from ? format(filters.dateRange.from, 'PP') : 'Any'} - 
              {filters.dateRange.to ? format(filters.dateRange.to, 'PP') : 'Any'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('dateRange', { from: undefined, to: undefined })} 
              />
            </Badge>
          )}
          
          {(filters.budgetRange.min || filters.budgetRange.max) && (
            <Badge variant="outline" className="flex items-center gap-1">
              Budget: ${filters.budgetRange.min || 0} - ${filters.budgetRange.max || '∞'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('budgetRange', { min: undefined, max: undefined })} 
              />
            </Badge>
          )}
        </div>
      )}

      {/* Advanced filters panel */}
      {isAdvancedOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-white">
          {/* Status filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-1">
              {statuses.map(status => (
                <Badge 
                  key={`status-option-${status}`}
                  variant={filters.status.includes(status) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('status', status)}
                >
                  {status}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Priority filter */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex flex-wrap gap-1">
              {priorities.map(priority => (
                <Badge 
                  key={`priority-option-${priority}`}
                  variant={filters.priority.includes(priority) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('priority', priority)}
                >
                  {priority}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Category filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-1">
              {categories.map(category => (
                <Badge 
                  key={`category-option-${category}`}
                  variant={filters.category.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('category', category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Client filter */}
          <div className="space-y-2">
            <Label>Client</Label>
            <Select
              onValueChange={(value) => toggleArrayFilter('client', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={`client-option-${client}`} value={client}>
                    {client}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date range filter */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {filters.dateRange.from ? format(filters.dateRange.from, 'PP') : 'Start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from}
                    onSelect={(date) => handleFilterChange('dateRange', { ...filters.dateRange, from: date })}
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {filters.dateRange.to ? format(filters.dateRange.to, 'PP') : 'End date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to}
                    onSelect={(date) => handleFilterChange('dateRange', { ...filters.dateRange, to: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Budget range filter */}
          <div className="space-y-2">
            <Label>Budget Range</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={filters.budgetRange.min || ''}
                onChange={(e) => handleFilterChange('budgetRange', { 
                  ...filters.budgetRange, 
                  min: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="flex-1"
              />
              <span>-</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.budgetRange.max || ''}
                onChange={(e) => handleFilterChange('budgetRange', { 
                  ...filters.budgetRange, 
                  max: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="flex-1"
              />
            </div>
          </div>
          
          {/* Tags filter */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1">
              {uniqueTags.map(tag => (
                <Badge 
                  key={`tag-option-${tag}`}
                  variant={filters.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('tags', tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Save filter */}
          <div className="space-y-2 col-span-full">
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsSaveFilterOpen(!isSaveFilterOpen)}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Filter
              </Button>
              
              {savedFilters.length > 0 && (
                <Select
                  onValueChange={(value) => {
                    const filter = savedFilters.find(f => f.id === value);
                    if (filter) loadSavedFilter(filter);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Load saved filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedFilters.map(filter => (
                      <SelectItem key={filter.id} value={filter.id}>
                        {filter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {isSaveFilterOpen && (
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Filter name"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={saveCurrentFilter}>Save</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;
