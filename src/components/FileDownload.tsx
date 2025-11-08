import { useState } from "react";
import { Download, Lock, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import JSZip from "jszip";
import bcrypt from "bcryptjs";

interface FileData {
  id: string;
  file_name: string;
  file_size: number;
  storage_path: string;
  mime_type: string | null;
}

export const FileDownload = () => {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [files, setFiles] = useState<FileData[]>([]);
  const [transferId, setTransferId] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleSubmitCode = async () => {
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);

    try {
      // Trigger automatic cleanup of expired transfers
      supabase.functions.invoke('cleanup-expired').catch(err => 
        console.log('Cleanup task running:', err)
      );
      const { data: transfer, error: transferError } = await supabase
        .from("transfers")
        .select("*")
        .eq("code", code)
        .single();

      if (transferError || !transfer) {
        toast.error("Invalid code or transfer expired");
        setLoading(false);
        return;
      }

      // Check if expired
      if (new Date(transfer.expires_at) < new Date()) {
        toast.error("This transfer has expired");
        setLoading(false);
        return;
      }

      // Check if password required
      if (transfer.password_hash) {
        if (!password) {
          setNeedsPassword(true);
          setTransferId(transfer.id);
          setLoading(false);
          return;
        }

        const passwordMatch = await bcrypt.compare(password, transfer.password_hash);
        if (!passwordMatch) {
          toast.error("Incorrect password");
          setLoading(false);
          return;
        }
      }

      // Fetch files
      const { data: filesData, error: filesError } = await supabase
        .from("files")
        .select("*")
        .eq("transfer_id", transfer.id);

      if (filesError) throw filesError;

      setFiles(filesData || []);
      setTransferId(transfer.id);
      toast.success("Transfer found!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to retrieve transfer");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (file: FileData) => {
    try {
      setDownloading(true);
      const { data, error } = await supabase.storage
        .from("transfers")
        .download(file.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${file.file_name}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  const downloadAllAsZip = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();

      for (const file of files) {
        const { data, error } = await supabase.storage
          .from("transfers")
          .download(file.storage_path);

        if (error) throw error;

        zip.file(file.file_name, data);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sendit-${code}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("All files downloaded as ZIP");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to create ZIP");
    } finally {
      setDownloading(false);
    }
  };

  const downloadAllIndividually = async () => {
    for (const file of files) {
      await downloadFile(file);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  if (files.length > 0 && transferId) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Files Ready for Download</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <FileIcon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.file_size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadFile(file)}
                  disabled={downloading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={downloadAllIndividually}
            disabled={downloading}
            size="lg"
          >
            Download All
          </Button>
          <Button
            onClick={downloadAllAsZip}
            disabled={downloading}
            variant="secondary"
            size="lg"
          >
            Download as ZIP
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Label htmlFor="code" className="text-base">Enter Transfer Code</Label>
        <Input
          id="code"
          type="text"
          placeholder="000000"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          disabled={loading}
          className="mt-2 text-center text-2xl tracking-widest"
        />
      </Card>

      {needsPassword && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-4 h-4" />
            <Label htmlFor="password" className="text-base">Password Required</Label>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </Card>
      )}

      <Button
        onClick={handleSubmitCode}
        disabled={loading || code.length !== 6}
        className="w-full"
        size="lg"
      >
        {loading ? "Checking..." : "Get Files"}
      </Button>
    </div>
  );
};
