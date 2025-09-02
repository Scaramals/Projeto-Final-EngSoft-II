import React from "react";

interface CategoryTooltipProps {
  active?: boolean;
  payload?: any[];
}

export const CategoryTooltip: React.FC<CategoryTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded shadow">
        <p className="font-medium">{data.name}</p>
        <p className="text-blue-600">Valor: R$ {data.value.toLocaleString('pt-BR')}</p>
        <p className="text-gray-600">{data.products} produtos</p>
      </div>
    );
  }
  return null;
};

interface MonthlyTrendsTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const MonthlyTrendsTooltip: React.FC<MonthlyTrendsTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded shadow">
        <p className="font-medium">{data.fullName}</p>
        <p className="text-red-600">
          Saídas: {data.saidas} unidades
        </p>
      </div>
    );
  }
  return null;
};