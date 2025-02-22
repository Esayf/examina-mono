import { Badge } from "@/components/ui/badge";
import { getExamStatistics, ExamStatistics, Participant } from "@/lib/Client/Exam";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useState, useMemo } from "react";
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
  TrophyIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { useToast } from "@/components/ui/usetoast";
import { cn } from "@/lib/utils";
import DashboardHeader from "@/components/ui/dashboard-header";
import DurationFormatter from "@/components/ui/time/duration-formatter";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { QRCodeSVG } from "qrcode.react";
import { ExamSummaryPDF } from "@/components/pdf/ExamSummaryPDF";
import { Input } from "@/components/ui/input";
import { SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";
import { Select } from "@/components/ui/select";

function walletRender(walletAddress: string): string {
  return `${walletAddress.slice(0, 5)}...${walletAddress.slice(-5)}`;
}

function isExamStatistics(obj: any): obj is ExamStatistics {
  return obj && typeof obj.title === "string";
}

const formatTime = (date: Date) => {
  return date.toLocaleString([], {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getScoreColorClass = (score: number, passingScore: number) => {
  return score >= passingScore ? "text-green-500" : "text-brand-primary-600";
};

const ExamDetails = () => {
  const router = useRouter();
  const leaderboardRef = React.useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "in_progress">("all");

  const examId = router.query.examId as string;
  const { data, isLoading } = useQuery({
    queryKey: ["examStatistics", examId],
    queryFn: () => getExamStatistics(examId),
    enabled: !!examId,
  });

  const filteredParticipants = useMemo(() => {
    if (!data || !isExamStatistics(data)) {
      return [];
    }

    const participants = data.participants || [];
    return participants.filter((participant) => {
      const matchesSearch = participant.walletAddress
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && participant.finishTime) ||
        (statusFilter === "in_progress" && !participant.finishTime);

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || !isExamStatistics(data)) {
    return <div>Error</div>;
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
  const participants: Participant[] = data.participants || [];

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

  const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Completed", value: "completed" },
    { label: "Not completed", value: "in_progress" },
  ];

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

  const examSummaryData = {
    title: data.title,
    description: data.description,
    creator: creatorWalletDisplay,
    startDate: startDate,
    duration: data.duration,
    questionCount: totalQuestions,
    passingScore: passingScore,
    participantCount: participants?.length || 0,
    status: status,
    averageScore: leaderboard.reduce((acc, curr) => acc + curr.score, 0) / leaderboard.length || 0,
  };

  const shareUrl = `${window.location.origin}/exam/${examId}`;

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-brand-secondary-50 to-brand-secondary-100">
      <DashboardHeader withoutNav={false} withoutTabs={true} />

      {/* Hero Section */}
      <div className="w-full bg-brand-primary-900 text-white py-2 sm:py-4 md:py-8 px-2 sm:px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-white hover:bg-brand-secondary-300"
              >
                <ArrowLeftIcon className="h-4 sm:h-5 w-4 sm:w-5" />
              </Button>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{data.title}</h2>
                <p className="text-sm sm:text-base text-brand-secondary-200 mt-1">
                  Created by {creatorWalletDisplay}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
              <Badge
                variant={status.toLowerCase() as any}
                className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-1.5 rounded-full"
              >
                {status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-2 sm:py-4 md:py-8">
        <div className="grid grid-cols-1 gap-2 sm:gap-4 md:gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
            {[
              {
                title: "Start Date",
                value: formatTime(startDate),
                icon: <CalendarIcon className="h-5 w-5 text-brand-primary-600" />,
              },
              {
                title: "End Date",
                value: formatTime(endDate),
                icon: <CalendarIcon className="h-5 w-5 text-brand-primary-600" />,
              },
              {
                title: "Duration",
                value: <DurationFormatter duration={data.duration} base="minutes" />,
                icon: <ClockIcon className="h-5 w-5 text-brand-primary-600" />,
              },
              {
                title: "Questions",
                value: totalQuestions,
                icon: <QuestionMarkCircleIcon className="h-5 w-5 text-brand-primary-600" />,
              },
              {
                title: "Passing Score",
                value: passingScore,
                icon: <CheckCircleIcon className="h-5 w-5 text-brand-primary-600" />,
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-1">
                  {stat.icon}
                  <div className="text-sm font-medium text-gray-500">{stat.title}</div>
                </div>
                <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Description Card */}
          <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-brand-primary-600" />
              Description
            </h3>
            <ReactMarkdown
              className="prose prose-sm max-w-none text-gray-600 overflow-y-auto whitespace-normal break-words"
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {data.description || "No description available."}
            </ReactMarkdown>
          </div>

          {/* Analytics Section */}
          <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">Exam Analytics</h3>
            {participants.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No participants data available yet</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center">
                <AttendanceCharts
                  participants={participants}
                  startDate={startDate}
                  endDate={endDate}
                  passingScore={passingScore}
                />
              </div>
            )}
          </div>

          {/* Leaderboard Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TrophyIcon className="h-5 w-5 text-brand-primary-600" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Leaderboard</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={handleDownloadPNG}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    PNG
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {leaderboard.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <TrophyIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No leaderboard data available yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                          Score
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaderboard.map((entry, index) => (
                        <tr key={entry.userId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium">#{index + 1}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {walletRender(entry.walletAddress)}
                          </td>
                          <td
                            className={cn(
                              "px-6 py-4",
                              getScoreColorClass(entry.score, passingScore)
                            )}
                          >
                            {entry.score}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {formatTime(new Date(entry.finishTime))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Participants Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                <div className="w-full sm:flex-1">
                  <Input
                    type="search"
                    placeholder="Search by wallet address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-full inline-block align-middle">
                  {filteredParticipants.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500">No participants found</p>
                      {(searchTerm || statusFilter !== "all") && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                          }}
                          className="mt-2 text-sm text-brand-primary-800 hover:text-brand-primary-500"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                            User
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                            Start Time
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredParticipants.map((participant) => (
                          <tr
                            key={participant.userId}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {walletRender(participant.walletAddress)}
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                              {formatTime(new Date(participant.startTime))}
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant={participant.finishTime ? "default" : "secondary"}
                                className={cn(
                                  "text-sm px-4 py-1.5 rounded-full",
                                  participant.finishTime ? "bg-green-100 text-green-800" : ""
                                )}
                              >
                                {participant.finishTime ? "Completed" : "Not completed"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Summary Card */}
          <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1 space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quiz Summary</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  You can download the exam details as a PDF or share it with the QR code.
                </p>
              </div>

              <div className="flex flex-row md:flex-col lg:flex-row gap-4 items-center w-full md:w-auto">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <QRCodeSVG value={shareUrl} size={100} level="L" includeMargin={true} />
                </div>

                <div className="flex flex-col gap-2">
                  <PDFDownloadLink
                    document={<ExamSummaryPDF data={examSummaryData} />}
                    fileName={`${data.title.toLowerCase().replace(/\s+/g, "-")}-${
                      new Date().toISOString().split("T")[0]
                    }.pdf`}
                  >
                    {({ loading, error }) => {
                      if (error) {
                        showToast({
                          title: "PDF Error!",
                          description: "Error while creating file",
                          variant: "destructive",
                        });
                      }
                      return (
                        <Button
                          variant="outline"
                          className="gap-2 w-full"
                          disabled={loading}
                          onClick={() => {
                            if (!loading) {
                              showToast({
                                title: "Preparing...",
                                description: "File is being prepared",
                              });
                            }
                          }}
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                          {loading ? "Preparing..." : "Download PDF"}
                        </Button>
                      );
                    }}
                  </PDFDownloadLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;
