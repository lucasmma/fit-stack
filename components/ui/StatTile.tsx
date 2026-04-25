import { Card, CardBody } from "@heroui/react";
import type { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: string;
}

export function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <Card shadow="sm">
      <CardBody className="gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-default-500">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {hint && <p className="text-xs text-default-500">{hint}</p>}
      </CardBody>
    </Card>
  );
}
