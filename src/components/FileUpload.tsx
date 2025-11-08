import { useCallback, useState } from "react";
import { Upload, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import bcrypt from "bcryptjs";

interface FileUploadProps {
  onUploadComplete: (code: string) => void;
}

export const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const totalSize = [...files, ...droppedFiles].reduce((acc, file) => acc + file.size, 0);
    
    if (totalSize > 10 * 1024 * 1024 * 1024) {
      toast.error("Total file size exceeds 10GB limit");
      return;
    }
    
    setFiles(prev => [...prev, ...droppedFiles]);
  }, [files]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalSize = [...files, ...selectedFiles].reduce((acc, file) => acc + file.size, 0);
      
      if (totalSize > 10 * 1024 * 1024 * 1024) {
        toast.error("Total file size exceeds 10GB limit");
        return;
      }
      
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    if (usePassword && !password) {
      toast.error("Please enter a password");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Trigger automatic cleanup of expired transfers
      supabase.functions.invoke('cleanup-expired').catch(err => 
        console.log('Cleanup task running:', err)
      );
      const code = generateCode();
      const passwordHash = usePassword ? await bcrypt.hash(password, 10) : null;

      // Create transfer record
      const { data: transfer, error: transferError } = await supabase
        .from("transfers")
        .insert({
          code,
          password_hash: passwordHash,
        })
        .select()
        .single();

      if (transferError) throw transferError;

      // Upload files
      const totalFiles = files.length;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storagePath = `${transfer.id}/${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("transfers")
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        // Create file record
        const { error: fileError } = await supabase.from("files").insert({
          transfer_id: transfer.id,
          file_name: file.name,
          file_size: file.size,
          storage_path: storagePath,
          mime_type: file.type,
        });

        if (fileError) throw fileError;

        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      toast.success("Files uploaded successfully!");
      onUploadComplete(code);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          isDragging
            ? "border-primary bg-primary/10 scale-105"
            : "border-border hover:border-primary/50"
        }`}
      >
        <Upload className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold mb-2">Drop files here or click to browse</h3>
        <p className="text-muted-foreground mb-4">Up to 10GB total</p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
          disabled={uploading}
        />
        <Button variant="default" asChild disabled={uploading}>
          <label htmlFor="file-input" className="cursor-pointer">
            Select Files
          </label>
        </Button>
      </div>

      {files.length > 0 && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Selected Files ({files.length})</h4>
              <p className="text-sm text-muted-foreground">
                Total: {formatFileSize(totalSize)}
              </p>
            </div>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <Label htmlFor="password-toggle">Password Protection (Optional)</Label>
          </div>
          <Switch
            id="password-toggle"
            checked={usePassword}
            onCheckedChange={setUsePassword}
            disabled={uploading}
          />
        </div>
        {usePassword && (
          <div className="mt-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={uploading}
            />
          </div>
        )}
      </Card>

      <Button
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
        className="w-full"
        size="lg"
      >
        {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : "Upload Files"}
      </Button>
    </div>
  );
};
