import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  Eye,
  Trash2,
  Upload,
  Search,
  FolderPlus,
  Loader2,
  Folder,
  ChevronRight,
  Home,
  FileText,
  FileCheck,
  Image,
  BarChart,
  Calendar,
  Clock,
  Filter,
  SlidersHorizontal,
  MoreHorizontal,
  Star,
  StarHalf,
  Info,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  FileIcon,
  Share2,
  Copy,
  Edit,
  History,
  Tag,
  Tags,
  Users,
  User,
  Bookmark,
} from "lucide-react";
import { DocumentData } from "@/services/api";
import { formatFileSize, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock document data for each category
const mockDocuments: Record<string, DocumentData[]> = {
  "Project Plans": [
    {
      document_id: 1,
      file_name: "Project_Blueprint_v2.pdf",
      file_path: "/documents/project_blueprint_v2.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 1024 * 3.2, // 3.2 MB
      description: "Final blueprint for the main building",
      uploaded_by: 1,
      uploaded_at: "2025-04-15T10:30:00Z",
    },
    {
      document_id: 2,
      file_name: "Construction_Schedule.xlsx",
      file_path: "/documents/construction_schedule.xlsx",
      file_type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      file_size: 1024 * 512, // 512 KB
      description: "Detailed construction timeline and milestones",
      uploaded_by: 1,
      uploaded_at: "2025-04-16T14:45:00Z",
    },
    {
      document_id: 3,
      file_name: "Material_Specifications.docx",
      file_path: "/documents/material_specifications.docx",
      file_type:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      file_size: 1024 * 1024 * 1.5, // 1.5 MB
      description: "Detailed specifications for construction materials",
      uploaded_by: 2,
      uploaded_at: "2025-04-17T09:15:00Z",
    },
  ],
  Contracts: [
    {
      document_id: 4,
      file_name: "Client_Agreement_Smith.pdf",
      file_path: "/documents/client_agreement_smith.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 1024 * 1.8, // 1.8 MB
      description: "Signed client agreement for Smith project",
      uploaded_by: 1,
      uploaded_at: "2025-04-10T11:20:00Z",
    },
    {
      document_id: 5,
      file_name: "Subcontractor_Agreement_Plumbing.pdf",
      file_path: "/documents/subcontractor_agreement_plumbing.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 1024 * 2.1, // 2.1 MB
      description: "Subcontractor agreement for plumbing work",
      uploaded_by: 3,
      uploaded_at: "2025-04-12T16:30:00Z",
    },
  ],
  Invoices: [
    {
      document_id: 6,
      file_name: "Invoice_2025-001.pdf",
      file_path: "/documents/invoice_2025-001.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 512, // 512 KB
      description: "Project invoice for initial payment",
      uploaded_by: 2,
      uploaded_at: "2025-04-20T13:45:00Z",
    },
    {
      document_id: 7,
      file_name: "Receipt_Materials_Phase1.pdf",
      file_path: "/documents/receipt_materials_phase1.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 256, // 256 KB
      description: "Receipt for Phase 1 construction materials",
      uploaded_by: 2,
      uploaded_at: "2025-04-22T10:15:00Z",
    },
  ],
  Permits: [
    {
      document_id: 8,
      file_name: "Building_Permit_2025-123.pdf",
      file_path: "/documents/building_permit_2025-123.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 1024 * 1.2, // 1.2 MB
      description: "Approved building permit from city planning",
      uploaded_by: 1,
      uploaded_at: "2025-04-05T09:30:00Z",
    },
    {
      document_id: 9,
      file_name: "Inspection_Report_Foundation.pdf",
      file_path: "/documents/inspection_report_foundation.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 768, // 768 KB
      description: "Foundation inspection report - Passed",
      uploaded_by: 3,
      uploaded_at: "2025-04-25T15:20:00Z",
    },
  ],
  Photos: [
    {
      document_id: 10,
      file_name: "Site_Preparation.jpg",
      file_path: "/documents/site_preparation.jpg",
      file_type: "image/jpeg",
      file_size: 1024 * 1024 * 2.5, // 2.5 MB
      description: "Site preparation and initial excavation",
      uploaded_by: 4,
      uploaded_at: "2025-04-08T11:45:00Z",
    },
    {
      document_id: 11,
      file_name: "Foundation_Progress.jpg",
      file_path: "/documents/foundation_progress.jpg",
      file_type: "image/jpeg",
      file_size: 1024 * 1024 * 3.1, // 3.1 MB
      description: "Foundation work in progress",
      uploaded_by: 4,
      uploaded_at: "2025-04-18T14:30:00Z",
    },
    {
      document_id: 12,
      file_name: "Site_Conditions_After_Rain.jpg",
      file_path: "/documents/site_conditions_after_rain.jpg",
      file_type: "image/jpeg",
      file_size: 1024 * 1024 * 2.8, // 2.8 MB
      description: "Site conditions after heavy rainfall",
      uploaded_by: 4,
      uploaded_at: "2025-04-23T09:10:00Z",
    },
  ],
  Reports: [
    {
      document_id: 13,
      file_name: "Weekly_Progress_Report_W16.pdf",
      file_path: "/documents/weekly_progress_report_w16.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 1024 * 1.4, // 1.4 MB
      description: "Weekly progress report for week 16",
      uploaded_by: 2,
      uploaded_at: "2025-04-19T17:00:00Z",
    },
    {
      document_id: 14,
      file_name: "Quality_Inspection_Framing.pdf",
      file_path: "/documents/quality_inspection_framing.pdf",
      file_type: "application/pdf",
      file_size: 1024 * 896, // 896 KB
      description: "Quality inspection report for framing work",
      uploaded_by: 3,
      uploaded_at: "2025-04-26T13:15:00Z",
    },
  ],
};

// Document category type
interface DocumentCategory {
  title: string;
  description: string;
  content: string;
}

// Folder type
interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  category: string; // Add category to the folder type
  createdAt: string;
}

