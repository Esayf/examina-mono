import { Badge } from "@/components/ui/badge";
import { getExamStatistics, ExamStatistics, Leaderboard, Participant } from "@/lib/Client/Exam";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AttendanceCharts from "@/components/details/attendanceCharts";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { BackgroundPattern } from "@/components/landing-page/background-pattern";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TableCellsIcon,
  ShareIcon,
  XMarkIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { useToast } from "@/components/ui/usetoast";
import { cn } from "@/lib/utils";
import DashboardHeader from "@/components/ui/dashboard-header";

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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["examStatistics", examId],
    queryFn: () => getExamStatistics(examId),
    enabled: !!examId,
  });

  if (!isExamStatistics(data)) {
    return isLoading ? <div>Loading...</div> : <div>Error</div>;
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.startDate);
  endDate.setMinutes(endDate.getMinutes() + data.duration);

  const backgroundImageUrl = data.backgroundImage
    ? `/api/proxy?hash=${data.backgroundImage}`
    : "/_next/static/media/bg-8-20.32d1d22b.svg";
  const creatorWalletAddress = data.creator;
  const creatorWalletDisplay = `${creatorWalletAddress.slice(0, 5)}...${creatorWalletAddress.slice(
    -5
  )}`;
  const creatorWalletAddressUrl = `https://minascan.io/mainnet/account/${creatorWalletAddress}`;

  const totalQuestions = data.questionCount;
  const passingScore = data.passingScore;

  const now = new Date();
  let status = "Draft";
  if (data.isCompleted) {
    status = "Ended";
  } else if (startDate > now) {
    status = "Upcoming";
  } else {
    status = "Active";
  }

  const leaderboard = data.leaderboard && data.leaderboard.length > 0 ? data.leaderboard : [];
  const participants = data.participants ?? [];

  const { showToast } = useToast();

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast({
      title: "Link copied to clipboard",
      description: "You can now paste it anywhere you want",
    });
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

  const handleDownloadSVG = async () => {
    try {
      if (!leaderboardRef.current || !data) return;

      const tableToSVG = () => {
        const headers = ["Rank", "User", "Score", "Completion Time"];
        const rows = leaderboard.map((item, index) => {
          const finishTime = new Date(item.finishTime);
          return [
            index + 1,
            walletRender(item.walletAddress),
            item.score,
            `${formatTime(finishTime)} (${(
              (new Date(item.finishTime).getTime() - new Date(item.startTime).getTime()) /
              1000 /
              60
            ).toFixed(1)} mins)`,
          ];
        });

        // Güncellenmiş Renk Paleti
        const styles = `
          <style>
            .svg-table { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .svg-header {
              fill: #ffffff;
              font-size: 20px;
              font-weight: 600;
              font-family: "var(--font-display), sans-serif;
            }
            .svg-header-bg {
              fill: #FFDBC4; /* brand-secondary-200 */
            }
            .svg-row:nth-child(odd) { 
              fill: #FFDBC4; 
            }
            .svg-row:nth-child(even) { 
              fill: #ffffff;
            }
            .svg-cell { 
              fill: #1e293b; 
              font-size: 16px;
            }
            .svg-score {
              font-weight: 700;
            }
            .svg-rank {
              fill: #6366F1; /* brand-primary-500 */
            }
            .svg-divider {
              stroke: #EDE9FE; /* brand-secondary-100 */
            }
            .svg-shadow {
              filter: drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.05));
            }
          </style>
        `;

        // Tablo boyutları
        const columnWidths = [80, 200, 100, 200];
        const rowHeight = 40;
        const headerHeight = 50;
        const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
        const tableHeight = headerHeight + rows.length * rowHeight;

        // SVG içeriğini oluştur
        let svgContent = `
          <svg xmlns="http://www.w3.org/2000/svg" 
               width="${tableWidth}" 
               height="${tableHeight}" 
               viewBox="0 0 ${tableWidth} ${tableHeight}">
            ${styles}
            <rect width="100%" height="100%" fill="#ffffff" rx="8" ry="8" class="svg-shadow"/>
            
            <!-- Başlık Arka Planı -->
            <rect width="100%" height="${headerHeight}" fill="#E0E7FF" rx="8" ry="8"/>
            
            <!-- Başlıklar -->
            <g class="svg-header">
              ${headers
                .map(
                  (header, i) => `
                <text x="${columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 15}" 
                      y="${headerHeight / 2 + 5}" 
                      fill="#374151">
                  ${header}
                </text>
              `
                )
                .join("")}
            </g>

            <!-- Satırlar -->
            ${rows
              .map(
                (row, rowIndex) => `
              <g transform="translate(0, ${headerHeight + rowIndex * rowHeight})">
                <!-- Satır Arka Planı -->
                <rect width="${tableWidth}" 
                      height="${rowHeight}" 
                      fill="${rowIndex % 2 === 0 ? "#F5F3FF" : "#FFFFFF"}"
                      rx="${rowIndex === rows.length - 1 ? "8" : "0"}" 
                      ry="${rowIndex === rows.length - 1 ? "8" : "0"}"/>
                
                ${row
                  .map(
                    (cell, cellIndex) => `
                  <!-- Hücre İçeriği -->
                  <text x="${columnWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0) + 15}" 
                        y="${rowHeight / 2 + 5}" 
                        class="${cellIndex === 0 ? "svg-rank" : ""} ${
                      cellIndex === 2 ? "svg-score" : "svg-cell"
                    }"
                        fill="${
                          cellIndex === 2 ? getScoreColorClass(Number(cell), data.passingScore) : ""
                        }">
                    ${cellIndex === 0 ? `#${cell}` : cell}
                  </text>
                  
                  <!-- Sütun Ayırıcılar -->
                  ${
                    cellIndex < 3
                      ? `
                    <line x1="${columnWidths.slice(0, cellIndex + 1).reduce((a, b) => a + b, 0)}" 
                          y1="0" 
                          x2="${columnWidths.slice(0, cellIndex + 1).reduce((a, b) => a + b, 0)}" 
                          y2="${rowHeight}" 
                          class="svg-divider"/>
                  `
                      : ""
                  }
                `
                  )
                  .join("")}
              </g>
            `
              )
              .join("")}
          </svg>
        `;

        return svgContent;
      };

      const svgContent = tableToSVG();
      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${data.title}-leaderboard.svg`;
      link.click();

      showToast({
        title: "SVG İndirildi",
        description: "Lider tablosu başarıyla SVG formatında kaydedildi",
      });
    } catch (error) {
      showToast({
        title: "SVG Hatası",
        description: "Lider tablosu SVG'ye dönüştürülemedi",
        variant: "destructive",
      });
      console.error("SVG Conversion Error:", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-brand-secondary-100">
      <DashboardHeader withoutNav={false} withoutTabs={true} />
      {/* Content Container */}
      <div className="relative flex justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[90rem]: bg-brand-secondary-50 bg-opacity-95 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl backdrop-blur-sm">
          {/* Grid Container */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {/* Title Section - Updated */}
            <div className="flex flex-col gap-2 justify-between lg:col-span-3">
              <div className="flex flex-row justify-between items-center pb-3 border-b border-gray-200">
                <div className="flex flex-row gap-4 items-center">
                  <h2 className="text-4xl font-bold text-gray-800">{data.title}</h2>
                  <Badge
                    variant={status.toLowerCase() as any}
                    className="text-sm px-4 py-1.5 rounded-full"
                  >
                    {status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-full w-9 h-9 hover:bg-brand-secondary-100 border border-gray-600 text-gray-600 cubic-bezier-4 transition-all duration-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Creator Section - Updated */}
            <div className="bg-brand-secondary-100 rounded-3xl p-6 shadow-sm border border-brand-secondary-200">
              <h3 className="text-lg font-semibold mb-2 text-brand-primary-900">Created by</h3>
              <a
                href={creatorWalletAddressUrl}
                className="text-brand-primary-700 hover:text-brand-primary-800 transition-colors break-words"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="font-display text-lg font-medium mb-3">{creatorWalletDisplay}</div>
                <span className="text-sm text-brand-primary-900 hover:text-brand-primary-500 mt-1 transition-colors">
                  View on explorer →
                </span>
              </a>
            </div>

            {/* Exam Details Section - Updated */}
            <div className="bg-brand-secondary-100 rounded-3xl p-6 shadow-sm border border-brand-secondary-200 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-brand-primary-900">Exam Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1 bg-brand-secondary-200 border border-brand-secondary-300 rounded-2xl px-4 py-3">
                  <div className="text-sm font-medium text-brand-primary-800">Duration</div>
                  <div className="font-medium">{data.duration} mins</div>
                </div>
                <div className="space-y-1 bg-brand-secondary-200 border border-brand-secondary-300 rounded-2xl px-4 py-3">
                  <div className="text-sm font-medium text-brand-primary-800">Questions</div>
                  <div className="font-medium">{totalQuestions}</div>
                </div>
                <div className="space-y-1 bg-brand-secondary-200 border border-brand-secondary-300 rounded-2xl px-4 py-3">
                  <div className="text-sm font-medium text-brand-primary-800">Passing Score</div>
                  <div className="font-medium text-brand-primary-900">{passingScore}</div>
                </div>
              </div>
            </div>

            {/* Description Section - Updated */}
            <div className="md:col-span-2 lg:col-span-3 bg-brand-secondary-100 rounded-3xl p-6 shadow-sm border border-brand-secondary-200">
              <h3 className="text-lg font-semibold mb-4 text-brand-primary-900">Description</h3>
              <ReactMarkdown
                className="prose max-w-full text-base leading-relaxed text-brand-primary-950"
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {data.description || "No description available"}
              </ReactMarkdown>
            </div>

            {/* Charts & Participants Section - Updated */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Attendance Analytics</h3>
              {participants && (
                <AttendanceCharts
                  participants={participants}
                  startDate={startDate}
                  endDate={endDate}
                />
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Participants</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {["User", "Score", "Start", "End"].map((header) => (
                        <th
                          key={header}
                          className="pb-3 px-2 text-sm font-semibold text-gray-600 text-left"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {participants?.map((item) => (
                      <tr
                        key={item.walletAddress}
                        className="hover:bg-gray-50 transition-colors even:bg-gray-50"
                      >
                        <td className="py-3 px-2 text-sm truncate max-w-[150px]">
                          <a
                            href={`https://minascan.io/mainnet/account/${item.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-primary-600 hover:underline"
                          >
                            {walletRender(item.walletAddress)}
                          </a>
                        </td>
                        <td className="py-3 px-2">
                          {item.score ? item.score : <span className="text-gray-400">-</span>}
                        </td>
                        <td className="py-3 px-2">
                          {new Date(item.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-2">
                          {item.finishTime ? (
                            new Date(item.finishTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leaderboard Section - Updated */}
            <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Leaderboard</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="gap-2">
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download PNG
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                    <ShareIcon className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="gap-2">
                    <DocumentTextIcon className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="gap-2">
                    <DocumentChartBarIcon className="h-4 w-4" />
                    SVG
                  </Button>
                </div>
              </div>
              <div ref={leaderboardRef}>
                {leaderboard.length === 0 ? (
                  <div className="text-center font-regular py-8 text-greyscale-light-400">
                    Leaderboard has not been created yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {["Rank", "User", "Score", "Completion Time"].map((header) => (
                            <th
                              key={header}
                              className="pb-3 px-2 text-sm font-semibold text-gray-600 text-left"
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
                          const timeTaken = (finishTime.getTime() - startTime.getTime()) / 1000;
                          return (
                            <tr
                              key={item.userId}
                              className="hover:bg-gray-50 transition-colors even:bg-gray-50"
                            >
                              <td className="py-3 px-2">
                                <div className="w-8 h-8 rounded-md bg-brand-primary-100/80 flex items-center justify-center">
                                  {index + 1}
                                </div>
                              </td>
                              <td className="py-3 px-2 font-medium">
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
                                className={`py-3 px-2 font-semibold ${getScoreColorClass(
                                  item.score,
                                  passingScore
                                )}`}
                              >
                                {item.score}
                              </td>
                              <td className="py-3 px-2 text-sm text-gray-500">
                                {formatTime(finishTime)}
                                <span className="block text-xs mt-1">{timeTaken} mins</span>
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
