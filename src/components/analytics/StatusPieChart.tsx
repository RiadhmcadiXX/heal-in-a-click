
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface StatusPieChartProps {
  data: {
    name: string;
    value: number;
  }[];
  loading?: boolean;
}

export function StatusPieChart({ data, loading }: StatusPieChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No status data available</div>
      </div>
    );
  }

  // Custom colors for different statuses
  const COLORS = {
    completed: "#10B981", // green
    pending: "#F59E0B",   // amber
    cancelled: "#EF4444", // red
    confirmed: "#3B82F6",  // blue
    rescheduled: "#8B5CF6", // purple
    noshow: "#6B7280",    // gray
  };

  return (
    <ChartContainer
      config={{
        completed: { label: "Completed", color: COLORS.completed },
        pending: { label: "Pending", color: COLORS.pending },
        cancelled: { label: "Cancelled", color: COLORS.cancelled },
        confirmed: { label: "Confirmed", color: COLORS.confirmed },
        rescheduled: { label: "Rescheduled", color: COLORS.rescheduled },
        noshow: { label: "No Show", color: COLORS.noshow },
      }}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => {
              const colorKey = entry.name.toLowerCase() as keyof typeof COLORS;
              return <Cell key={`cell-${index}`} fill={COLORS[colorKey] || `#${Math.floor(Math.random()*16777215).toString(16)}`} />;
            })}
          </Pie>
          <ChartTooltip
            content={
              <ChartTooltipContent 
                labelKey="name"
                formatter={(value, name) => [`${value} appointments`, name]}
              />
            }
          />
          <ChartLegend
            content={<ChartLegendContent />}
            verticalAlign="bottom"
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
