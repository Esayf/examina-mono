import * as React from 'react';
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart';
import { Participant } from '@/lib/Client/Exam';
import { pieArcLabelClasses, PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';

function linspace(a: number, b: number, resolution: number): number[] {
  const step = (b - a) / resolution;
  return Array.from({ length: resolution + 1 }, (_, i) => a + i * step);
}

const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
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


interface AttendanceAreaChartProps {
  participants: Participant[];
  startDate: Date;
  endDate: Date;
}

function AttendanceAreaChart({participants, startDate, endDate}: AttendanceAreaChartProps) {
  const resolution = 10;
  const xLabels = linspace(Number(startDate), Number(endDate), resolution).map(date => new Date(date));
  
  const attendanceData = xLabels.map(date => {
    return participants.filter(participant => 
      participant.startTime && new Date(participant.startTime) <= date
    ).length;
  });

  const finishedData = xLabels.map(date => {
    return participants.filter(participant => 
      participant.finishTime && new Date(participant.finishTime) <= date
    ).length;
  });

  const totalParticipants = participants.length;
  const finishedParticipants = finishedData[finishedData.length - 1]
  
  const pieChartData = [
    {label: "Finished", value: finishedParticipants},
    {label: "Not Finished", value: totalParticipants - finishedParticipants},
  ];

  return (
    <>
    <LineChart
      width={500}
      height={300}
      xAxis={[{ data: xLabels, scaleType: 'time' }]}
      series={[
        { data: attendanceData, label: 'Attended', area: true, showMark: false },
        { data: finishedData, label: 'Finished', area: true, showMark: false },
      ]}
      sx={{
        [`& .${lineElementClasses.root}`]: {
          display: 'none',
        },
      }}
    />

    <PieChart
      width={300}
      height={300}
      colors={["#1f77b4", "#ff7f0e"]}
      series={[
        {
          arcLabel: (item) => item.value>0? `${item.value}`: '',
          innerRadius: 30,
          outerRadius: 70,
          paddingAngle: 1,
          cornerRadius: 4,
          ...{
            data: pieChartData,
            valueFormatter: (item) => `${((item.value/totalParticipants)*100).toFixed(2)}%`,
          },
        },
      ]}
      sx={{
        [`& .${pieArcLabelClasses.root}`]: {
          fontWeight: 'bold',
          fontSize: '10px',
        },
      }}
  >
  <PieCenterLabel> 
    {`${((finishedParticipants/totalParticipants)*100).toFixed(2)}%`}
  </PieCenterLabel>
  </PieChart>

  </>

  );
}

export default AttendanceAreaChart;