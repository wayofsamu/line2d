import React, { useRef, useEffect } from "react";
import { init, getInstanceByDom } from "echarts";
import type { CSSProperties } from "react";
import type { EChartsOption, ECharts, SetOptionOpts } from "echarts";

export interface ReactEChartsProps {
  data;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  theme?: "light" | "dark";
}

// set state with the result
const option: EChartsOption = {
  tooltip: {
    trigger: "axis"
  },
  grid: {
    left: "5%",
    right: "15%",
    bottom: "10%"
  },
  xAxis: {},
  yAxis: {},
  height: "70%",
  animation: false,
  dataZoom: [
    {
      startValue: 0,
      height: "10%",
      bottom: "2%"
    },
    {
      type: "inside",
      animation: false
    }
  ],
  toolbox: {
    right: 10,
    feature: {
      saveAsImage: {},
      dataView:{},
    },
  },
  series: {
    name: "output",
    type: "line",
    animation: false,
    data: []
  }
};


export function ReactECharts({
  data,
  style,
  settings,
  loading,
  theme,
}: ReactEChartsProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  option.xAxis.data = data.x;
  option.series.data = data.y;

  useEffect(() => {
    // Initialize chart
    let chart: ECharts | undefined;
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme);
      chart.setOption(option, settings);
    }

    // Return cleanup function
    return () => {
      chart?.dispose();
};
  }, [theme, chartRef, option, settings]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      chart.setOption(option, settings);
    }
  }, [option, settings, theme, chartRef]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      loading === true ? chart.showLoading() : chart.hideLoading();
    }
  }, [loading, theme, chartRef]);

  return <div ref={chartRef} style={{ width: "100%", height: "100%", ...style }} />;
}

