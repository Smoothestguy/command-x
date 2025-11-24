import React, { useState } from "react";
import { ProjectData } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectData;
}

const ReportIssueDialog: React.FC<ReportIssueDialogProps> = ({
  open,
  onOpenChange,
  project,
}) => {
  const [issueData, setIssueData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    category: "General",
  });

  const handleSubmit = () => {
    // Handle issue submission
    console.log("Reporting issue for project:", project.project_id, issueData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Issue</DialogTitle>
          <DialogDescription>
            Report an issue for project {project.project_name}. Provide as much
            detail as possible.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={issueData.title}
              onChange={(e) =>
                setIssueData({ ...issueData, title: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Priority
            </Label>
            <Select
              value={issueData.priority}
              onValueChange={(value) =>
                setIssueData({ ...issueData, priority: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select
              value={issueData.category}
              onValueChange={(value) =>
                setIssueData({ ...issueData, category: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Safety">Safety</SelectItem>
                <SelectItem value="Quality">Quality</SelectItem>
                <SelectItem value="Schedule">Schedule</SelectItem>
                <SelectItem value="Budget">Budget</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={issueData.description}
              onChange={(e) =>
                setIssueData({ ...issueData, description: e.target.value })
              }
              className="col-span-3"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Report Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportIssueDialog;
