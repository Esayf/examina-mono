"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/utils/formatter";
import { cn } from "@/lib/utils";
import {
  GetExamsParams,
  JoinedExamResponse,
  getAllJoinedExams,
  getExamList,
  getScore,
} from "@/lib/Client/Exam";

// Reusable UI Components
import { CopyLink } from "@/components/ui/copylink";
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/ui/dashboard-header";
import EmptyState from "@/images/emptystates.svg";
import BGR from "@/images/backgrounds/bg-8-20.svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeaderContent,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
const FILTER_OPTIONS = ["All", "Active", "Ended"] as const;

// Shadcn UI dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Heroicons & React Icons
import {
  ArrowUpRightIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronUpDownIcon,
  ShareIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { FaTwitter, FaTelegramPlane, FaEnvelope, FaWhatsapp, FaFacebookF } from "react-icons/fa";

// QR code
import { QRCodeCanvas } from "qrcode.react";
import { Input } from "@/components/ui/input";

/* ---------------------------------------------------------
   1) Katıldığı quiz verisini çekecek API fonksiyonu.
   (Örnek: /api/exams/joined)
   ----------------------------------------------------------
*/
async function getJoinedExams() {
  const res = await fetch("/api/exams/joined");
  if (!res.ok) throw new Error("Failed to fetch joined exams");
  return res.json();
}

// Filtre seçenekleri
type FilterOption = (typeof FILTER_OPTIONS)[number];
type SortField =
  | "title"
  | "startDate"
  | "endDate"
  | "duration"
  | "status"
  | "score"
  | "completedAt";

/****************************************
 * Sıralama ikonu (küçük helper)
 ****************************************/
function renderSortIcon(currentField: SortField, sortField: SortField, sortAsc: boolean) {
  if (currentField === sortField) {
    return sortAsc ? (
      <ArrowUpIcon className="w-4 h-4 inline ml-1" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 inline ml-1" />
    );
  }
  return <ChevronUpDownIcon className="w-4 h-4 inline ml-1 text-gray-400" />;
}

/****************************************
 * Paylaşım (Share) Modal
 ****************************************/
interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  quizLink: string;
}

