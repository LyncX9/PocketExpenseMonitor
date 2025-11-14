import React from "react";
import { View } from "react-native";
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

const COLORS = ["#3A86FF", "#FFBE0B", "#FB6B6B", "#28A745", "#8A2BE2", "#FF6B6B"];

const PieChartSimple: React.FC<Props> = ({ data = [], width, height }) => {
  const cleaned = (Array.isArray(data) ? data : [])
    .map(x => ({
      category: x?.category || "Others",
      total: Number(x?.total) || 0
    }))
    .filter(x => x.total > 0);

  const safe = cleaned.length > 0 ? cleaned : [{ category: "No Data", total: 1 }];

  const formatted = safe.map((item, i) => ({
    name: item.category,
    population: Number(item.total) || 0,
    color: COLORS[i % COLORS.length],
    legendFontColor: "#333333",
    legendFontSize: 14
  }));

  const config = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: () => "#000",
    labelColor: () => "#000"
  };

  return (
    <View>
      <PieChart
        data={formatted}
        width={width}
        height={height}
        accessor="population"
        backgroundColor="transparent"
        chartConfig={config}
        absolute
      />
    </View>
  );
};

export default PieChartSimple;
