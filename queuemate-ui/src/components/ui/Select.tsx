import type { SelectHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export default function Select({
  className,
  label,
  helperText,
  error,
  id,
  children,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className="form-field" htmlFor={selectId}>
      {label && <span>{label}</span>}
      <select
        id={selectId}
        className={cn("ui-input", error && "is-invalid", className)}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <small role="alert">{error}</small>
      ) : helperText ? (
        <small>{helperText}</small>
      ) : null}
    </label>
  );
}
