import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MultiSelectTagsProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectTags = ({ label, options, selected, onChange, placeholder }: MultiSelectTagsProps) => {
  const [search, setSearch] = useState("");

  const filtered = options.filter(
    (o) => !selected.includes(o) && o.toLowerCase().includes(search.toLowerCase())
  );

  const add = (tag: string) => {
    onChange([...selected, tag]);
    setSearch("");
  };

  const remove = (tag: string) => {
    onChange(selected.filter((s) => s !== tag));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {selected.map((tag) => (
          <button
            key={tag}
            onClick={() => remove(tag)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
          >
            {tag}
            <X className="w-3 h-3" />
          </button>
        ))}
      </div>
      <div className="relative">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder || "Search..."}
        />
        {search && filtered.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-popover border border-border rounded-xl shadow-2xl max-h-40 overflow-y-auto">
            {filtered.map((o) => (
              <button
                key={o}
                onClick={() => add(o)}
                className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectTags;
