import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

interface MultiSelectDropdownProps {
  label: string;
  helper?: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown = ({
  label,
  helper,
  options,
  selected,
  onChange,
  placeholder = "Select...",
}: MultiSelectDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter((s) => s !== opt));
    else onChange([...selected, opt]);
  };

  return (
    <div className="space-y-1.5" ref={ref}>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
        {label}
      </label>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 min-h-11 px-3 py-2 rounded-xl bg-background border border-border text-left text-sm text-foreground hover:border-border/80 transition-colors"
        >
          <div className="flex flex-wrap gap-1.5 flex-1">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-accent/10 text-accent border border-accent/20"
                >
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(tag);
                    }}
                  />
                </span>
              ))
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute z-20 mt-1 w-full bg-popover border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto">
            {options.map((o) => {
              const isSel = selected.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => toggle(o)}
                  className="w-full flex items-center justify-between text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  <span>{o}</span>
                  {isSel && <Check className="w-4 h-4 text-accent" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectDropdown;