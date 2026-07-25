import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export default function Input({
  className,
  label,
  helperText,
  error,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="form-field" htmlFor={inputId}>
      {label && <span>{label}</span>}
      <input
        id={inputId}
        className={cn("ui-input", error && "is-invalid", className)}
        {...props}
      />
      {error ? (
        <small role="alert">{error}</small>
      ) : helperText ? (
        <small>{helperText}</small>
      ) : null}
    </label>
  );
}
