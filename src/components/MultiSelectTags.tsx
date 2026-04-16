import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 pr-1 cursor-pointer hover:bg-destructive/10"
            onClick={() => remove(tag)}
          >
            {tag}
            <X className="w-3 h-3" />
          </Badge>
        ))}
      </div>
      <div className="relative">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder || "Search..."}
        />
        {search && filtered.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {filtered.map((o) => (
              <button
                key={o}
                onClick={() => add(o)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
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
