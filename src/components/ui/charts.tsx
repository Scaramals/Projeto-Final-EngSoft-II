import React from "react";
import { 
  Line, 
  Bar, 
  Pie,
  PieChart as RechartsBasePie,
  BarChart as RechartsBaseBar,
  LineChart as RechartsBaseLine
} from "recharts";
import { ChartContainer } from "./chart";

interface ChartProps {
  data: any;
  options?: any;
  className?: string;
}

export const PieChart: React.FC<ChartProps> = ({ data, options, className }) => {
  const defaultConfig = {
    orange: {
      color: "#f59e0b",
    },
    blue: {
      color: "#3b82f6",
    },
    green: {
      color: "#10b981",
    },
    red: {
      color: "#ef4444",
    },
    gray: {
      color: "#6b7280",
    },
  };

  return (
    <ChartContainer config={defaultConfig} className={className}>
      <RechartsBasePie
        data={data.datasets[0].data.map((value: number, index: number) => ({
          name: data.labels[index],
          value,
        }))}
        cx="50%"
        cy="50%"
      >
        <Pie
          data={data.datasets[0].data.map((value: number, index: number) => ({
            name: data.labels[index],
            value,
            fill: data.datasets[0].backgroundColor[index],
          }))}
          cx="50%" 
          cy="50%" 
          labelLine={false}
          innerRadius={options?.innerRadius || 0}
          outerRadius={options?.outerRadius || 80}
          paddingAngle={options?.paddingAngle || 2}
          dataKey="value"
          nameKey="name"
        />
      </RechartsBasePie>
    </ChartContainer>
  );
};

export const BarChart: React.FC<ChartProps> = ({ data, options, className }) => {
  const defaultConfig = {
    orange: {
      color: "#f59e0b",
    },
    blue: {
      color: "#3b82f6",
    },
  };

  return (
    <ChartContainer config={defaultConfig} className={className}>
      <RechartsBaseBar
        data={data.labels.map((label: string, index: number) => {
          const point: Record<string, any> = { name: label };
          data.datasets.forEach((dataset: any, datasetIndex: number) => {
            point[dataset.label] = dataset.data[index];
          });
          return point;
        })}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        {data.datasets.map((dataset: any, index: number) => (
          <Bar
            key={index}
            dataKey={dataset.label}
            fill={dataset.backgroundColor}
          />
        ))}
      </RechartsBaseBar>
    </ChartContainer>
  );
};

export const LineChart: React.FC<ChartProps> = ({ data, options, className }) => {
  const defaultConfig = {
    orange: {
      color: "#f59e0b",
    },
    blue: {
      color: "#3b82f6",
    },
  };

  return (
    <ChartContainer config={defaultConfig} className={className}>
      <RechartsBaseLine
        data={data.labels.map((label: string, index: number) => {
          const point: Record<string, any> = { name: label };
          data.datasets.forEach((dataset: any) => {
            point[dataset.label] = dataset.data[index];
          });
          return point;
        })}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        {data.datasets.map((dataset: any, index: number) => (
          <Line
            key={index}
            type="monotone"
            dataKey={dataset.label}
            stroke={dataset.borderColor || dataset.backgroundColor}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsBaseLine>
    </ChartContainer>
  );
};