// Combined type for documents list
type DocumentOrFolder = DocumentData | Folder;

// Helper function to check if an item is a folder
const isFolder = (item: DocumentOrFolder): item is Folder => {
  return (
    (item as Folder).path !== undefined &&
    (item as Folder).category !== undefined
  );
};

const DocumentsPage: React.FC = () => {
  // State for the selected category and modal visibility
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [documents, setDocuments] =
    useState<Record<string, DocumentData[]>>(mockDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folder-related state - using category-specific structure
  // Change to a nested structure where the first level is the category
  const [foldersByCategory, setFoldersByCategory] = useState<
    Record<string, Record<string, Folder[]>>
  >({});
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderError, setNewFolderError] = useState<string | null>(null);
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] =
    useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);

  // Document categories
  const categories: DocumentCategory[] = [
    {
      title: "Project Plans",
      description: "Project planning documents",
      content: "Contains blueprints, schedules, and project specifications.",
    },
    {
      title: "Contracts",
      description: "Legal documents",
      content: "Client agreements, subcontractor contracts, and legal forms.",
    },
    {
      title: "Invoices",
      description: "Financial documents",
      content: "Project invoices, receipts, and payment records.",
    },
    {
      title: "Permits",
      description: "Regulatory documents",
      content: "Building permits, inspections, and compliance documents.",
    },
    {
      title: "Photos",
      description: "Site documentation",
      content: "Progress photos, site conditions, and visual documentation.",
    },
    {
      title: "Reports",
      description: "Project reports",
      content: "Status reports, quality inspections, and incident reports.",
    },
  ];

  // Handle card click
  const handleCardClick = (category: string) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  // 1. Implement view document functionality
  const handleView = (doc: DocumentData) => {
    console.log(`Viewing document: ${doc.file_name}`);
    // Open document in new tab
    window.open(doc.file_path, "_blank");
  };

  // 2. Implement download functionality
  const handleDownload = (doc: DocumentData) => {
    console.log(`Downloading document: ${doc.file_name}`);

    // Create temporary anchor element
    const anchor = window.document.createElement("a");
    anchor.href = doc.file_path;
    anchor.download = doc.file_name;

    // Set additional attributes
    anchor.style.display = "none";
    window.document.body.appendChild(anchor);

    // Trigger download
    anchor.click();

    // Clean up
    window.document.body.removeChild(anchor);

    // Show success notification
    toast.success(`Downloading ${doc.file_name}`);
  };

  // Document deletion state
  const [isDeleteDocumentDialogOpen, setIsDeleteDocumentDialogOpen] =
    useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentData | null>(
    null
  );

  // 3. Implement delete functionality
  const handleDelete = (doc: DocumentData) => {
    setDocumentToDelete(doc);
    setIsDeleteDocumentDialogOpen(true);
  };

  // Confirm document deletion
  const confirmDeleteDocument = async () => {
    if (!documentToDelete || !selectedCategory) return;

    try {
      // In a real app, this would call the API to delete the document
      // await deleteDocument(documentToDelete.document_id);

      // For demo purposes, we'll update the local state
      const updatedDocs = { ...documents };

      // Check if we're in a folder or at the root level
      if (currentPath.length === 0) {
        // Root level - update the category documents
        updatedDocs[selectedCategory] = updatedDocs[selectedCategory].filter(
          (document) => document.document_id !== documentToDelete.document_id
        );
      } else {
        // In a folder - update the folder documents
        const folderPathKey = `category:${selectedCategory}:${currentPath.join(
          "/"
        )}`;
        if (updatedDocs[folderPathKey]) {
          updatedDocs[folderPathKey] = updatedDocs[folderPathKey].filter(
            (document) => document.document_id !== documentToDelete.document_id
          );
        }
      }

      setDocuments(updatedDocs);

      // Close dialog and show success notification
      setIsDeleteDocumentDialogOpen(false);
      setDocumentToDelete(null);
      toast.success(`${documentToDelete.file_name} has been deleted`);
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(`Failed to delete ${documentToDelete.file_name}`);
    }
  };

  // 4. Implement upload functionality
  const handleUpload = () => {
    // Trigger hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedCategory) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Get current folder path
        const currentFolderPath = getCurrentFolderPath();
        console.log(`Uploading to: ${currentFolderPath}`);

        // Create FormData for upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", selectedCategory);
        formData.append("path", currentPath.join("/"));

        // Simulate upload progress
        const uploadSimulation = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = prev + Math.random() * 10;
            return newProgress > 100 ? 100 : newProgress;
          });
        }, 200);

        // In a real app, this would call the API to upload the document
        // const response = await uploadDocument(formData);

        // Get file type icon/preview based on mime type
        const getFileTypeInfo = (file: File) => {
          const type = file.type.split("/")[0];
          const extension = file.name.split(".").pop()?.toLowerCase() || "";

          // For images, create a preview URL
          if (type === "image") {
            return {
              isImage: true,
              previewUrl: URL.createObjectURL(file),
            };
          }

          // For other file types, determine the appropriate description
          let fileTypeDescription = "Document";
          if (["pdf"].includes(extension)) {
            fileTypeDescription = "PDF Document";
          } else if (["doc", "docx"].includes(extension)) {
            fileTypeDescription = "Word Document";
          } else if (["xls", "xlsx"].includes(extension)) {
            fileTypeDescription = "Excel Spreadsheet";
          } else if (["ppt", "pptx"].includes(extension)) {
            fileTypeDescription = "PowerPoint Presentation";
          } else if (["txt", "rtf"].includes(extension)) {
            fileTypeDescription = "Text Document";
          } else if (["zip", "rar", "7z"].includes(extension)) {
            fileTypeDescription = "Archive";
          } else if (["mp3", "wav", "ogg"].includes(extension)) {
            fileTypeDescription = "Audio File";
          } else if (["mp4", "avi", "mov", "wmv"].includes(extension)) {
            fileTypeDescription = "Video File";
          }

          return {
            isImage: false,
            fileTypeDescription,
          };
        };

        const fileInfo = getFileTypeInfo(file);

        // For demo purposes, we'll create a new document and add it to the local state
        const newDocument: DocumentData = {
          document_id: Math.floor(Math.random() * 10000),
          file_name: file.name,
          file_path: URL.createObjectURL(file),
          file_type: file.type,
          file_size: file.size,
          description: fileInfo.isImage
            ? `Image uploaded ${
                currentPath.length > 0
                  ? `to folder ${currentPath.join("/")}`
                  : ""
              }`
            : `${fileInfo.fileTypeDescription} uploaded ${
                currentPath.length > 0
                  ? `to folder ${currentPath.join("/")}`
                  : ""
              }`,
          uploaded_by: 1, // Current user ID
          uploaded_at: new Date().toISOString(),
        };

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        clearInterval(uploadSimulation);
        setUploadProgress(100);

        // For this demo, we'll store documents in a special folder path key
        // In a real app, you would have a more sophisticated storage system
        if (currentPath.length > 0) {
          // Create a special key for the current folder path that includes the category
          const folderPathKey = `category:${selectedCategory}:${currentPath.join(
            "/"
          )}`;

          // Create or update the documents for this folder path
          const updatedDocs = { ...documents };
          if (!updatedDocs[folderPathKey]) {
            updatedDocs[folderPathKey] = [];
          }

          // Add the new document to this folder
          updatedDocs[folderPathKey] = [
            newDocument,
            ...updatedDocs[folderPathKey],
          ];
          setDocuments(updatedDocs);

          // Show success notification with folder path
          toast.success(
            `${file.name} uploaded to folder ${currentPath.join(
              "/"
            )} in ${selectedCategory}`
          );
        } else {
          // Add to root category
          const updatedDocs = { ...documents };
          updatedDocs[selectedCategory] = [
            newDocument,
            ...updatedDocs[selectedCategory],
          ];
          setDocuments(updatedDocs);

          // Show success notification
          toast.success(
            `${file.name} uploaded successfully to ${selectedCategory}`
          );
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Filter and sort documents and folders
  const getFilteredAndSortedDocuments = () => {
    if (!selectedCategory) return [];

    const items = getCurrentItems();

    // Filter by search term
    const filtered = searchTerm
      ? items.filter((item) => {
          if (isFolder(item)) {
            return item.name.toLowerCase().includes(searchTerm.toLowerCase());
          } else {
            return (
              item.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (item.description &&
                item.description
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()))
            );
          }
        })
      : items;

    // Sort documents and folders
    return [...filtered].sort((a, b) => {
      // Always show folders first
      if (isFolder(a) && !isFolder(b)) return -1;
      if (!isFolder(a) && isFolder(b)) return 1;

      // Both are folders
      if (isFolder(a) && isFolder(b)) {
        if (sortBy === "name") {
          return sortDirection === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else {
          // Sort by date for folders
          return sortDirection === "asc"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      }

      // Both are documents
      if (!isFolder(a) && !isFolder(b)) {
        if (sortBy === "name") {
          return sortDirection === "asc"
            ? a.file_name.localeCompare(b.file_name)
            : b.file_name.localeCompare(a.file_name);
        } else if (sortBy === "size") {
          return sortDirection === "asc"
            ? a.file_size - b.file_size
            : b.file_size - a.file_size;
        } else {
          // date
          return sortDirection === "asc"
            ? new Date(a.uploaded_at).getTime() -
                new Date(b.uploaded_at).getTime()
            : new Date(b.uploaded_at).getTime() -
                new Date(a.uploaded_at).getTime();
        }
      }

      return 0;
    });
  };

  // Toggle sort direction
  const toggleSort = (column: "name" | "date" | "size") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  // Get current folder path string with category prefix to ensure isolation
  const getCurrentFolderPath = (): string => {
    if (!selectedCategory) return "";
    if (currentPath.length === 0) return `root`;
    return currentPath.join("/");
  };

  // Get folders for the current category and path
  const getCurrentCategoryFolders = (): Folder[] => {
    if (!selectedCategory) return [];

    // Initialize the category if it doesn't exist
    if (!foldersByCategory[selectedCategory]) {
      return [];
    }

    const path = getCurrentFolderPath();
    return foldersByCategory[selectedCategory][path] || [];
  };

  // Handle new folder button click
  const handleNewFolderClick = () => {
    setNewFolderName("");
    setNewFolderError(null);
    setIsNewFolderDialogOpen(true);
  };

  // Validate folder name
  const validateFolderName = (name: string): boolean => {
    if (!name.trim()) {
      setNewFolderError("Folder name cannot be empty");
      return false;
    }

    if (name.length > 255) {
      setNewFolderError("Folder name is too long");
      return false;
    }

    // Check for invalid characters
    const invalidCharsRegex = /[<>:"\/\\|?*\x00-\x1F]/;
    if (invalidCharsRegex.test(name)) {
      setNewFolderError("Folder name contains invalid characters");
      return false;
    }

    // Check if folder with same name already exists in current path
    const currentFolderPath = getCurrentFolderPath();
    const existingFolders =
      selectedCategory &&
      foldersByCategory[selectedCategory] &&
      foldersByCategory[selectedCategory][currentFolderPath]
        ? foldersByCategory[selectedCategory][currentFolderPath]
        : [];

    if (
      existingFolders.some(
        (folder) => folder.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      setNewFolderError("A folder with this name already exists");
      return false;
    }

    return true;
  };

  // Create new folder
  const createNewFolder = () => {
    if (!validateFolderName(newFolderName) || !selectedCategory) {
      return;
    }

    const currentFolderPath = getCurrentFolderPath();
    const parentId =
      currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;

    // Create new path for the folder
    const newFolderPath =
      currentPath.length > 0
        ? [...currentPath, newFolderName].join("/")
        : newFolderName;

    // Create a unique ID that includes the category to ensure uniqueness across categories
    const newFolder: Folder = {
      id: `folder-${selectedCategory}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      name: newFolderName,
      parentId,
      path: newFolderPath,
      category: selectedCategory, // Store the category with the folder
      createdAt: new Date().toISOString(),
    };

    // Update folders state with the new nested structure
    const updatedFoldersByCategory = { ...foldersByCategory };

    // Initialize category if it doesn't exist
    if (!updatedFoldersByCategory[selectedCategory]) {
      updatedFoldersByCategory[selectedCategory] = {};
    }

    // Initialize path if it doesn't exist
    if (!updatedFoldersByCategory[selectedCategory][currentFolderPath]) {
      updatedFoldersByCategory[selectedCategory][currentFolderPath] = [];
    }

    // Add the new folder
    updatedFoldersByCategory[selectedCategory][currentFolderPath] = [
      ...updatedFoldersByCategory[selectedCategory][currentFolderPath],
      newFolder,
    ];

    setFoldersByCategory(updatedFoldersByCategory);

    // Close dialog and show success message
    setIsNewFolderDialogOpen(false);
    toast.success(
      `Folder "${newFolderName}" created successfully in ${selectedCategory}`
    );

    // Log for debugging
    console.log(`Created folder in ${selectedCategory}:`, newFolder);
    console.log("Current folders state:", updatedFoldersByCategory);
  };

  // Handle folder deletion
  const handleDeleteFolder = (folder: Folder) => {
    // Set the folder to delete and open confirmation dialog
    setFolderToDelete(folder);
    setIsDeleteFolderDialogOpen(true);
  };

  // Confirm folder deletion
  const confirmDeleteFolder = () => {
    if (!folderToDelete || !selectedCategory) return;

    try {
      // Get the current folder path
      const currentFolderPath = getCurrentFolderPath();

      // Create updated folders state
      const updatedFoldersByCategory = { ...foldersByCategory };

      // Check if the category exists
      if (updatedFoldersByCategory[selectedCategory]) {
        // Check if the current path exists
        if (updatedFoldersByCategory[selectedCategory][currentFolderPath]) {
          // Remove the folder from the current path
          updatedFoldersByCategory[selectedCategory][currentFolderPath] =
            updatedFoldersByCategory[selectedCategory][
              currentFolderPath
            ].filter((folder) => folder.id !== folderToDelete.id);
        }
      }

      // Update state
      setFoldersByCategory(updatedFoldersByCategory);

      // Close dialog and show success message
      setIsDeleteFolderDialogOpen(false);
      setFolderToDelete(null);

      toast.success(`Folder "${folderToDelete.name}" deleted successfully`);

      // Log for debugging
      console.log(`Deleted folder from ${selectedCategory}:`, folderToDelete);
      console.log("Updated folders state:", updatedFoldersByCategory);
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };

  // Navigate to a folder
  const navigateToFolder = (folder: Folder) => {
    // Verify we're navigating to a folder in the current category
    if (folder.category !== selectedCategory) {
      console.warn(
        `Attempted to navigate to folder from different category: ${folder.category} vs ${selectedCategory}`
      );
      return;
    }

    // Split the path into parts
    const folderPathParts = folder.path.split("/");

    // Set the current path
    setCurrentPath(folderPathParts);

    // Log for debugging
    console.log(`Navigating to folder in ${folder.category}:`, {
      folder,
      newPath: folderPathParts,
    });
  };

  // Navigate to specific path in breadcrumb
  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      // Navigate to root
      setCurrentPath([]);
    } else {
      // Navigate to specific folder in path
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  };

  // Get current items (documents and folders) for the current path
  const getCurrentItems = (): DocumentOrFolder[] => {
    if (!selectedCategory) return [];

    // Get the current path (used in logs and for clarity)
    getCurrentFolderPath();

    // Get folders for the current category and path
    const currentFolders = getCurrentCategoryFolders();

    // If we're at the root level of a category, show documents from that category
    // Otherwise, get documents from the special folder path key
    let currentDocuments: DocumentData[] = [];

    if (currentPath.length === 0) {
      // Root level - get documents from the category
      currentDocuments = documents[selectedCategory] || [];
    } else {
      // Inside a folder - get documents from the special folder path key with category prefix
      const folderPathKey = `category:${selectedCategory}:${currentPath.join(
        "/"
      )}`;
      currentDocuments = documents[folderPathKey] || [];
    }

    // Log for debugging
    console.log(
      `Getting items for ${selectedCategory} at path ${currentPath.join("/")}:`,
      {
        folders: currentFolders,
        documents: currentDocuments,
      }
    );

    return [...currentFolders, ...currentDocuments];
  };

  // Get document count for each category
  const getCategoryDocumentCount = (category: string) => {
    if (!documents[category]) return 0;
    return documents[category].length;
  };

  // Get icon for each category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Project Plans":
        return <FileText className="h-10 w-10 text-blue-500" />;
      case "Contracts":
        return <FileCheck className="h-10 w-10 text-indigo-500" />;
      case "Invoices":
        return <FileText className="h-10 w-10 text-green-500" />;
      case "Permits":
        return <FileCheck className="h-10 w-10 text-amber-500" />;
      case "Photos":
        return <Image className="h-10 w-10 text-rose-500" />;
      case "Reports":
        return <BarChart className="h-10 w-10 text-purple-500" />;
      default:
        return <Folder className="h-10 w-10 text-gray-500" />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Mobile-optimized header with centered title */}
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">Documents</h1>
        <div className="relative w-full max-w-md mx-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all documents..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card
            key={category.title}
            className="cursor-pointer hover:shadow-md transition-all hover:translate-y-[-2px] border-l-4"
            style={{
              borderLeftColor:
                category.title === "Project Plans"
                  ? "#3b82f6"
                  : category.title === "Contracts"
                  ? "#6366f1"
                  : category.title === "Invoices"
                  ? "#22c55e"
                  : category.title === "Permits"
                  ? "#f59e0b"
                  : category.title === "Photos"
                  ? "#e11d48"
                  : category.title === "Reports"
                  ? "#9333ea"
                  : "#6b7280",
            }}
            onClick={() => handleCardClick(category.title)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{category.title}</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {getCategoryDocumentCount(category.title)} files
                </Badge>
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.content}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 p-2 bg-muted rounded-full">
                  {getCategoryIcon(category.title)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Document Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0">
          <div className="p-6 pb-2">
            <DialogHeader>
              <div className="flex items-center gap-2">
                {selectedCategory && (
                  <div className="p-2 rounded-full bg-muted">
                    {getCategoryIcon(selectedCategory)}
                  </div>
                )}
                <div>
                  <DialogTitle className="text-2xl">
                    {selectedCategory}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedCategory &&
                      categories.find((c) => c.title === selectedCategory)
                        ?.description}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Toolbar with breadcrumb, search, and actions */}
            <div className="border-y bg-muted/40 px-6 py-2">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Breadcrumb Navigation */}
                <div className="flex-1 overflow-x-auto w-full sm:w-auto">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          onClick={() => navigateToBreadcrumb(-1)}
                          className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                        >
                          <Home className="h-4 w-4 mr-1" />
                          <span className="font-medium">
                            {selectedCategory}
                          </span>
                        </BreadcrumbLink>
                      </BreadcrumbItem>

                      {currentPath.map((folder, index) => (
                        <BreadcrumbItem key={index}>
                          <BreadcrumbSeparator>
                            <ChevronRight className="h-4 w-4" />
                          </BreadcrumbSeparator>
                          <BreadcrumbLink
                            onClick={() => navigateToBreadcrumb(index)}
                            className="cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                          >
                            {folder}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUpload}
                    className="flex items-center gap-1"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={handleNewFolderClick}
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                    New Folder
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="px-6 py-3 flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                <div className="flex border rounded-md">
                  <Button
                    variant={sortBy === "name" ? "default" : "ghost"}
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      setSortBy("name");
                      setSortDirection(
                        sortDirection === "asc" ? "desc" : "asc"
                      );
                    }}
                  >
                    Name
                    {sortBy === "name" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      ))}
                  </Button>
                  <Button
                    variant={sortBy === "date" ? "default" : "ghost"}
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      setSortBy("date");
                      setSortDirection(
                        sortDirection === "asc" ? "desc" : "asc"
                      );
                    }}
                  >
                    Date
                    {sortBy === "date" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      ))}
                  </Button>
                  <Button
                    variant={sortBy === "size" ? "default" : "ghost"}
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      setSortBy("size");
                      setSortDirection(
                        sortDirection === "asc" ? "desc" : "asc"
                      );
                    }}
                  >
                    Size
                    {sortBy === "size" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      ))}
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="px-6 mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Uploading...</span>
                  <span className="text-sm">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Hidden file input - accept all file types */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="*/*"
              multiple
            />

            {/* Documents and Folders */}
            <div className="flex-1 overflow-auto px-6 pb-6">
              {getFilteredAndSortedDocuments().length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="bg-muted/50 p-4 rounded-full mb-4">
                    {currentPath.length === 0 ? (
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    ) : (
                      <Folder className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium mb-1">
                    No documents found
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    {currentPath.length === 0
                      ? "Upload a document or create a folder to get started."
                      : "This folder is empty. Upload a document or create a subfolder."}
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleUpload} className="gap-1">
                      <Upload className="h-4 w-4" />
                      Upload Files
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNewFolderClick}
                      className="gap-1"
                    >
                      <FolderPlus className="h-4 w-4" />
                      New Folder
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                  {getFilteredAndSortedDocuments().map((item) => (
                    <div
                      key={isFolder(item) ? item.id : item.document_id}
                      className={cn(
                        "group border rounded-lg overflow-hidden hover:shadow-md transition-all",
                        isFolder(item)
                          ? "cursor-pointer hover:border-blue-400"
                          : "hover:border-gray-400"
                      )}
                      onClick={
                        isFolder(item)
                          ? () => navigateToFolder(item)
                          : undefined
                      }
                    >
                      {isFolder(item) ? (
                        // Folder item
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-50 rounded-md mr-3">
                                <Folder className="h-6 w-6 text-blue-500" />
                              </div>
                              <div>
                                <h3 className="font-medium truncate max-w-[150px]">
                                  {item.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    item.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(item);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Document item
                        <div>
                          {/* Preview area */}
                          <div
                            className="h-32 bg-muted/30 flex items-center justify-center border-b relative group"
                            onClick={() => handleView(item)}
                          >
                            {item.file_type.startsWith("image/") ? (
                              <img
                                src={item.file_path}
                                alt={item.file_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="p-3 bg-muted/50 rounded-md">
                                {item.file_type.includes("pdf") ? (
                                  <FileText className="h-10 w-10 text-red-500" />
                                ) : item.file_type.includes("word") ? (
                                  <FileText className="h-10 w-10 text-blue-500" />
                                ) : item.file_type.includes("sheet") ||
                                  item.file_type.includes("excel") ? (
                                  <FileText className="h-10 w-10 text-green-500" />
                                ) : item.file_type.includes("presentation") ||
                                  item.file_type.includes("powerpoint") ? (
                                  <FileText className="h-10 w-10 text-orange-500" />
                                ) : (
                                  <FileIcon className="h-10 w-10 text-gray-500" />
                                )}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="gap-1"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </Button>
                            </div>
                          </div>

                          {/* Document info */}
                          <div className="p-3">
                            <div className="flex items-start justify-between mb-1">
                              <h3
                                className="font-medium text-sm truncate max-w-[180px]"
                                title={item.file_name}
                              >
                                {item.file_name}
                              </h3>
                              <div className="flex">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(item);
                                  }}
                                >
                                  <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>{formatFileSize(item.file_size)}</span>
                              <span>
                                {new Date(
                                  item.uploaded_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {item.description && (
                              <p
                                className="text-xs text-muted-foreground mt-1 line-clamp-2"
                                title={item.description}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <AlertDialog
        open={isNewFolderDialogOpen}
        onOpenChange={setIsNewFolderDialogOpen}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-full">
                <FolderPlus className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <AlertDialogTitle>Create New Folder</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter a name for the new folder
                  {currentPath.length > 0 ? ` in ${currentPath.join("/")}` : ""}
                  .
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {selectedCategory}
                {currentPath.length > 0 ? ` / ${currentPath.join(" / ")}` : ""}
              </span>
            </div>
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => {
                setNewFolderName(e.target.value);
                setNewFolderError(null);
              }}
              className={cn(newFolderError && "border-red-500")}
              autoFocus
            />
            {newFolderError && (
              <div className="flex items-center gap-1 mt-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                <p className="text-sm text-red-500">{newFolderError}</p>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsNewFolderDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={createNewFolder} className="gap-1">
              <FolderPlus className="h-4 w-4" />
              Create Folder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Folder Confirmation Dialog */}
      <AlertDialog
        open={isDeleteFolderDialogOpen}
        onOpenChange={setIsDeleteFolderDialogOpen}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 rounded-full">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this folder? This action
                  cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {folderToDelete && (
            <div className="py-4">
              <div className="flex items-start p-3 border rounded-md bg-muted/20">
                <div className="p-2 bg-blue-50 rounded-md mr-3">
                  <Folder className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium">{folderToDelete.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Created:{" "}
                    {new Date(folderToDelete.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Path: {folderToDelete.path}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 text-amber-800 rounded-md">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  Deleting this folder will remove all files and subfolders it
                  contains.
                </p>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteFolderDialogOpen(false);
                setFolderToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFolder}
              className="bg-red-500 hover:bg-red-600 gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete Folder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDocumentDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDocumentDialogOpen(open);
          if (!open) setDocumentToDelete(null);
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 rounded-full">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this document? This action
                  cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {documentToDelete && (
            <div className="py-4">
              <div className="flex items-start p-3 border rounded-md bg-muted/20">
                <div className="p-2 bg-muted/50 rounded-md mr-3">
                  {documentToDelete.file_type.startsWith("image/") ? (
                    <div className="h-10 w-10 rounded-md overflow-hidden">
                      <img
                        src={documentToDelete.file_path}
                        alt={documentToDelete.file_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : documentToDelete.file_type.includes("pdf") ? (
                    <FileText className="h-6 w-6 text-red-500" />
                  ) : documentToDelete.file_type.includes("word") ? (
                    <FileText className="h-6 w-6 text-blue-500" />
                  ) : documentToDelete.file_type.includes("sheet") ||
                    documentToDelete.file_type.includes("excel") ? (
                    <FileText className="h-6 w-6 text-green-500" />
                  ) : documentToDelete.file_type.includes("presentation") ||
                    documentToDelete.file_type.includes("powerpoint") ? (
                    <FileText className="h-6 w-6 text-orange-500" />
                  ) : (
                    <FileIcon className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-medium truncate"
                    title={documentToDelete.file_name}
                  >
                    {documentToDelete.file_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Size: {formatFileSize(documentToDelete.file_size)} •
                    Uploaded:{" "}
                    {new Date(
                      documentToDelete.uploaded_at
                    ).toLocaleDateString()}
                  </p>
                  {documentToDelete.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {documentToDelete.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsDeleteDocumentDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDocument}
              className="bg-red-500 hover:bg-red-600 gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete Document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentsPage;
