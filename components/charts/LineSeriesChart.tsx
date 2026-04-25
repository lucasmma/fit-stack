"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { EmptyChart } from "./EmptyChart";

interface Point {
  x: string;
  y: number;
}

export function LineSeriesChart({
  data,
  unit,
  height = 200,
}: {
  data: Point[];
  unit?: string;
  height?: number;
}) {
  if (data.length < 2) return <EmptyChart />;
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
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
          <Line
            type="monotone"
            dataKey="y"
            stroke="hsl(var(--heroui-primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
