import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
const LineChart: any = require("react-native-chart-kit").LineChart;

type Props = { data?: number[]; dayLabels?: string[]; width: number; height?: number };

const sanitizeNumber = (v: any): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") {
    if (!Number.isFinite(v) || Number.isNaN(v)) return 0;
    return v;
  }
  if (typeof v !== "string") return 0;
  let s = String(v).trim().replace(/\s/g, "");
  if (s === "" || s === "." || s === "-.") return 0;
  if (s === "-") return 0;
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
  return n;
};

const LineChartSimple: React.FC<Props> = ({ data = [], dayLabels, width, height = 220 }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const defaultLabels = (dayLabels && dayLabels.length > 0) ? dayLabels : [];
  const labels = defaultLabels.length > 0 ? defaultLabels : Array.from({ length: data.length || 7 }, (_, i) => String(i + 1));
  const arr = Array.isArray(data) && data.length > 0 ? data.map(v => sanitizeNumber(v)) : Array.from({ length: labels.length || 7 }, () => 0);

  const values = arr;
  const dataset = { data: values };

  // compute a desired chart width so dates don't clash; allow horizontal scrolling
  const dayWidth = 36; // px per day
  const chartWidth = Math.max(width, (labels.length || values.length) * dayWidth);

  let min = Math.min(...values);
  let max = Math.max(...values);
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = 0;
  if (min === max) {
    if (max === 0) {
      max = 1;
    } else {
      min = min - Math.abs(min) * 0.05;
      max = max + Math.abs(max) * 0.05;
    }
  }

  const selectedValue = selectedIndex !== null && selectedIndex < values.length ? values[selectedIndex] : null;
  const selectedLabel = selectedIndex !== null && selectedIndex < labels.length ? labels[selectedIndex] : null;

  return (
    <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 8, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
      <LineChart
        data={{ labels: labels.slice(0, values.length), datasets: [dataset] }}
        width={Math.max(200, chartWidth)}
        height={height}
        chartConfig={{
          backgroundGradientFrom: "#FFFFFF",
          backgroundGradientTo: "#FFFFFF",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(58,134,255,${opacity})`,
          labelColor: (opacity = 1) => `rgba(107,114,128,${opacity})`,
          strokeWidth: 2,
          propsForDots: {
            r: "3",
            strokeWidth: "0",
            fill: "#3A86FF"
          }
        }}
        bezier
        withDots
        withInnerLines
        withVerticalLines={false}
        fromZero={min >= 0}
        yAxisInterval={1}
        style={{ borderRadius: 12 }}
        onDataPointClick={(d: any) => {
          if (typeof d?.index === "number") setSelectedIndex(d.index);
        }}
        segments={4}
      />
      </ScrollView>
      {selectedValue !== null && selectedLabel && (
        <View style={{ paddingTop: 8, alignItems: "center" }}>
          <Text style={{ fontSize: 12, color: "#3A86FF", fontWeight: "600" }}>{selectedLabel}: {Math.round(selectedValue * 100) / 100}</Text>
        </View>
      )}
    </View>
  );
};

export default LineChartSimple;
