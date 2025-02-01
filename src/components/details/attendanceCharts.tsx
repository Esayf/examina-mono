import * as React from "react";
import { LineChart, lineElementClasses } from "@mui/x-charts/LineChart";
import { Participant } from "@/lib/Client/Exam";
import { pieArcLabelClasses, PieChart } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";

function linspace(a: number, b: number, resolution: number): number[] {
  const step = (b - a) / resolution;
  return Array.from({ length: resolution + 1 }, (_, i) => a + i * step);
}

const StyledText = styled("text")(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: "middle",
  dominantBaseline: "central",
  fontSize: 16,
}));

function PieCenterLabel({ children }: { children: React.ReactNode }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

interface AttendanceChartsProps {
  participants: Participant[];
  startDate: Date;
  endDate: Date;
}

function AttendanceCharts({ participants, startDate, endDate }: AttendanceChartsProps) {
  const resolution = 10;
  const xLabels = linspace(Number(startDate), Number(endDate), resolution).map(
    (date) => new Date(date)
  );

  const attendanceData = xLabels.map((date) => {
    return participants.filter(
      (participant) => participant.startTime && new Date(participant.startTime) <= date
    ).length;
  });

  const finishedData = xLabels.map((date) => {
    return participants.filter(
      (participant) => participant.finishTime && new Date(participant.finishTime) <= date
    ).length;
  });

  const totalParticipants = participants.length;
  const finishedParticipants = finishedData[finishedData.length - 1] || 0;

  const pieChartData =
    totalParticipants === 0
      ? [{ label: "No Participants", value: 1 }]
      : [
          { label: "Finished", value: finishedParticipants },
          { label: "Not Finished", value: totalParticipants - finishedParticipants },
        ];

  return (
    <div className="flex flex-col gap-4">
      <PieChart
        height={250}
        colors={totalParticipants === 0 ? ["#cccccc"] : ["#1f77b4", "#ff7f0e"]}
        series={[
          {
            arcLabel: (item) =>
              totalParticipants === 0 ? "" : item.value > 0 ? `${item.value}` : "",
            innerRadius: 30,
            outerRadius: 70,
            paddingAngle: 1,
            cornerRadius: 4,
            ...{
              data: pieChartData,
              valueFormatter: (item) =>
                totalParticipants === 0
                  ? "No Data"
                  : `${((item.value / totalParticipants) * 100).toFixed(2)}%`,
            },
          },
        ]}
        sx={{
          [`& .${pieArcLabelClasses.root}`]: {
            fontWeight: "bold",
            fontSize: "10px",
          },
        }}
      >
        <PieCenterLabel>
          {totalParticipants === 0
            ? "0%"
            : `${((finishedParticipants / totalParticipants) * 100).toFixed(2)}%`}
        </PieCenterLabel>
      </PieChart>

      <div className="border-b border-greyscale-light-200"></div>

      <LineChart
        className="w-full font-heading"
        height={250}
        xAxis={[{ data: xLabels, scaleType: "time" }]}
        series={[
          { data: attendanceData, label: "Attended", area: true, showMark: false },
          { data: finishedData, label: "Finished", area: true, showMark: false },
        ]}
        sx={{
          [`& .${lineElementClasses.root}`]: {
            display: "none",
          },
        }}
      />
    </div>
  );
}

export default AttendanceCharts;
