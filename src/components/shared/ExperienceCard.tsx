import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Plus, Upload, Check, Trash2 } from "lucide-react";

export interface Position {
  id: string;
  company: string;
  title: string;
  startDate: string; // "May 2021"
  endDate: string;   // "Present"
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  graduationYear: string;
}

interface ExperienceCardProps {
  resumeFile: File | null;
  onResumeChange: (f: File | null) => void;
  positions: Position[];
  setPositions: (p: Position[]) => void;
  education: Education[];
  setEducation: (e: Education[]) => void;
  resumeNote?: string;
}

const newPosition = (): Position => ({
  id: crypto.randomUUID(), company: "", title: "", startDate: "", endDate: "", description: "",
});
const newEducation = (): Education => ({
  id: crypto.randomUUID(), school: "", degree: "", field: "", graduationYear: "",
});

const ExperienceCard = ({
  resumeFile, onResumeChange, positions, setPositions, education, setEducation,
  resumeNote = "Your resume populated the fields below. You can edit anything directly.",
}: ExperienceCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editingPos, setEditingPos] = useState<string | null>(null);
  const [editingEdu, setEditingEdu] = useState<string | null>(null);

  const handleFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!/\.(pdf|docx?|doc)$/i.test(f.name)) return;
    onResumeChange(f);
  };

  const updatePos = (id: string, patch: Partial<Position>) =>
    setPositions(positions.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const removePos = (id: string) => setPositions(positions.filter((p) => p.id !== id));

  const updateEdu = (id: string, patch: Partial<Education>) =>
    setEducation(education.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeEdu = (id: string) => setEducation(education.filter((e) => e.id !== id));

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Experience</h3>
      </div>

      {/* Resume slot */}
      {resumeFile ? (
        <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{resumeFile.name}</p>
              <p className="text-[11px] text-muted-foreground">{(resumeFile.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} className="text-xs">
            Replace
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed border-border/70 text-muted-foreground hover:text-foreground hover:border-border transition-all"
        >
          <Upload className="w-5 h-5" />
          <p className="text-sm font-medium">Upload your resume to auto-fill</p>
          <p className="text-[11px] text-muted-foreground">PDF or Word</p>
        </button>
      )}
      {resumeFile && (
        <p className="text-xs text-muted-foreground -mt-3">{resumeNote}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />

      {/* Work History */}
      <div className="space-y-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Work History</p>
        <div className="divide-y divide-border/40">
          {positions.map((p) => (
            <div key={p.id} className="py-3">
              {editingPos === p.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={p.company} onChange={(e) => updatePos(p.id, { company: e.target.value })} placeholder="Company" />
                    <Input value={p.title} onChange={(e) => updatePos(p.id, { title: e.target.value })} placeholder="Job title" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={p.startDate} onChange={(e) => updatePos(p.id, { startDate: e.target.value })} placeholder="Start date (May 2021)" />
                    <Input value={p.endDate} onChange={(e) => updatePos(p.id, { endDate: e.target.value })} placeholder="End date or Present" />
                  </div>
                  <Textarea value={p.description} onChange={(e) => updatePos(p.id, { description: e.target.value })} placeholder="Description" className="min-h-[70px] resize-none" />
                  <div className="flex justify-between">
                    <button onClick={() => removePos(p.id)} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                    <button onClick={() => setEditingPos(null)} className="text-xs text-accent flex items-center gap-1 hover:underline">
                      <Check className="w-3 h-3" /> Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{p.company || "Untitled company"}</p>
                    <p className="text-sm text-foreground/80">{p.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {p.startDate} {p.endDate ? `– ${p.endDate}` : ""}
                    </p>
                    {p.description && (
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{p.description}</p>
                    )}
                  </div>
                  <button onClick={() => setEditingPos(p.id)} className="p-1.5 rounded-lg hover:bg-muted shrink-0">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const np = newPosition();
            setPositions([...positions, np]);
            setEditingPos(np.id);
          }}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Add position
        </button>
      </div>

      {/* Education */}
      <div className="space-y-1 pt-2 border-t border-border/40">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 mt-2">Education</p>
        <div className="divide-y divide-border/40">
          {education.map((e) => (
            <div key={e.id} className="py-3">
              {editingEdu === e.id ? (
                <div className="space-y-2">
                  <Input value={e.school} onChange={(ev) => updateEdu(e.id, { school: ev.target.value })} placeholder="School" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={e.degree} onChange={(ev) => updateEdu(e.id, { degree: ev.target.value })} placeholder="Degree" />
                    <Input value={e.field} onChange={(ev) => updateEdu(e.id, { field: ev.target.value })} placeholder="Field of study" />
                  </div>
                  <Input value={e.graduationYear} onChange={(ev) => updateEdu(e.id, { graduationYear: ev.target.value })} placeholder="Graduation year" />
                  <div className="flex justify-between">
                    <button onClick={() => removeEdu(e.id)} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                    <button onClick={() => setEditingEdu(null)} className="text-xs text-accent flex items-center gap-1 hover:underline">
                      <Check className="w-3 h-3" /> Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{e.school || "Untitled school"}</p>
                    <p className="text-sm text-foreground/80">{[e.degree, e.field].filter(Boolean).join(", ")}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{e.graduationYear}</p>
                  </div>
                  <button onClick={() => setEditingEdu(e.id)} className="p-1.5 rounded-lg hover:bg-muted shrink-0">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const ne = newEducation();
            setEducation([...education, ne]);
            setEditingEdu(ne.id);
          }}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Add education
        </button>
      </div>
    </div>
  );
};

export default ExperienceCard;