import { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";

interface ResumeUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

const ResumeUpload = ({ file, onChange }: ResumeUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    const ok = /\.(pdf|docx?|doc)$/i.test(f.name);
    if (!ok) return;
    onChange(f);
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-1">Upload your resume.</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We'll use this to find meaningful connections in your network. We never share your resume.
        </p>
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
          className={`w-full flex flex-col items-center justify-center gap-3 h-44 rounded-2xl border-2 border-dashed transition-all duration-300 ${
            dragging
              ? "border-accent bg-accent/5 text-foreground"
              : "border-border/70 text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          <Upload className="w-6 h-6" />
          <div className="text-center">
            <p className="text-sm font-medium">Drag and drop your resume</p>
            <p className="text-xs text-muted-foreground mt-1">PDF or Word document</p>
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
};

export default ResumeUpload;