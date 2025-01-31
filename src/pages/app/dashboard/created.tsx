"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getExamList, getDraftExams, deleteDraftExam, DraftExam } from "@/lib/Client/Exam";
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
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// QR code
import { QRCodeCanvas } from "qrcode.react";

// React-Icons
import { FaTwitter, FaTelegramPlane, FaEnvelope, FaWhatsapp, FaFacebookF } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";

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
          className="absolute top-4 right-4 text-greyscale-light-600 hover:text-brand-primary-900 p-2 rounded-full border-2 border-greyscale-light-600 hover:border-brand-primary-900 hover:bg-brand-secondary-200"
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

        <p className="text-center text-sm text-greyscale-light-500 mb-2">Or share with link</p>

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
  isArchived?: boolean;
}

interface RowProps {
  exam: DraftExam;
}

function Row({ exam }: RowProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: handleDelete, isPending: isDeleting } = useMutation({
    mutationFn: deleteDraftExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["draftExams"] });
      toast.success("Draft deleted successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete draft");
    },
  });

  const now = new Date();
  const startDate = exam.startDate ? new Date(exam.startDate) : null;
  const endDate = startDate ? new Date(startDate.getTime() + Number(exam.duration) * 60_000) : null;

  let status = "Draft";
  if (startDate && exam.status != "draft") {
    if (startDate > now) {
      status = "Upcoming";
    } else if (startDate <= now && (!endDate || endDate > now) && !exam.isCompleted) {
      status = "Active";
    } else if ((endDate && endDate <= now) || exam.isCompleted) {
      status = "Ended";
    }
  }

  const quizLink = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/app/exams/get-started/${exam._id}`;

  return (
    <div className="flex flex-col transition-colors duration-200 ease-in-out hover:bg-brand-secondary-100">
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        quizLink={quizLink}
      />

      <div className="flex items-center border-t border-greyscale-light-200">
        {/* Title */}
        <div className="flex-1 p-5 min-w-[154px] max-w-[220px] border-r border-greyscale-light-200">
          <p className="text-inherit text-base font-medium leading-6 overflow-hidden text-ellipsis whitespace-nowrap">
            {exam.title || "Untitled"}
          </p>
        </div>

        {/* Start Date */}
        <div className="hidden sm:flex flex-1 p-5 min-w-[180px] max-w-[240px] border-r border-greyscale-light-200">
          <p className="text-inherit text-base font-normal leading-6">
            {startDate ? formatDate(startDate) : "N/A"}
          </p>
        </div>

        {/* End Date */}
        <div className="hidden lg:flex flex-1 p-5 min-w-[180px] max-w-[240px] border-r border-greyscale-light-200">
          <p className="text-inherit text-base font-normal leading-6">
            {endDate ? formatDate(endDate) : "N/A"}
          </p>
        </div>

        {/* Duration */}
        <div className="hidden sm:flex flex-1 p-5 min-w-[120px] max-w-[160px] border-r border-greyscale-light-200">
          <p className="text-inherit text-base font-normal leading-6">
            {exam.duration ? `${exam.duration} min.` : "N/A"}
          </p>
        </div>

        {/* Status */}
        <div className="flex-1 p-5 min-w-[80px] max-w-[160px] border-r border-greyscale-light-200">
          <Badge
            variant={
              status === "Draft"
                ? "secondary"
                : status === "Active"
                ? "active"
                : status === "Ended"
                ? "ended"
                : "upcoming"
            }
          >
            {status}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex-1 p-5 min-w-[150px] flex items-center justify-end gap-2">
          <Button
            disabled={exam.status !== "draft"}
            variant="outline"
            size="icon-sm"
            className="max-w-8 max-h-8 min-w-8 min-h-8 border"
            onClick={() => router.push(`/app/exams/edit/${exam._id}`)}
          >
            <PencilIcon className="size-4 w-4 h-4 stroke-current stroke-1 hidden md:block" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="max-w-8 max-h-8 min-w-8 min-h-8"
            onClick={() => handleDelete(exam._id)}
            disabled={isDeleting || exam.status !== "draft"}
          >
            {isDeleting ? (
              <Spinner className="size-4" />
            ) : (
              <TrashIcon className="size-4 w-4 h-4 stroke-current stroke-1 hidden md:block" />
            )}
          </Button>
          <Button
            variant="outline"
            iconPosition="right"
            icon
            className="max-h-10 text-sm font-normal p-3"
            onClick={() => setIsShareModalOpen(true)}
          >
            <span className="hidden md:block">Share quiz</span>
            <ShareIcon className="w-4 h-4 mr-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/****************************************
 * ANA SAYFA (QUIZ LİST)
 ****************************************/
function Application() {
  const {
    data: exams = [],
    isLoading: isExamsLoading,
    isError: isExamsError,
  } = useQuery({
    queryKey: ["exams"],
    queryFn: getExamList,
  });

  const {
    data: draftExams = [],
    isLoading: isDraftsLoading,
    isError: isDraftsError,
  } = useQuery({
    queryKey: ["draftExams"],
    queryFn: getDraftExams,
  });

  const router = useRouter();
  const [filter, setFilter] = useState<FilterOption>("All");
  const [sortField, setSortField] = useState<SortField>("startDate");
  const [sortAsc, setSortAsc] = useState(false);

  const isLoading = isExamsLoading || isDraftsLoading;
  const isError = isExamsError || isDraftsError;
  const allExams = [...exams, ...draftExams];

  if (!isLoading && allExams.length === 0 && !isError) {
    return (
      <div className="relative min-h-screen h-dvh flex flex-col z-0">
        <div className="absolute inset-0 z-[-1]">
          <Image
            src={BGR}
            alt="Hero Background"
            fill
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <DashboardHeader withoutTabs={false} withoutNav={true} />
        <div className="sm:px-4 lg:px-8 h-full flex flex-col overflow-hidden">
          <div className="max-w-[76rem] w-full mx-auto flex flex-col pb-12 pt-8 flex-1 overflow-hidden">
            <Card className="bg-base-white rounded-2xl md:rounded-3xl border border-brand-primary-900 flex-1 flex flex-col">
              <CardHeader>
                <CardHeaderContent>
                  <CardTitle>Created quizzes</CardTitle>
                  <CardDescription>
                    All quizzes created by you. Create new ones or edit existing ones!
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

                <div className="flex font-medium border-b border-greyscale-light-200">
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

                  <div className="flex-1 p-5 min-w-[150px] flex justify-end" />
                </div>

                <div className="overflow-y-auto max-h-[560px]">
                  <div className="flex flex-col items-center justify-center py-10 gap-4 mt-8">
                    <Image src={EmptyState} height={220} width={280} alt="No quizzes found" />
                    <p className="text-md text-brand-primary-950 max-h-[581px] mt-1">
                      No quizzes found for <strong>{filter}</strong> filter 😕
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  function getStatus(exam: DraftExam): string {
    if (exam.status === "draft") return "Draft";

    const now = new Date();
    const startDate = new Date(exam.startDate);
    const endDate = new Date(startDate.getTime() + Number(exam.duration) * 60_000);

    if (startDate > now) return "Upcoming";
    if (startDate <= now && (!endDate || endDate > now) && !exam.isCompleted) return "Active";
    if ((endDate && endDate <= now) || exam.isCompleted) return "Ended";
    if (exam.isArchived) return "Archived";
    return "Upcoming";
  }

  function filterExams(exams: DraftExam[]) {
    return exams.filter((exam) => {
      const status = getStatus(exam);
      if (filter === "All") return true;
      if (filter === "Draft") return exam.status === "draft";
      return status === filter;
    });
  }

  function sortExams(exams: DraftExam[]) {
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
          valA = a.startDate ? new Date(a.startDate).getTime() : Number.MAX_SAFE_INTEGER;
          valB = b.startDate ? new Date(b.startDate).getTime() : Number.MAX_SAFE_INTEGER;
          break;
        case "endDate":
          valA = a.startDate
            ? new Date(a.startDate).getTime() + (a.duration || 0) * 60_000
            : Number.MAX_SAFE_INTEGER;
          valB = b.startDate
            ? new Date(b.startDate).getTime() + (b.duration || 0) * 60_000
            : Number.MAX_SAFE_INTEGER;
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

  const filtered = filterExams(allExams as DraftExam[]);
  const finalExams = sortExams(filtered);

  return (
    <div className="relative min-h-screen h-dvh flex flex-col z-0">
      <div className="absolute inset-0 z-[-1]">
        <Image
          src={BGR}
          alt="Hero Background"
          fill
          className="w-full h-full object-cover"
          priority
        />
      </div>
      <DashboardHeader withoutTabs={false} withoutNav={true} />
      <div className="sm:px-4 lg:px-8 h-full flex flex-col overflow-hidden">
        <div className="max-w-[76rem] w-full mx-auto flex flex-col pb-12 pt-8 flex-1 overflow-hidden">
          <Card className="bg-base-white rounded-2xl md:rounded-3xl border border-brand-primary-900 flex-1 flex flex-col">
            <CardHeader>
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

              <div className="flex font-medium border-b border-greyscale-light-200">
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

                <div className="flex-1 p-5 min-w-[150px] flex justify-end" />
              </div>

              <div className="overflow-y-auto max-h-[560px]">
                {finalExams.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-4 mt-8">
                    <Image
                      src={EmptyState}
                      height={220}
                      width={280}
                      alt="No quizzes found for this filter"
                    />
                    <p className="text-md text-brand-primary-950 max-h-[581px] mt-1">
                      No quizzes found for <strong>{filter}</strong> filter 😕
                    </p>
                  </div>
                ) : (
                  finalExams.map((exam) => <Row key={exam._id} exam={exam} />)
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Application;
