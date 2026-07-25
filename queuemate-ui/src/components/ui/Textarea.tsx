import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export default function Textarea({
  className,
  label,
  helperText,
  error,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <label className="form-field" htmlFor={textareaId}>
      {label && <span>{label}</span>}
      <textarea
        id={textareaId}
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
