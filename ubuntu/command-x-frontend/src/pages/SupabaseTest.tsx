import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Loader2,
  CheckCircle,
  Upload,
  UserPlus,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  personnelApi,
  type PersonnelRegistration as PersonnelRegistrationType,
} from "../services/personnelApi";
import { uploadDocument } from "../services/api";
import { toast } from "sonner";

// File upload component
const PersonalIdUpload: React.FC<{
  onFileSelect: (file: File | null) => void;
  file: File | null;
  isUploading: boolean;
  progress: number;
}> = ({ onFileSelect, file, isUploading, progress }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="personal-id-upload">Personal ID Document *</Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
          className="hidden"
          id="personal-id-upload"
        />
        <label htmlFor="personal-id-upload" className="cursor-pointer block">
          {file ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm text-gray-600 font-medium">{file.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                Click to upload Personal ID
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, Image, or Document (Max 10MB)
              </p>
            </div>
          )}
        </label>
        {isUploading && (
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Uploading... {progress.toFixed(0)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const PersonnelRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<
    Omit<PersonnelRegistrationType, "worker_id">
  >({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    home_address: "",
    position_applying_for: "",
    is_active: true,
  });

  const [personalIdFile, setPersonalIdFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
    workerId?: string;
  } | null>(null);

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      home_address: "",
      position_applying_for: "",
      is_active: true,
    });
    setPersonalIdFile(null);
    setUploadProgress(0);
  };

  const validateForm = (): string | null => {
    if (!formData.first_name.trim()) return "First name is required";
    if (!formData.last_name.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.phone.trim()) return "Phone number is required";
    if (!formData.home_address.trim()) return "Home address is required";
    if (!formData.position_applying_for.trim())
      return "Position applying for is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))
      return "Please enter a valid email address";

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-()+ ]+$/;
    if (!phoneRegex.test(formData.phone))
      return "Please enter a valid phone number";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setSubmissionResult(null);

    try {
      let documentId: string | null = null;

      // Step 1: Upload personal ID document if provided
      if (personalIdFile) {
        const formDataForUpload = new FormData();
        formDataForUpload.append("file", personalIdFile);
        formDataForUpload.append(
          "description",
          `Personal ID for ${formData.first_name} ${formData.last_name}`
        );

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = prev + Math.random() * 20;
            return newProgress > 90 ? 90 : newProgress;
          });
        }, 200);

        try {
          const uploadResult = await uploadDocument(formDataForUpload);
          documentId = uploadResult.document_id;
          clearInterval(progressInterval);
          setUploadProgress(100);
        } catch (uploadError) {
          clearInterval(progressInterval);
          throw new Error(
            `Document upload failed: ${
              uploadError instanceof Error
                ? uploadError.message
                : "Unknown error"
            }`
          );
        }
      }

      // Step 2: Create personnel registration
      const registrationData = {
        ...formData,
        personal_id_document_id: documentId,
      };

      const newWorker = await personnelApi.createPersonnelRegistration(
        registrationData
      );

      // Success!
      setSubmissionResult({
        success: true,
        message: `Personnel registration completed successfully! Worker ID: ${newWorker.worker_id}`,
        workerId: newWorker.worker_id,
      });

      toast.success("Personnel registered successfully!");
      resetForm();
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setSubmissionResult({
        success: false,
        message: `Registration failed: ${errorMessage}`,
      });
      toast.error(`Registration failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <UserPlus className="h-8 w-8 text-blue-600" />
          Personnel Registration
        </h1>
        <p className="text-gray-600">
          Register new personnel with complete information and document upload
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            New Personnel Registration
          </CardTitle>
          <CardDescription>
            Fill out all required information to register new personnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            {/* Address and Position */}
            <div>
              <Label htmlFor="home_address">Home Address *</Label>
              <Textarea
                id="home_address"
                value={formData.home_address}
                onChange={(e) =>
                  setFormData({ ...formData, home_address: e.target.value })
                }
                placeholder="Enter complete home address"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="position_applying_for">
                Position Applying For *
              </Label>
              <Input
                id="position_applying_for"
                value={formData.position_applying_for}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    position_applying_for: e.target.value,
                  })
                }
                placeholder="e.g., Construction Worker, Electrician, Plumber"
                required
              />
            </div>

            {/* Personal ID Upload */}
            <PersonalIdUpload
              onFileSelect={setPersonalIdFile}
              file={personalIdFile}
              isUploading={isSubmitting}
              progress={uploadProgress}
            />

            {/* Submission Result */}
            {submissionResult && (
              <div
                className={`p-4 rounded-lg border ${
                  submissionResult.success
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {submissionResult.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <p className="font-medium">
                    {submissionResult.success ? "Success!" : "Error"}
                  </p>
                </div>
                <p className="mt-1 text-sm">{submissionResult.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {personalIdFile
                    ? "Uploading & Registering..."
                    : "Registering Personnel..."}
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Personnel
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonnelRegistrationForm;
