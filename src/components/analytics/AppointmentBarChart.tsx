
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface AppointmentBarChartProps {
  data: {
    name: string;
    month: string;
    appointments: number;
  }[];
  loading?: boolean;
}

export function AppointmentBarChart({ data, loading }: AppointmentBarChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No appointment data available</div>
      </div>
    );
  }

  return (
    <ChartContainer
      config={{
        appointments: {
          label: "Appointments",
          color: "#8B5CF6",
        },
      }}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 30,
          }}
        >
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <Bar
            dataKey="appointments"
            fill="var(--color-appointments)"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
          <ChartTooltip
            cursor={{ fill: "var(--color-appointments-10)" }}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => `${value}`}
              />
            }
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
