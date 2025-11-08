import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/FileUpload";
import { FileDownload } from "@/components/FileDownload";
import { SuccessDialog } from "@/components/SuccessDialog";
import { Upload, Download, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Index = () => {
  const [uploadCode, setUploadCode] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleUploadComplete = (code: string) => {
    setUploadCode(code);
    setShowSuccessDialog(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
    setUploadCode(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center space-x-4">
            <img src={logo} alt="SendIT Logo" className="w-16 h-16 rounded-2xl shadow-lg shadow-primary/30" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              SendIT
            </h1>
          </div>
          <p className="text-center text-muted-foreground mt-4 text-lg">
            Share files instantly, no signup required
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="download">
                <Download className="w-4 h-4 mr-2" />
                Download
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-4">
              <FileUpload onUploadComplete={handleUploadComplete} />
            </TabsContent>
            <TabsContent value="download" className="space-y-4">
              <FileDownload />
            </TabsContent>
          </Tabs>

          {/* Info Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur border border-accent/40 text-center hover:border-accent hover:shadow-lg hover:shadow-accent/30 transition-all group">
              <p className="font-semibold text-accent group-hover:scale-110 transition-transform">✓ No SignUp</p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur border border-primary/40 text-center hover:border-primary hover:shadow-lg hover:shadow-primary/30 transition-all group">
              <p className="font-semibold text-primary group-hover:scale-110 transition-transform">✓ No Email</p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 backdrop-blur border border-secondary/40 text-center hover:border-secondary hover:shadow-lg hover:shadow-secondary/30 transition-all group">
              <p className="font-semibold text-secondary group-hover:scale-110 transition-transform">✓ No Phone Number</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-16 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-3">
              <p className="text-foreground font-semibold text-lg">
                Made by <span className="text-primary">Samin Yeasar</span>
              </p>
              <p className="text-muted-foreground text-sm">
                Bangladesh
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild className="rounded-full">
                <a
                  href="https://github.com/Solez-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <Github className="w-5 h-5" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild className="rounded-full">
                <a
                  href="https://x.com/Solez_None"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </Button>
            </div>
            
            <div className="border-t border-border/40 pt-6 w-full max-w-2xl">
              <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-lg shadow-accent/50"></span>
                  <span className="text-accent">System Online</span>
                </span>
                <span>•</span>
                <span className="text-primary">Encryption Active</span>
                <span>•</span>
                <span className="text-secondary">Auto-Cleanup Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {uploadCode && (
        <SuccessDialog
          code={uploadCode}
          open={showSuccessDialog}
          onClose={handleCloseSuccess}
        />
      )}
    </div>
  );
};

export default Index;
