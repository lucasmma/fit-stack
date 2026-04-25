import { Card, CardBody, CardHeader } from "@heroui/react";
import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function ChartCard({ title, subtitle, children, actions }: ChartCardProps) {
  return (
    <Card shadow="sm">
      <CardHeader className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-default-500">{subtitle}</p>}
        </div>
        {actions}
      </CardHeader>
      <CardBody className="pt-0">{children}</CardBody>
    </Card>
  );
}
