import React from "react";
import { View, Text } from "react-native";
import { PieChart } from "react-native-chart-kit";

type Item = {
  category: string;
  total: number;
};

type Props = {
  data: Item[];
  width: number;
  height: number;
};

const COLORS = ["#3A86FF", "#FFBE0B", "#FB6B6B", "#28A745", "#8A2BE2", "#FF6B6B", "#20C997", "#FD7E14"];

const sanitizeNumber = (v: any): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") {
    if (!Number.isFinite(v) || Number.isNaN(v)) return 0;
    return v >= 0 ? v : 0;
  }
  if (typeof v !== "string") return 0;
  let s = String(v).trim().replace(/\s/g, "");
  if (s === "" || s === "-" || s === "." || s === "-.") return 0;
  s = s.replace(/[^\d.,-]/g, "");
  if (s === "" || s === "-") return 0;
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma && !hasDot) {
    const commaCount = (s.match(/,/g) || []).length;
    if (commaCount === 1 && s.split(",")[1]?.length <= 2) {
      s = s.replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasDot && !hasComma) {
    const dotCount = (s.match(/\./g) || []).length;
    if (dotCount > 1 || (dotCount === 1 && s.split(".")[1]?.length > 2)) {
      s = s.replace(/\./g, "");
    }
  }
  s = s.replace(/[^\d.-]/g, "");
  if (s === "" || s === "-" || s === "." || s === "-.") return 0;
  const n = Number(s);
  if (!Number.isFinite(n) || Number.isNaN(n)) return 0;
  return n >= 0 ? n : 0;
};

const PieChartSimple: React.FC<Props> = ({ data = [], width, height }) => {
  const cleaned = (Array.isArray(data) ? data : [])
    .map(x => {
      const total = sanitizeNumber(x?.total);
      return {
        category: String(x?.category || "Others"),
        total: total
      };
    })
    .filter(x => x.total > 0);

  if (cleaned.length === 0) {
    return (
      <View style={{ width, height, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, padding: 20 }}>
        <Text style={{ color: "#6B7280", fontSize: 14 }}>No expense data available</Text>
      </View>
    );
  }

  const formatted = cleaned.map((item, i) => ({
    name: item.category,
    population: item.total,
    color: COLORS[i % COLORS.length],
    legendFontColor: "#4B5563",
    legendFontSize: 12
  }));

  const config = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: () => "#3A86FF",
    labelColor: () => "#4B5563"
  };

  return (
    <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 8, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
      <PieChart
        data={formatted}
        width={width}
        height={height}
        accessor="population"
        backgroundColor="transparent"
        chartConfig={config}
        absolute
        hasLegend
      />
    </View>
  );
};

export default PieChartSimple;
