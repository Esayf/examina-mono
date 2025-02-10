import { Badge } from "@/components/ui/badge";
import { getExamStatistics, ExamStatistics, Participant } from "@/lib/Client/Exam";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AttendanceCharts from "@/components/details/attendanceCharts";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { useToast } from "@/components/ui/usetoast";
import { cn } from "@/lib/utils";
import DashboardHeader from "@/components/ui/dashboard-header";
import DurationFormatter from "@/components/ui/time/duration-formatter";

function walletRender(walletAddress: string): string {
  return `${walletAddress.slice(0, 5)}...${walletAddress.slice(-5)}`;
}

function isExamStatistics(obj: any): obj is ExamStatistics {
  return obj && typeof obj.title === "string";
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getScoreColorClass = (score: number, passingScore: number) => {
  return score >= passingScore ? "text-green-500" : "text-brand-primary-600";
};

const ExamDetails = () => {
  const router = useRouter();
  const leaderboardRef = React.useRef<HTMLDivElement>(null);

  const examId = router.query.examId as string;
  const { data, isLoading } = useQuery({
    queryKey: ["examStatistics", examId],
    queryFn: () => getExamStatistics(examId),
    enabled: !!examId,
  });

  if (!isExamStatistics(data)) {
    return isLoading ? <div>Loading...</div> : <div>Error</div>;
  }

  // Exam time
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.startDate);
  endDate.setMinutes(endDate.getMinutes() + data.duration);

  // Basic exam info
  const creatorWalletAddress = data.creator;
  const creatorWalletDisplay = `${creatorWalletAddress.slice(0, 5)}...${creatorWalletAddress.slice(
    -5
  )}`;
  const creatorWalletAddressUrl = `https://minascan.io/mainnet/account/${creatorWalletAddress}`;
  const totalQuestions = data.questionCount;
  const passingScore = data.passingScore;

  // Status
  const now = new Date();
  let status = "Draft";
  if (data.isCompleted) {
    status = "Ended";
  } else if (startDate > now) {
    status = "Upcoming";
  } else {
    status = "Active";
  }

  // Leaderboard & participants
  const leaderboard = data.leaderboard && data.leaderboard.length > 0 ? data.leaderboard : [];
  const participants = data.participants ?? [];

  const { showToast } = useToast();

  // Download / Share handlers
  const handleDownloadPNG = async () => {
    try {
      if (!leaderboardRef.current) return;
      const canvas = await html2canvas(leaderboardRef.current);
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${data.title}-leaderboard.png`;
      link.href = imgData;
      link.click();

      showToast({
        title: "Download started...",
        description: "Leaderboard is being downloaded as PNG...",
      });
    } catch (error) {
      showToast({
        title: "Download error!",
        description: "File could not be downloaded",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      if (!leaderboardRef.current) return;
      if (!navigator.share) {
        throw new Error("Your browser does not support sharing.");
      }

      const canvas = await html2canvas(leaderboardRef.current);
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `${data.title}-leaderboard.png`, {
          type: "image/png",
        });

        await navigator.share({
          title: data.title,
          text: "Check out this leaderboard:",
          files: [file],
        });
      });
    } catch (error) {
      showToast({
        title: "Share error...",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(leaderboard);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leaderboard");
    XLSX.writeFile(wb, `${data.title}-leaderboard.xlsx`);
  };

  const handleDownloadCSV = () => {
    const csvContent = [
      "Rank,User,Score,Completion Time",
      ...leaderboard.map((item, index) => {
        const finishTime = new Date(item.finishTime);
        return `${index + 1},${item.walletAddress},${item.score},"${finishTime.toLocaleString()}"`;
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${data.title}-leaderboard.csv`;
    link.click();
  };

  // For demonstration, we keep the handleDownloadSVG out (from your code),
  // unless you specifically want it. You can re-add if needed.

  return (
    <div className="relative min-h-screen w-full bg-brand-secondary-100">
      <DashboardHeader withoutNav={false} withoutTabs={true} />
      {/* Content Container */}
      <div className="flex justify-center p-4 md:p-6">
        {/* Main Content */}
        <div className="w-full max-w-7xl bg-white bg-opacity-95 rounded-2xl p-6 md:p-8 shadow-md space-y-6">
          {/* Title Section */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pb-3 border-b border-gray-200">
            {/* Back Button */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.back()}
                className="border-2 border-x-brand-primary-950 text-gray-600 hover:text-brand-primary-900"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
            </div>
            {/* Title & Status */}
            <div className="flex flex-col gap-1 text-center md:text-right md:gap-2">
              <h2 className="text-3xl font-bold text-gray-800">{data.title}</h2>
              <Badge
                variant={status.toLowerCase() as any}
                className="text-sm px-3 py-1 rounded-full self-end"
              >
                {status}
              </Badge>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Exam Creator */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 lg:col-span-1">
              <h3 className="text-lg font-semibold mb-3 text-brand-primary-900">Created by</h3>
              <a
                href={creatorWalletAddressUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary-700 hover:text-brand-primary-800 break-words"
              >
                <div className="font-semibold text-base mb-1">{creatorWalletDisplay}</div>
                <span className="text-xs text-brand-primary-900 hover:text-brand-primary-500">
                  View on explorer &rarr;
                </span>
              </a>
            </div>

            {/* Exam Details */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 lg:col-span-3">
              <h3 className="text-lg font-semibold mb-4 text-brand-primary-900">Exam Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-brand-secondary-50 border border-brand-secondary-300 rounded-xl text-center">
                  <div className="text-sm font-medium text-brand-primary-800">Duration</div>
                  <div className="font-semibold text-gray-700">
                    <DurationFormatter duration={data.duration} base="minutes" />
                  </div>
                </div>
                <div className="p-4 bg-brand-secondary-50 border border-brand-secondary-300 rounded-xl text-center">
                  <div className="text-sm font-medium text-brand-primary-800">Questions</div>
                  <div className="font-semibold text-gray-700">{totalQuestions}</div>
                </div>
                <div className="p-4 bg-brand-secondary-50 border border-brand-secondary-300 rounded-xl text-center">
                  <div className="text-sm font-medium text-brand-primary-800">Passing Score</div>
                  <div className="font-semibold text-gray-700">{passingScore}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4 text-brand-primary-900">Description</h3>
              <ReactMarkdown
                className="prose text-base leading-relaxed text-gray-700"
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {data.description || "No description available."}
              </ReactMarkdown>
            </div>

            {/* Exam Analytics */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 lg:col-span-3">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Exam Analytics</h3>

              {participants.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No participants data yet</div>
              ) : (
                <div className="flex flex-col md:flex-row gap-8 justify-center">
                  {/* “Completion” Donut + “Attendance” Line Chart */}
                  <AttendanceCharts
                    participants={participants}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 lg:col-span-2">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Participants</h3>
              {participants.length === 0 ? (
                <div className="text-center text-gray-500 py-4">No participants yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        {["User", "Score", "Start", "End"].map((header) => (
                          <th
                            key={header}
                            className="py-2 px-2 font-semibold text-gray-600 text-left"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p) => (
                        <tr
                          key={p.walletAddress}
                          className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <td className="py-2 px-2">
                            <a
                              href={`https://minascan.io/mainnet/account/${p.walletAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-primary-600 hover:underline"
                            >
                              {walletRender(p.walletAddress)}
                            </a>
                          </td>
                          <td className="py-2 px-2">
                            {p.score !== undefined ? (
                              p.score
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-2">{formatTime(new Date(p.startTime))}</td>
                          <td className="py-2 px-2">
                            {p.finishTime ? (
                              formatTime(new Date(p.finishTime))
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Leaderboard</h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleDownloadPNG} className="gap-2">
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    PNG
                  </Button>
                  <Button variant="outline" onClick={handleDownloadCSV} className="gap-2">
                    <DocumentTextIcon className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button variant="outline" onClick={handleShare} className="gap-2">
                    <ShareIcon className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              <div ref={leaderboardRef}>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Leaderboard has not been created yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          {["Rank", "User", "Score", "Completion Time"].map((header) => (
                            <th
                              key={header}
                              className="py-2 px-2 font-semibold text-gray-600 text-left"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((item, index) => {
                          const startTime = new Date(item.startTime);
                          const finishTime = new Date(item.finishTime);
                          const timeTaken =
                            (finishTime.getTime() - startTime.getTime()) / 1000 / 60; // in minutes

                          return (
                            <tr
                              key={item.userId}
                              className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <td className="py-2 px-2">
                                <div className="w-8 h-8 flex items-center justify-center bg-brand-primary-100/50 rounded-md">
                                  {index + 1}
                                </div>
                              </td>
                              <td className="py-2 px-2 font-medium">
                                <a
                                  href={`https://minascan.io/mainnet/account/${item.walletAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-primary-600 hover:underline"
                                >
                                  {walletRender(item.walletAddress)}
                                </a>
                              </td>
                              <td
                                className={`py-2 px-2 font-semibold ${getScoreColorClass(
                                  item.score,
                                  passingScore
                                )}`}
                              >
                                {item.score}
                              </td>
                              <td className="py-2 px-2 text-gray-500">
                                {formatTime(finishTime)}
                                <span className="block text-xs mt-1">
                                  {timeTaken.toFixed(1)} mins
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;
