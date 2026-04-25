import { Spinner } from "@heroui/react";

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <Spinner label={label} color="primary" />
    </div>
  );
}
