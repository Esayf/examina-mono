import { Badge } from "@/components/ui/badge";
import { getExamStatistics, ExamStatistics, Participant } from "@/lib/Client/Exam";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useState, useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  InformationCircleIcon,
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [showDescription, setShowDescription] = useState(false);

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
      const matchesSearch =
        participant.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && participant.isCompleted === true) ||
        (statusFilter === "in_progress" && participant.isCompleted === false);

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  // Add smooth transition for navigation
  const handleBack = () => {
    // Add exit animation class
    document.body.classList.add("fade-out");

    // Wait for animation to complete before navigation
    setTimeout(() => {
      router.back();
    }, 200);
  };

  // Remove animation class when component mounts
  useEffect(() => {
    document.body.classList.remove("fade-out");
  }, []);

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
  const leaderboard =
    data.leaderboard && data.leaderboard.length > 0
      ? data.leaderboard.filter((l) => l.isCompleted)
      : [];
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
    averageScore:
      leaderboard.length > 0
        ? leaderboard.reduce((acc, curr) => acc + curr.score, 0) / leaderboard.length
        : 0,
  };

  const shareUrl = `${window.location.origin}/exam/${examId}`;

  const averageScore = examSummaryData.averageScore;
  const passRate =
    leaderboard.length > 0
      ? (leaderboard.filter((l) => l.score >= passingScore).length / leaderboard.length) * 100
      : 0;
  const avgCompletionTime = (data.duration / 60).toFixed(1);
  const activeParticipants = filteredParticipants.length;

  return (
    <div className="relative min-h-screen h-dvh flex flex-col z-0 animate-fadeIn">
      <DashboardHeader withoutTabs={false} withoutNav={true} />
      <div className="px-4 lg:px-8 py-4 lg:pb-4 lg:pt-2 h-full flex flex-col rounded-b-3xl">
        <Card className="bg-base-white rounded-3xl border border-greyscale-light-200 flex-1 flex flex-col">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
              <div className="flex items-center gap-4">
                <Button variant="default" size="icon" onClick={handleBack}>
                  <ArrowLeftIcon className="h-6 w-6" />
                </Button>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl font-bold text-brand-primary-900">
                      {data.title}
                    </CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border-none">
                            <InformationCircleIcon className="h-6 w-6 text-brand-primary-900" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px] p-4 border border-brand-primary-900 bg-base-white">
                          <ReactMarkdown
                            className="prose bg-base-white prose-sm max-w-none text-brand-primary-900"
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeSanitize]}
                          >
                            {data.description || "No description available."}
                          </ReactMarkdown>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <CardDescription className="text-greyscale-light-600">
                    Created by {creatorWalletDisplay}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={data.isPrivate ? "secondary" : "default"}
                  className={cn(
                    "text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border-2",
                    "font-semibold shadow-sm transition-all hover:scale-105",
                    data.isPrivate
                      ? "border-purple-400 bg-purple-50 text-purple-700 hover:bg-purple-100"
                      : "border-green-400 bg-green-50 text-green-700 hover:bg-green-100"
                  )}
                >
                  {data.isPrivate ? "Private" : "Public"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          {/* Quick Stats */}
          <div className="lg:col-span-3 flex flex-wrap gap-2 overflow-x-auto overflow-y-hidden border-b border-greyscale-light-200 px-4 py-4 sm:px-6 sm:py-6">
            {[
              {
                title: "Quiz Status",
                value: status,
                icon: <InformationCircleIcon className="h-4 w-4" />,
              },
              {
                title: "Start",
                value: formatTime(startDate),
                icon: <CalendarIcon className="h-4 w-4" />,
              },
              {
                title: "End",
                value: formatTime(endDate),
                icon: <CalendarIcon className="h-4 w-4" />,
              },
              {
                title: "Duration",
                value: <DurationFormatter duration={data.duration} base="minutes" />,
                icon: <ClockIcon className="h-4 w-4" />,
              },
              {
                title: "Questions",
                value: totalQuestions,
                icon: <QuestionMarkCircleIcon className="h-4 w-4" />,
              },
              {
                title: "Passing Score",
                value: passingScore,
                icon: <CheckCircleIcon className="h-4 w-4" />,
              },
              {
                title: "Reward Status",
                value: data.isRewarded ? "Rewarded" : "Not Rewarded",
                icon: <TrophyIcon className="h-4 w-4" />,
              },
            ].map((stat, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-100/80 hover:bg-gray-200/80 text-gray-700"
              >
                {stat.icon}
                <span className="text-gray-500">{stat.title}:</span>
                <span>{stat.value}</span>
              </Badge>
            ))}
          </div>

          <CardContent className="px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-y-auto">
            {/* Analytics Section */}
            <div className="lg:col-span-3">
              <Card className="bg-gray-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ChartBarIcon className="h-4 w-4 text-brand-primary-600" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {participants.length === 0 ? (
                    <div className="text-center py-8 bg-white/50 rounded-lg">
                      <DocumentTextIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">No participants data available yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Participants</p>
                        <p className="text-2xl font-semibold">{participants.length}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Completed Quizzes</p>
                        <p className="text-2xl font-semibold">{leaderboard.length}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Average Score</p>
                        <p className="text-2xl font-semibold">
                          {(
                            leaderboard.reduce((acc, curr) => acc + curr.score, 0) /
                              leaderboard.length || 0
                          ).toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Pass Rate</p>
                        <p className="text-2xl font-semibold">{passRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard Section */}
            <div className="lg:col-span-3">
              <Card className="bg-gray-50/50">
                <CardHeader className="pb-3 justify-between">
                  <div className="flex justify-between w-full gap-2 flex-row">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <TrophyIcon className="h-5 w-5 text-brand-primary-600" />
                      Leaderboard
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="icon" onClick={handleDownloadPNG}>
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleDownloadExcel}>
                        <DocumentTextIcon className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleShare}>
                        <ShareIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
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
                            <tr
                              key={entry.userId}
                              className={cn(
                                "hover:bg-gray-50 transition-colors",
                                index === 0 && "bg-yellow-50/30 hover:bg-yellow-100/30",
                                index === 1 && "bg-gray-100/30 hover:bg-gray-200/30",
                                index === 2 && "bg-amber-100/30 hover:bg-amber-200/30"
                              )}
                            >
                              <td className="px-6 py-4 font-medium">
                                {index < 3 ? (
                                  <div className="flex items-center gap-2">
                                    {index === 0 && (
                                      <svg
                                        className="w-5 h-5 text-yellow-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                    )}
                                    {index === 1 && (
                                      <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                    )}
                                    {index === 2 && (
                                      <svg
                                        className="w-5 h-5 text-amber-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                    )}
                                    <span
                                      className={cn(
                                        index === 0
                                          ? "text-yellow-600"
                                          : index === 1
                                          ? "text-gray-600"
                                          : "text-amber-800"
                                      )}
                                    >
                                      #{index + 1}
                                    </span>
                                  </div>
                                ) : (
                                  `#${index + 1}`
                                )}
                              </td>
                              <td className="px-6 py-4 font-medium text-gray-900">
                                {walletRender(entry.walletAddress)}
                              </td>
                              <td
                                className={cn(
                                  "px-6 py-4 font-semibold",
                                  getScoreColorClass(entry.score, passingScore),
                                  index < 3 && "text-lg"
                                )}
                              >
                                {entry.score}
                              </td>
                              <td className="px-6 py-4 text-gray-500">
                                {entry.finishTime ? formatTime(new Date(entry.finishTime)) : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Participants Section */}
            <div className="lg:col-span-3">
              <Card className="bg-gray-50/50">
                <CardHeader className="pb-3">
                  <div className="flex justify-between w-full gap-2 flex-col md:flex-row">
                    <CardTitle className="text-base font-semibold flex gap-2">
                      <UsersIcon className="h-5 w-5 text-brand-primary-600" />
                      Participants
                      <Badge variant="secondary" className="ml-2">
                        {filteredParticipants.length}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-full">
                        <Input
                          type="search"
                          placeholder="Search participants..."
                          value={searchTerm}
                          className="min-w-[15rem]"
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
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
                </CardHeader>
                <CardContent className="pt-0">
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
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="min-w-full inline-block align-middle">
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
                                  {participant.startTime
                                    ? formatTime(new Date(participant.startTime))
                                    : "N/A"}
                                </td>
                                <td className="px-6 py-4">
                                  <Badge
                                    variant={participant.isCompleted ? "default" : "secondary"}
                                    className={cn(
                                      "text-sm px-4 py-1.5 rounded-full",
                                      participant.isCompleted ? "bg-green-100 text-green-800" : ""
                                    )}
                                  >
                                    {participant.isCompleted ? "Completed" : "Not completed"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamDetails;
