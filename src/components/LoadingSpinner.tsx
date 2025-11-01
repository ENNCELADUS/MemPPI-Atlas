import React from "react";

type SpinnerSize = "sm" | "md" | "lg";

const sizeMap: Record<SpinnerSize, string> = {
  sm: "h-6 w-6 border-2",
  md: "h-10 w-10 border-[3px]",
  lg: "h-16 w-16 border-4",
};

interface LoadingSpinnerProps {
  label?: string;
  size?: SpinnerSize;
  className?: string;
  labelClassName?: string;
}

export default function LoadingSpinner({
  label,
  size = "md",
  className = "",
  labelClassName = "text-sm text-gray-600",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div
        className={`animate-spin rounded-full border-gray-200 border-t-blue-600 ${sizeMap[size]}`}
        aria-hidden="true"
      />
      {label && <p className={`mt-3 ${labelClassName}`}>{label}</p>}
    </div>
  );
}
