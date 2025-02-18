import { Participant } from "@/lib/Client/Exam";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend as ReLegend,
} from "recharts";
import {
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Legend,
  ReferenceLine,
} from "recharts";

/**
 * [a, b] aralığını resolution+1 adımda böler
 */
function linspace(a: number, b: number, resolution: number): number[] {
  const step = (b - a) / resolution;
  return Array.from({ length: resolution + 1 }, (_, i) => a + i * step);
}

interface AttendanceChartsProps {
  participants: Participant[];
  startDate: Date;
  endDate: Date;
}

export default function AttendanceCharts({
  participants,
  startDate,
  endDate,
}: AttendanceChartsProps) {
  // Tarih adımları
  const resolution = 10;
  const xLabels = linspace(+startDate, +endDate, resolution).map((date) => new Date(date));

  // Katılan/Bitiren sayısını zamana göre hesaplıyoruz
  const lineData = xLabels.map((date) => {
    const attended = participants.filter(
      (p) => p.startTime && new Date(p.startTime) <= date
    ).length;
    const finished = participants.filter(
      (p) => p.finishTime && new Date(p.finishTime) <= date
    ).length;

    return {
      date: date.toLocaleString("tr-TR"),
      attended,
      finished,
    };
  });

  const totalParticipants = participants.length;
  const finishedParticipants = lineData[lineData.length - 1]?.finished || 0;
  const notFinishedParticipants = totalParticipants - finishedParticipants;

  // PieChart verisi
  const pieData =
    totalParticipants === 0
      ? [{ name: "No Participants", value: 1 }]
      : [
          { name: "Finished", value: finishedParticipants },
          { name: "Not Finished", value: notFinishedParticipants },
        ];

  // Pastel / doodle tonları
  const pastelPink = "#F6BDC0";
  const pastelGreen = "#A9DEDA";
  const pastelGray = "#C1BEC0"; // No Participants durumda
  const PIE_COLORS = totalParticipants === 0 ? [pastelGray] : [pastelPink, pastelGreen];

  // Pie dilim etiketine emoji + değer koyalım
  const renderPieLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, name, value } = props;
    if (name === "No Participants" || value === 0) return "";

    const emoji = name === "Finished" ? "✨" : "⏳";

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#555"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {emoji} {value}
      </text>
    );
  };

  // AreaChart için iki gradyan
  const attendedColor = "#F9A5B2"; // pembemsi
  const finishedColor = "#E4F1EA"; // açık yeşil

  return (
    <div
      className="
        w-full
        max-w-7xl
        mx-auto
        mt-6
        p-6
        rounded-2xl
        border
        border-solid
        border-brand-secondary-300
        bg-brand-secondary-50
        text-brand-primary-900
        flex
        flex-col
        lg:flex-row
        gap-10
      "
      style={{
        fontFamily: "var(--font-display), sans-serif", // Kendi fontunuzu kullanın
      }}
    >
      {/* -------- PIE CHART -------- */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-lg md:text-2xl font-bold mb-1 text-[#F06543]">Completion</h2>
        <p className="text-sm md:text-sm mb-4 text-center text-[#7F95D1]">
          How many people finished, who's still going?
        </p>

        <div className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                label={renderPieLabel}
                labelLine={false}
                isAnimationActive={true}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                    stroke="#00000022"
                    strokeWidth={1.5}
                  />
                ))}
              </Pie>
              <ReTooltip
                contentStyle={{
                  backgroundColor: "#F5F5DC",
                  borderRadius: "6px",
                  border: "1px dashed #FFAB76",
                }}
                itemStyle={{ color: "#333" }}
                formatter={(value: number, name: string) => {
                  if (name === "No Participants") return ["No data", ""];
                  return [`${value} participants`, name];
                }}
              />
              <ReLegend
                verticalAlign="bottom"
                wrapperStyle={{
                  color: "#444",
                  fontSize: "10px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {totalParticipants > 0 && (
          <div className="mt-3 text-center text-sm font-medium text-[#2C3639]">
            <span className="text-[#E6779E]">
              {finishedParticipants}/{totalParticipants}
            </span>{" "}
            completed (% {Math.round((finishedParticipants / totalParticipants) * 100)})
          </div>
        )}
        {totalParticipants === 0 && (
          <div className="mt-2 text-center text-base font-medium text-red-500">
            No Participants :(
          </div>
        )}
      </div>

      {/* -------- AREA CHART -------- */}
      <div className="flex-1 flex flex-col items-center justify-start">
        <h2 className="text-lg md:text-2xl font-bold mb-1 text-[#F06543]">Attendance</h2>
        <p className="text-sm md:text-sm mb-4 text-center text-[#7F95D1]">
          Participation and completion status over time
        </p>

        <div className="w-full h-[280px] sm:h-[300px]">
          <ResponsiveContainer>
            <AreaChart data={lineData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <defs>
                <linearGradient id="colorAttended" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={attendedColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={attendedColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFinished" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={finishedColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={finishedColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="4 4" stroke="#E4C3AD" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#2C3639" }}
                tickLine={{ stroke: "#FFAB76", strokeWidth: 2, strokeDasharray: "2 2" }}
                axisLine={{ stroke: "#FFAB76", strokeWidth: 2, strokeDasharray: "2 2" }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#2C3639" }}
                allowDecimals={false}
                axisLine={{ stroke: "#FFAB76", strokeWidth: 2, strokeDasharray: "2 2" }}
                tickLine={{ stroke: "#FFAB76", strokeWidth: 2, strokeDasharray: "2 2" }}
                label={{
                  value: "Participants",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#5C527F",
                  fontSize: 14,
                  offset: 0,
                }}
              />

              <Tooltip
                formatter={(value: number, name: string) => [`${value} participants`, name]}
                contentStyle={{
                  backgroundColor: "#F5F5DC",
                  borderRadius: "4px",
                  border: "1px dashed #FFAB76",
                }}
                itemStyle={{ color: "#333" }}
              />
              <Legend
                verticalAlign="top"
                align="center"
                wrapperStyle={{
                  fontSize: "10px",
                  color: "#444",
                }}
              />

              <ReferenceLine y={0} stroke="#000" strokeOpacity={0.1} />

              {/* Attended */}
              <Area
                type="monotone"
                dataKey="attended"
                stroke="#F18F8F"
                strokeWidth={2}
                fill="url(#colorAttended)"
                dot={{ stroke: "#F18F8F", strokeWidth: 2, r: 3 }}
                activeDot={{
                  r: 5,
                  fill: "#F18F8F",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
              />

              {/* Finished */}
              <Area
                type="monotone"
                dataKey="finished"
                stroke="#FFD966"
                strokeWidth={2}
                fill="url(#colorFinished)"
                dot={{ stroke: "#FFD966", strokeWidth: 2, r: 3 }}
                activeDot={{
                  r: 5,
                  fill: "#FFD966",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
