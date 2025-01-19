"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getExamList } from "@/lib/Client/Exam";
import { formatDate } from "@/utils/formatter";

// Kopyalama bileşeni
import { CopyLink } from "@/components/ui/copylink";

// Örnek header, emptyState, vs.
import DashboardHeader from "@/components/ui/dashboard-header";
import EmptyState from "@/images/emptystates.svg";
import BGR from "@/images/backgrounds/bg-8-20.svg";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeaderContent,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Shadcn UI dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Heroicons
import {
  ArrowUpRightIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronUpDownIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

// QR code
import { QRCodeCanvas } from "qrcode.react";

// React-Icons
import { FaTwitter, FaTelegramPlane, FaEnvelope, FaWhatsapp, FaFacebookF } from "react-icons/fa";

const FILTER_OPTIONS = ["All", "Active", "Ended", "Upcoming", "Draft"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];
type SortField = "title" | "startDate" | "endDate" | "duration" | "status";

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
 * SHARE MODAL
 ****************************************/
interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  quizLink: string;
}

function ShareModal({ open, onClose, quizLink }: ShareModalProps) {
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
      onClick: () => window.open(`mailto:?subject=Quiz&body=${encodeURIComponent(quizLink)}`),
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-md font-bold text-brand-primary-900">
            Share with:
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center items-center gap-5 mt-4 mb-6">
          {shareOptions.map(({ name, icon, onClick }) => (
            <button
              key={name}
              onClick={onClick}
              className="
                flex flex-col items-center
                text-brand-primary-950
                hover:text-brand-primary-900
                focus:outline-none
                transition-transform duration-150
                hover:scale-105 active:scale-95
              "
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-1">
                <span className="text-xl">{icon}</span>
              </div>
              <span className="text-xs font-medium">{name}</span>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mb-2">Or share with link</p>

        <div className="mb-6">
          <CopyLink link={quizLink} label="Quiz link" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <QRCodeCanvas id="quizQrCode" value={quizLink} size={150} bgColor="#FFFFFF" level="M" />
          <Button variant="outline" onClick={downloadQRCode}>
            Download QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/****************************************
 * ROW Bileşeni
 ****************************************/
interface Exam {
  _id: string;
  title: string;
  startDate: string;
  duration: number;
  isCompleted?: boolean;
}

interface RowProps {
  exam: Exam;
}

function Row({ exam }: RowProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const now = new Date();
  const startDate = new Date(exam.startDate);
  const endDate = new Date(startDate.getTime() + Number(exam.duration) * 60_000);

  let status = "Upcoming";
  if (startDate > now) {
    status = "Upcoming";
  } else if (startDate <= now && (!endDate || endDate > now) && !exam.isCompleted) {
    status = "Active";
  } else if ((endDate && endDate <= now) || exam.isCompleted) {
    status = "Ended";
  }

  const quizLink = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/app/exams/get-started/${exam._id}`;

  return (
    <div
      className={cn(
        "flex flex-col",
        "transition-colors duration-200 ease-in-out hover:bg-brand-secondary-100 hover:text-brand-primary-600"
      )}
    >
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        quizLink={quizLink}
      />

      <div className="text-greyscale-light-700">
        <div
          className="
            flex font-medium border-t border-greyscale-light-200 bg-white
            hover:bg-brand-secondary-50 hover:text-brand-primary-800
            transition-colors duration-200 ease-in-out
          "
        >
          <div className="flex-1 p-5 min-w-[154px] max-h-[72px] max-w-[220px] border-r border-greyscale-light-100">
            <p
              className="text-inherit text-base font-medium leading-6 overflow-hidden text-ellipsis whitespace-nowrap"
              title={exam.title}
            >
              {exam.title.length > 15 ? `${exam.title.substring(0, 15)}...` : exam.title}
            </p>
          </div>

          <div className="hidden sm:flex flex-1 p-5 min-w-[180px] max-w-[240px] border-r border-greyscale-light-100">
            <p className="text-inherit text-base font-normal leading-6 whitespace-nowrap">
              {formatDate(startDate)}
            </p>
          </div>

          <div className="hidden lg:flex flex-1 p-5 min-w-[180px] max-w-[240px] border-r border-greyscale-light-100">
            <p className="text-inherit text-base font-normal leading-6 whitespace-nowrap">
              {endDate ? formatDate(endDate) : "N/A"}
            </p>
          </div>

          <div className="hidden sm:flex flex-1 p-5 min-w-[120px] max-w-[160px] border-r border-greyscale-light-100">
            <p className="text-inherit text-base font-normal leading-6 whitespace-nowrap">
              {exam.duration} min.
            </p>
          </div>

          <div className="flex-1 p-5 min-w-[80px] max-w-[160px]">
            <Badge
              variant={status === "Active" ? "active" : status === "Ended" ? "ended" : "upcoming"}
            >
              {status}
            </Badge>
          </div>

          <div
            className="
              flex-1 p-5 min-w-[100px] min-h-[72px]
              flex items-center justify-end
            "
          >
            <Button
              variant="outline"
              iconPosition="right"
              icon={true}
              className="max-h-10 text-sm font-normal p-3"
              onClick={() => setIsShareModalOpen(true)}
            >
              <span className="hidden md:block">Share quiz</span>
              <ShareIcon className="w-4 h-4 mr-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/****************************************
 * ANA SAYFA (QUIZ LİST)
 ****************************************/
function Application() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["exams"],
    queryFn: getExamList,
  });

  const router = useRouter();

  const [filter, setFilter] = useState<FilterOption>("All");
  const [sortField, setSortField] = useState<SortField>("startDate");
  const [sortAsc, setSortAsc] = useState(false);

  if (!isLoading && data?.length === 0 && !isError) {
    return (
      <>
        <DashboardHeader />
        <div className="max-w-[76rem] h-full mx-auto my-auto py-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">All Quizzes</h3>
          </div>
          <div className="flex justify-center items-center min-h-[600px] h-[80vh]">
            <div className="flex flex-col gap-[2.625rem]">
              <Image src={EmptyState} height={220} width={280} alt="No quizzes found" />
              <div className="text-center">
                <p className="text-brand-primary-950 text-2xl font-regular leading-9">
                  No quizzes found.
                </p>
              </div>
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => router.push("/app/create-exam/")}>
                  Create new
                  <ArrowUpRightIcon className="size-6" color="brand-primary-900" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Status hesaplama fonksiyonu
  function getStatus(exam: Exam): string {
    const now = new Date();
    const startDate = new Date(exam.startDate);
    const endDate = new Date(startDate.getTime() + Number(exam.duration) * 60_000);

    if (startDate > now) return "Upcoming";
    if (startDate <= now && (!endDate || endDate > now) && !exam.isCompleted) return "Active";
    if ((endDate && endDate <= now) || exam.isCompleted) return "Ended";
    return "Upcoming";
  }

  function filterExams(exams: Exam[]) {
    return exams.filter((exam) => {
      const status = getStatus(exam);
      if (filter === "All") return true;
      return status === filter;
    });
  }

  function sortExams(exams: Exam[]) {
    return [...exams].sort((a, b) => {
      let valA: number | string = "";
      let valB: number | string = "";

      const statusA = getStatus(a);
      const statusB = getStatus(b);

      switch (sortField) {
        case "title":
          valA = a.title?.toLowerCase() || "";
          valB = b.title?.toLowerCase() || "";
          break;
        case "startDate":
          valA = new Date(a.startDate).getTime();
          valB = new Date(b.startDate).getTime();
          break;
        case "endDate":
          valA = new Date(a.startDate).getTime() + a.duration * 60_000;
          valB = new Date(b.startDate).getTime() + b.duration * 60_000;
          break;
        case "duration":
          valA = a.duration || 0;
          valB = b.duration || 0;
          break;
        case "status":
          valA = statusA;
          valB = statusB;
          break;
      }
      // asc/desc
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  const filtered = filterExams(data || []);
  const finalExams = sortExams(filtered);
  const isFilteredEmpty = finalExams.length === 0;

  return (
    <>
      <div className="relative min-h-screen h-dvh flex flex-col z-0">
        {/* Arkaplan görselini tüm sayfa alanı kaplayacak şekilde ekliyoruz */}
        <DashboardHeader withoutTabs={false} withoutNav={true} />
        <div className="sm:px-4 lg:px-8 h-full flex flex-col overflow-hidden">
          <div className="max-w-[76rem] w-full mx-auto flex flex-col pb-12 pt-8 flex-1 overflow-hidden">
            <Card className="bg-base-white rounded-2xl md:rounded-3xl border border-greyscale-light-200 flex-1 flex flex-col">
              <CardHeader className="border-b border-b-greyscale-light-200">
                <CardHeaderContent>
                  <CardTitle>All quizzes</CardTitle>
                  <CardDescription>
                    All quizzes created by you are listed here. You can share them easily.
                  </CardDescription>
                </CardHeaderContent>
                <Button
                  variant="default"
                  icon
                  iconPosition="right"
                  pill
                  onClick={() => router.push("/app/create-exam/")}
                >
                  Create new
                  <ArrowUpRightIcon className="size-6" />
                </Button>
              </CardHeader>

              <CardContent className="px-0 pt-0 pb-5">
                {/* Filtre Butonları */}
                <div className="flex gap-2 px-5 py-2 border-b border-greyscale-light-200 overflow-auto">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFilter(opt)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-full border transition-colors duration-200 ease-in-out",
                        filter === opt
                          ? "bg-brand-primary-50 text-brand-primary-950 border-brand-primary-600"
                          : "bg-white text-greyscale-light-900 border-greyscale-light-300 hover:bg-greyscale-light-50"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Tablo Başlıkları (sıralama) - STICKY HEADER */}
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
                  {/* Title sütunu */}
                  <div
                    className="
                      flex-1 p-5
                      min-w-[154px] max-w-[220px]
                      border-r border-greyscale-light-200
                      cursor-pointer select-none
                      transition-colors duration-200 ease-in-out
                      hover:bg-greyscale-light-50
                    "
                    onClick={() => {
                      // Tıklanınca "title" üzerinden sıralamayı değiştir
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

                  {/* Start Date sütunu */}
                  <div
                    className="
                      hidden sm:flex flex-1 p-5
                      min-w-[180px] max-w-[240px]
                      border-r border-greyscale-light-200
                      cursor-pointer select-none
                      transition-colors duration-200 ease-in-out
                      hover:bg-greyscale-light-50
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

                  {/* End Date sütunu */}
                  <div
                    className="
                      hidden lg:flex flex-1 p-5
                      min-w-[180px] max-w-[240px]
                      border-r border-greyscale-light-200
                      cursor-pointer select-none
                      transition-colors duration-200 ease-in-out
                      hover:bg-greyscale-light-50
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

                  {/* Duration sütunu */}
                  <div
                    className="
                      hidden sm:flex flex-1 p-5
                      min-w-[120px] max-w-[160px]
                      border-r border-greyscale-light-200
                      cursor-pointer select-none
                      transition-colors duration-200 ease-in-out
                      hover:bg-greyscale-light-50
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

                  {/* Status sütunu */}
                  <div
                    className="
                      flex-1 p-5
                      min-w-[80px] max-w-[160px]
                      cursor-pointer select-none
                      transition-colors duration-200 ease-in-out
                      hover:bg-greyscale-light-50
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
                      Status
                      {renderSortIcon("status", sortField, sortAsc)}
                    </p>
                  </div>

                  {/* Boş sütun (Share sütunu başlığı yok) */}
                  <div className="flex-1 p-5 min-w-[100px] flex justify-end" />
                </div>

                {/* Tablonun içeriği */}
                <div className="overflow-y-auto max-h-[560px]">
                  {(() => {
                    // Yalnızca tablo işlevlerinin finalExams verisini getirmesi
                    const now = new Date();
                    function getStatus(exam: any) {
                      const startDate = new Date(exam.startDate);
                      const endDate = new Date(startDate.getTime() + exam.duration * 60_000);
                      if (startDate > now) return "Upcoming";
                      if (startDate <= now && (!endDate || endDate > now) && !exam.isCompleted)
                        return "Active";
                      if ((endDate && endDate <= now) || exam.isCompleted) return "Ended";
                      return "Upcoming";
                    }
                    function filterExams(exams: any[]) {
                      return exams.filter((exam) => {
                        const status = getStatus(exam);
                        if (filter === "All") return true;
                        return status === filter;
                      });
                    }
                    function sortExams(exams: any[]) {
                      return [...exams].sort((a, b) => {
                        let valA: number | string = "";
                        let valB: number | string = "";

                        const statusA = getStatus(a);
                        const statusB = getStatus(b);

                        switch (sortField) {
                          case "title":
                            valA = a.title?.toLowerCase() || "";
                            valB = b.title?.toLowerCase() || "";
                            break;
                          case "startDate":
                            valA = new Date(a.startDate).getTime();
                            valB = new Date(b.startDate).getTime();
                            break;
                          case "endDate":
                            valA = new Date(a.startDate).getTime() + a.duration * 60_000;
                            valB = new Date(b.startDate).getTime() + b.duration * 60_000;
                            break;
                          case "duration":
                            valA = a.duration || 0;
                            valB = b.duration || 0;
                            break;
                          case "status":
                            valA = statusA;
                            valB = statusB;
                            break;
                        }
                        if (valA < valB) return sortAsc ? -1 : 1;
                        if (valA > valB) return sortAsc ? 1 : -1;
                        return 0;
                      });
                    }

                    const filteredExams = filterExams(data || []);
                    const finalExams = sortExams(filteredExams);
                    if (finalExams.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-10 gap-4 mt-8">
                          <Image
                            src={EmptyState}
                            height={220}
                            width={280}
                            alt="No quizzes for this filter"
                          />
                          <p className="text-md text-brand-primary-950 max-h-[581px] mt-1">
                            No quizzes found for <strong>{filter}</strong> filter 😕
                          </p>
                        </div>
                      );
                    }
                    return finalExams.map((exam: any) => <Row key={exam._id} exam={exam} />);
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export default Application;