function ShareModal({ open, onClose, quizLink }: ShareModalProps) {
  // Paylaşım seçenekleri
  const shareOptions = [
    {
      name: "Telegram",
      icon: <FaTelegramPlane />,
      onClick: () =>
        window.open(`https://t.me/share/url?url=${encodeURIComponent(quizLink)}`, "_blank"),
    },
    {
      name: "Twitter",
      icon: <FaTwitter />,
      onClick: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(quizLink)}`,
          "_blank"
        ),
    },
    {
      name: "Facebook",
      icon: <FaFacebookF />,
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(quizLink)}`,
          "_blank"
        ),
    },
    {
      name: "E-mail",
      icon: <FaEnvelope />,
      onClick: () =>
        window.open(`mailto:?subject=Quiz&body=${encodeURIComponent(quizLink)}`, "_blank"),
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp />,
      onClick: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`Check this quiz out! ${quizLink}`)}`,
          "_blank"
        ),
    },
  ];

  // QR kodu indirme
  const downloadQRCode = () => {
    const canvas = document.getElementById("quizQrCode") as HTMLCanvasElement | null;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "quiz-qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-4 relative bg-base-white">
        {/* Kapatma butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-greyscale-light-600 hover:bg-brand-primary-50 rounded-full p-1 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-md font-bold text-brand-primary-900">
            Share with:
          </DialogTitle>
        </DialogHeader>

        {/* Sosyal medya ikonları */}
        <div className="flex justify-center items-center gap-5 mt-4 mb-6">
          {shareOptions.map(({ name, icon, onClick }) => (
            <button
              key={name}
              onClick={onClick}
              className={cn(
                "flex flex-col items-center",
                "text-brand-primary-950",
                "hover:text-brand-primary-900",
                "focus:outline-none",
                "transition-transform duration-150",
                "hover:scale-105 active:scale-95"
              )}
            >
              <div className="w-12 h-12 flex items-center justify-center bg-brand-primary-50/80 hover:bg-brand-primary-100 rounded-full mb-1 transition-colors">
                <span className="text-xl text-brand-primary-900">{icon}</span>
              </div>
              <span className="text-xs font-medium">{name}</span>
            </button>
          ))}
        </div>

        {/* Link kopyala */}
        <p className="text-center text-sm text-gray-500 mb-2">Or share with link</p>
        <div className="mb-6">
          <CopyLink link={quizLink} label="Quiz link" />
        </div>

        {/* QR kod + download butonu */}
        <div className="flex flex-col items-center gap-3">
          <QRCodeCanvas id="quizQrCode" value={quizLink} size={150} bgColor="#FFFFFF" level="M" />
          <Button
            variant="outline"
            onClick={downloadQRCode}
            className="gap-2 hover:bg-brand-primary-50 hover:text-brand-primary-900"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            QR Kodunu İndir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/****************************************
 * JoinedExam satırı (Row) bileşeni
 ****************************************/
interface RowProps {
  exam: JoinedExamResponse;
}

function JoinedRow({ exam }: RowProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const router = useRouter();

  // Status
  const startDate = new Date(exam.examStartDate);
  const endDate = new Date(exam.examEndDate);

  return (
    <div
      className={cn(
        "flex flex-col",
        "transition-colors duration-200 ease-in-out hover:bg-brand-primary-50 hover:text-brand-primary-600"
      )}
    >
      <div className="text-greyscale-light-700">
        <div
          className="
            flex font-medium border-t border-greyscale-light-200 bg-white
            hover:bg-brand-primary-50 hover:text-brand-primary-600
            transition-colors duration-200 ease-in-out
          "
        >
          {/* Title */}
          <div className="flex-1 p-5 min-w-[154px] max-w-[220px] border-r border-greyscale-light-100">
            <p
              className="
                text-inherit text-base font-medium leading-6 
                overflow-hidden text-ellipsis whitespace-nowrap
                max-w-[180px]
              "
              title={exam.title}
            >
              {exam.title}
            </p>
          </div>

          {/* Start Date */}
          <div className="hidden sm:flex flex-1 p-5 min-w-[180px] max-w-[240px] border-r border-greyscale-light-100">
            <p className="text-inherit text-base font-normal leading-6 whitespace-nowrap">
              {formatDate(startDate)}
            </p>
          </div>

          {/* End Date */}
          <div className="hidden lg:flex flex-1 p-5 min-w-[180px] max-w-[240px] border-r border-greyscale-light-100">
            <p className="text-inherit text-base font-normal leading-6 whitespace-nowrap">
              {endDate ? formatDate(endDate) : "N/A"}
            </p>
          </div>

          {/* Completed at */}
          <div className="hidden lg:flex flex-1 p-5 min-w-[120px] max-w-[160px] border-r border-greyscale-light-100">
            <p className="text-inherit text-base font-normal leading-6 whitespace-nowrap">
              {exam.userFinishedAt ? formatDate(new Date(exam.userFinishedAt)) : "N/A"}
            </p>
          </div>

          {/* Duration */}
          <div className="hidden sm:flex flex-1 p-5 min-w-[120px] max-w-[160px] border-r border-greyscale-light-100">
            <p className="text-inherit text-base font-normal leading-6 whitespace-nowrap">
              {exam.examDuration} min.
            </p>
          </div>

          {/* Score */}
          <div className="hidden md:flex flex-1 p-5 min-w-[80px] max-w-[100px] border-r border-greyscale-light-100">
            <p className="text-inherit text-base font-normal leading-6 whitespace-nowrap">
              {`${exam.userScore ?? "N/A"} pts`}
            </p>
          </div>

          {/* Status */}
          <div className="flex-1 p-5 min-w-[80px] max-w-[160px]">
            <Badge
              variant={
                exam.status === "active" ? "active" : exam.status === "ended" ? "ended" : "upcoming"
              }
              className="text-sm px-3 py-1.5 rounded-lg shadow-sm"
            >
              {exam.status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

/****************************************
 * ANA BİLEŞEN (Joined Exams Page)
 ****************************************/
export default function JoinedExamsPage() {
  const router = useRouter();

  // API query
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["joinedExams"],
    queryFn: () => getAllJoinedExams(),
  });
  // Filtre / Sıralama
  const [filter, setFilter] = useState<FilterOption>("All");
  const [sortField, setSortField] = useState<SortField>("startDate");
  const [sortAsc, setSortAsc] = useState(false);

  // ---- YENİ: Join quiz state ----
  const [joinCode, setJoinCode] = useState("");

  // Sınav yoksa (Empty state)
  if (!isLoading && data?.length === 0 && !isError) {
    return (
      <>
        <DashboardHeader />
        <div className="max-w-[76rem] h-full mx-auto my-auto py-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-brand-primary-900">Joined Quizzes</h3>
          </div>
          <div className="flex justify-center items-center min-h-[600px] h-[80vh]">
            <div className="flex flex-col gap-8 items-center text-center">
              <Image
                src={EmptyState}
                height={280}
                width={360}
                alt="You haven't joined any quizzes yet"
                className="h-auto max-w-full drop-shadow-lg"
              />
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-brand-primary-950">
                  You haven't joined any quizzes yet
                </h2>
                <p className="text-greyscale-light-600 text-lg">
                  Explore a quiz or create your own!
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => router.push("/app")}
                  className="gap-2 px-6 py-4 text-lg"
                >
                  Go to Homepage
                  <ArrowUpRightIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return <p>Loading joined quizzes...</p>;
  }
  if (isError) {
    return <p>Error fetching joined quizzes.</p>;
  }

  return (
    <>
      <div className="relative min-h-screen h-dvh flex flex-col z-0">
        <DashboardHeader withoutTabs={false} withoutNav={true} />
        <div className="px-4 lg:px-8 py-4 lg:pb-4 lg:pt-2 h-full flex flex-col rounded-b-3xl">
          <div className="w-full flex flex-col pb-4 pt-2 flex-1 overflow-hidden">
            <Card className="bg-base-white rounded-2xl md:rounded-3xl border border-greyscale-light-200 flex-1 flex flex-col">
              <CardHeader>
                <CardHeaderContent>
                  <CardTitle className="text-2xl font-bold text-brand-primary-900">
                    Joined quizzes
                  </CardTitle>
                  <CardDescription>
                    All quizzes you participated in. Check your score or share them easily!
                  </CardDescription>
                </CardHeaderContent>
              </CardHeader>

              <CardContent className="px-0 pt-0">
                {/* ---- Join Quiz Input & Button ---- */}
                <div className="flex gap-2 px-5 py-3 border-b border-greyscale-light-200 items-center">
                  {/* Filtre butonları */}
                  <div className="flex overflow-x-auto gap-2 hide-scrollbar">
                    {FILTER_OPTIONS.map((option) => {
                      const colors = {
                        Active:
                          "bg-ui-success-50 text-ui-success-600 border border-ui-success-600 hover:bg-ui-success-100 hover:text-ui-success-700",
                        Ended:
                          "bg-ui-error-50 text-ui-error-600 border border-ui-error-600 hover:bg-ui-error-100 hover:text-ui-error-700",
                        Draft:
                          "bg-brand-secondary-50 text-brand-secondary-600 border border-brand-secondary-600 hover:bg-brand-secondary-100 hover:text-brand-secondary-700",
                        Upcoming:
                          "bg-yellow-50 text-yellow-600 border border-yellow-600 hover:bg-yellow-100 hover:text-yellow-700",
                        All: "bg-brand-primary-50 text-brand-primary-600 border border-brand-primary-600 hover:bg-brand-primary-100 hover:text-brand-primary-700",
                      };

                      const activeColors = {
                        Active:
                          "bg-ui-success-200 text-ui-success-600 border border-ui-success-600 hover:bg-transparent border-2",
                        Ended:
                          "bg-ui-error-200 text-ui-error-600 border border-ui-error-600 hover:bg-transparent border-2",
                        Draft:
                          "bg-brand-secondary-200 text-brand-secondary-600 border border-brand-secondary-600 hover:bg-transparent border-2",
                        Upcoming:
                          "bg-yellow-200 text-yellow-600 border border-yellow-600 hover:bg-transparent border-2",
                        All: "bg-brand-primary-200 text-brand-primary-600 border border-brand-primary-600 hover:bg-transparent border-2",
                      };

                      const activeColor = activeColors[option];
                      const color = colors[option];
                      return (
                        <Button
                          key={option}
                          variant={filter === option ? "default" : "outline"}
                          className={cn(
                            "text-sm shadow-sm w-auto h-[2rem] px-3 py-2 border border-brand-primary-900",
                            filter === option ? `${activeColor}` : `${color}`
                          )}
                          onClick={() => setFilter(option)}
                        >
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Tablo başlıkları (sticky) */}
                <div
                  className="
                    sticky top-0 z-10
                    flex min-w-full
                    bg-white/80
                    backdrop-blur-sm
                    border-b border-greyscale-light-200
                    shadow-sm
                  "
                >
                  {/* Title */}
                  <div
                    className="
                      flex-1 p-5
                      min-w-[154px] max-w-[220px]
                      border-r border-greyscale-light-200
                      cursor-pointer select-none
                      transition-colors duration-200 ease-in-out
                      hover:bg-brand-primary-50/50
                    "
                    onClick={() => {
                      if (sortField === "title") setSortAsc(!sortAsc);
                      else {
                        setSortField("title");
                        setSortAsc(true);
                      }
                    }}
                  >
                    <p className="text-brand-primary-950 text-base font-medium leading-4 whitespace-nowrap">
                      Title
                      {renderSortIcon("title", sortField, sortAsc)}
                    </p>
                  </div>

                  {/* Start Date */}
                  <div
                    className="
                      hidden sm:flex flex-1 p-5
                      min-w-[180px] max-w-[240px]
                      border-r border-greyscale-light-200
                      cursor-pointer select-none
                      transition-colors duration-200 ease-in-out
                      hover:bg-brand-primary-50/50
                    "
                    onClick={() => {
                      if (sortField === "startDate") setSortAsc(!sortAsc);
                      else {
                        setSortField("startDate");
                        setSortAsc(true);
                      }
                    }}
                  >
                    <p className="text-brand-primary-950 text-base font-medium leading-4 whitespace-nowrap">
                      Start Date
                      {renderSortIcon("startDate", sortField, sortAsc)}
                    </p>
                  </div>

                  {/* End Date */}
                  <div
                    className="
                      hidden lg:flex flex-1 p-5
                      min-w-[180px] max-w-[240px]
                      border-r border-greyscale-light-200
                      cursor-pointer select-none
                      transition-colors duration-200 ease-in-out
                      hover:bg-brand-primary-50/50
                    "
                    onClick={() => {
                      if (sortField === "endDate") setSortAsc(!sortAsc);
                      else {
                        setSortField("endDate");
                        setSortAsc(true);
                      }
                    }}
                  >
                    <p className="text-brand-primary-950 text-base font-medium leading-4 whitespace-nowrap">
                      End Date
                      {renderSortIcon("endDate", sortField, sortAsc)}
                    </p>
                  </div>

                  {/* Completed at */}
                  <div
                    className="
                      hidden lg:flex flex-1 p-5
                      min-w-[120px] max-w-[160px]
                      border-r border-greyscale-light-200
                      cursor-pointer select-none
                      transition-colors duration-200 ease-in-out
                      hover:bg-brand-primary-50/50
                    "
                    onClick={() => {}}
                  >
                    <p className="text-brand-primary-950 text-base font-medium leading-4 whitespace-nowrap">
                      Completed at
                      {renderSortIcon("completedAt", sortField, sortAsc)}
                    </p>
                  </div>

                  {/* Duration */}
                  <div
                    className="
                      hidden sm:flex flex-1 p-5
                      min-w-[120px] max-w-[160px]
                      border-r border-greyscale-light-200
                      cursor-pointer select-none
                      transition-colors duration-200 ease-in-out
                      hover:bg-brand-primary-50/50
                    "
                    onClick={() => {
                      if (sortField === "duration") setSortAsc(!sortAsc);
                      else {
                        setSortField("duration");
                        setSortAsc(true);
                      }
                    }}
                  >
                    <p className="text-brand-primary-950 text-base font-medium leading-4 whitespace-nowrap">
                      Duration
                      {renderSortIcon("duration", sortField, sortAsc)}
                    </p>
                  </div>

                  {/* Score */}
                  <div
                    className="
                      hidden md:flex flex-1 p-5
                      min-w-[80px] max-w-[100px]
                      border-r border-greyscale-light-200
                      cursor-pointer select-none
                      transition-colors duration-200 ease-in-out
                      hover:bg-brand-primary-50/50
                    "
                    onClick={() => {
                      if (sortField === "score") setSortAsc(!sortAsc);
                      else {
                        setSortField("score");
                        setSortAsc(true);
                      }
                    }}
                  >
                    <p className="text-brand-primary-950 text-base font-medium leading-4 whitespace-nowrap">
                      Score
                      {renderSortIcon("score", sortField, sortAsc)}
                    </p>
                  </div>

                  {/* Status */}
                  <div
                    className="
                      flex-1 p-5
                      min-w-[80px] max-w-[160px]
                      cursor-pointer select-none
                      transition-colors duration-200 ease-in-out
                      hover:bg-brand-primary-50/50
                    "
                    onClick={() => {
                      if (sortField === "status") setSortAsc(!sortAsc);
                      else {
                        setSortField("status");
                        setSortAsc(true);
                      }
                    }}
                  >
                    <p className="text-brand-primary-950 text-base font-medium leading-4 whitespace-nowrap">
                      Quiz Status
                      {renderSortIcon("status", sortField, sortAsc)}
                    </p>
                  </div>

                  {/* Actions sütunu (paylaş / leaderboard) */}
                  <div className="flex-1 p-5 min-w-[100px] flex justify-end" />
                </div>

                {/* Listedeki sınavlar */}
                <div className="overflow-y-auto max-h-[560px]">
                  {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4 mt-8">
                      <Image
                        src={EmptyState}
                        height={220}
                        width={280}
                        alt="No joined quizzes for this filter"
                      />
                      <p className="text-md text-brand-primary-950 max-h-[581px] mt-1">
                        No quizzes found for <strong>{filter}</strong> filter 😕
                      </p>
                    </div>
                  ) : (
                    data.map((exam: JoinedExamResponse) => <JoinedRow key={exam._id} exam={exam} />)
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
