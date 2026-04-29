import { useRef, useState } from "react";
import { Upload, FileText, X, Info, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LinkedInUploadProps {
  headline: string;
  subheadline: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

const LinkedInUpload = ({ headline, subheadline, file, onChange }: LinkedInUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!/\.csv$/i.test(f.name)) return;
    onChange(f);
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{headline}</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs leading-relaxed">
                <p className="mb-2">
                  To export your LinkedIn connections: go to LinkedIn Settings → Data Privacy → Get a copy of your data → Select Connections → Request archive. LinkedIn will email you a CSV within 10 minutes.
                </p>
                <a
                  href="https://www.linkedin.com/help/linkedin/answer/a566336/export-connections-from-linkedin"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  See LinkedIn's full instructions <ExternalLink className="w-3 h-3" />
                </a>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{subheadline}</p>
        </div>
      </div>

      {file ? (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-muted/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <button
            onClick={() => onChange(null)}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`w-full flex flex-col items-center justify-center gap-2 h-36 rounded-2xl border-2 border-dashed transition-all duration-300 ${
            dragging
              ? "border-accent bg-accent/5 text-foreground"
              : "border-border/70 text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          <Upload className="w-6 h-6" />
          <div className="text-center">
            <p className="text-sm font-medium">Drag and drop your LinkedIn connections CSV</p>
            <p className="text-xs text-muted-foreground mt-1">CSV only</p>
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
};

export default LinkedInUpload;