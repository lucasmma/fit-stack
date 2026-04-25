import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import { NAV_MODULES } from "@/components/shell/NavItems";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Home — personal-hq" };

export default function HomePage() {
  return (
    <div>
      <PageHeader title="Home" description="Pick an area to work on." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NAV_MODULES.map((module) => (
          <Card
            key={module.id}
            as={Link}
            href={`/${module.id}`}
            isPressable
            shadow="sm"
            className="h-full"
          >
            <CardBody className="gap-2">
              <div className="flex items-center gap-3">
                <span aria-hidden className="text-2xl">
                  {module.icon}
                </span>
                <p className="text-lg font-semibold">{module.label}</p>
              </div>
              <p className="text-sm text-default-500">{module.description}</p>
              <p className="mt-2 text-xs text-default-400">
                {module.items.length} sections
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
