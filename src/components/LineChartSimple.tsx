import React from "react";
import { View } from "react-native";
const LineChart: any = require("react-native-chart-kit").LineChart;

type Props = { data?: number[]; width: number; height?: number };

const LineChartSimple: React.FC<Props> = ({ data = [0,0,0,0,0,0,0], width, height = 220 }) => {
  const labels = ["S","M","T","W","T","F","S"];
  const dataset = { data: data.map(v => Number(v || 0)) };
  return (
    <View>
      <LineChart
        data={{ labels, datasets: [dataset] }}
        width={width}
        height={height}
        chartConfig={{
          backgroundGradientFrom: "#FFFFFF",
          backgroundGradientTo: "#FFFFFF",
          decimalPlaces: 0,
          color: () => "#3A86FF",
          labelColor: () => "#6B7280",
        }}
        bezier
        withDots
        fromZero
      />
    </View>
  );
};

export default LineChartSimple;
