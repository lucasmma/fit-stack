"use client";

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { EmptyChart } from "./EmptyChart";

interface Point {
  x: string;
  y: number;
}

export function BarSeriesChart({
  data,
  unit,
  height = 200,
}: {
  data: Point[];
  unit?: string;
  height?: number;
}) {
  if (data.length === 0 || data.every((p) => p.y === 0)) return <EmptyChart />;
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid
            stroke="hsl(var(--heroui-default-200))"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="x"
            stroke="hsl(var(--heroui-default-400))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--heroui-default-400))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            unit={unit}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--heroui-content1))",
              border: "1px solid hsl(var(--heroui-default-200))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="y" fill="hsl(var(--heroui-primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
