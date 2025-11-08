import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";

interface SuccessDialogProps {
  code: string;
  open: boolean;
  onClose: () => void;
}

export const SuccessDialog = ({ code, open, onClose }: SuccessDialogProps) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Upload Successful! 🎉</DialogTitle>
          <DialogDescription className="text-center">
            Share this code with the recipient. Files will be automatically deleted in 1 hour.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="bg-primary/10 border-2 border-primary rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Transfer Code</p>
            <p className="text-5xl font-bold tracking-wider text-primary">{code}</p>
          </div>
          <Button onClick={copyCode} className="w-full" size="lg">
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
