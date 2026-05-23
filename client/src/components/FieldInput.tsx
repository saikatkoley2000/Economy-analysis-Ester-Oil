import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FieldInputProps {
  id: string;
  label: string;
  value: number | string;
  onChange: (v: string) => void;
  type?: "number" | "text";
  step?: string;
  suffix?: string;
  prefix?: string;
  testId?: string;
  hint?: string;
}

export function FieldInput({
  id,
  label,
  value,
  onChange,
  type = "number",
  step,
  suffix,
  prefix,
  testId,
  hint,
}: FieldInputProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          type={type}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-8 text-sm tabular-nums ${prefix ? "pl-6" : ""} ${suffix ? "pr-10" : ""}`}
          data-testid={testId ?? `input-${id}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
