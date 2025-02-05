"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getExamList, getDraftExams, deleteDraftExam, DraftExam } from "@/lib/Client/Exam";
import { formatDate } from "@/utils/formatter";

import { CopyLink } from "@/components/ui/copylink";
import DashboardHeader from "@/components/ui/dashboard-header";
import EmptyState from "@/images/emptystates.svg";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  ArrowUpRightIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronUpDownIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { QRCodeCanvas } from "qrcode.react";
import { FaTwitter, FaTelegramPlane, FaEnvelope, FaWhatsapp, FaFacebookF } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FILTER_OPTIONS = ["All", "Active", "Ended", "Upcoming", "Draft"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

// Sıralama alanları
type SortField = "title" | "startDate" | "endDate" | "duration" | "status";

/**********************************************************************
 * SHARE MODAL
 **********************************************************************/
interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  quizLink: string;
}

function getShareMessage(quizLink: string) {
  return `Hey! I just created a #Choz quiz—want to challenge yourself?

Click here to join:
${quizLink}

Let's see how you do! 🚀
#ChozQuizzes`;
}

function ShareModal({ open, onClose, quizLink }: ShareModalProps) {
  const shareText = getShareMessage(quizLink);

  // Paylaşım seçenekleri
  const shareOptions = [
    {
      name: "Telegram",
      icon: <FaTelegramPlane />,
      onClick: () => {
        const text = encodeURIComponent(shareText);
        window.open(`https://t.me/share/url?text=${text}`, "_blank");
      },
    },
    {
      name: "Twitter",
      icon: <FaTwitter />,
      onClick: () => {
        const text = encodeURIComponent(shareText);
        window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
      },
    },
    {
      name: "Facebook",
      icon: <FaFacebookF />,
      onClick: () => {
        const text = encodeURIComponent(shareText);
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            quizLink
          )}&quote=${text}`,
          "_blank"
        );
      },
    },
    {
      name: "E-mail",
      icon: <FaEnvelope />,
      onClick: () => {
        const subject = encodeURIComponent("Check out this quiz!");
        const body = encodeURIComponent(shareText);
        window.open(`mailto:?subject=${subject}&body=${body}`);
      },
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp />,
      onClick: () => {
        const text = encodeURIComponent(shareText);
        window.open(`https://wa.me/?text=${text}`, "_blank");
      },
    },
  ];

  // QR kodu indirme
  const downloadQRCode = () => {
    const canvas = document.getElementById("quizQrCode") as HTMLCanvasElement | null;
    if (!canvas) {
      toast.error("QR code could not be generated");
      return;
    }
    try {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = "quiz-qrcode.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded successfully");
    } catch (error) {
      toast.error("Failed to download QR code");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto px-4 py-4 relative bg-base-white max-h-[524px] shadow-xl rounded-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-greyscale-light-600 hover:text-brand-primary-900 p-2 rounded-full border-2 border-greyscale-light-200 hover:border-brand-primary-900 hover:bg-brand-secondary-200 transition-colors duration-200"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-md font-bold text-brand-primary-900">
            Share with:
          </DialogTitle>
        </DialogHeader>

        {/* Paylaşım Butonları */}
        <div className="flex justify-center items-center gap-5 mt-4 mb-6">
          {shareOptions.map(({ name, icon, onClick }) => (
            <button
              key={name}
              onClick={onClick}
              className="
                flex flex-col items-center
                text-brand-primary-950
                hover:text-brand-primary-600
                focus:outline-none
                transition-all duration-150
                hover:scale-110 active:scale-95
                group
              "
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-1 group-hover:bg-brand-primary-50 transition-colors">
                <span className="text-xl text-brand-primary-800 group-hover:text-brand-primary-600">
                  {icon}
                </span>
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
          <QRCodeCanvas
            id="quizQrCode"
            value={quizLink}
            size={150}
            bgColor="#FFFFFF"
            className="rounded-lg"
            level="M"
          />
          <Button variant="outline" onClick={downloadQRCode}>
            Download QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**********************************************************************
 * ROW Bileşeni (tek quiz/draft kartı)
 **********************************************************************/
interface RowProps {
  exam: DraftExam;
}

function Row({ exam }: RowProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
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

  // Status hesaplama
  const now = new Date();
  const startDate = exam.startDate ? new Date(exam.startDate) : null;
  const endDate = startDate ? new Date(startDate.getTime() + Number(exam.duration) * 60_000) : null;

  let status = "Draft";
  if (startDate && exam.status !== "draft") {
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
    <div
      className={cn(
        "group relative bg-white rounded-2xl p-5 shadow-sm transition-all duration-200 border border-greyscale-light-200 mb-4",
        // Hover durumunda daha belirgin gölge ve arkaplan
        exam.status !== "draft"
          ? "cursor-pointer hover:shadow-lg hover:bg-brand-secondary-50 hover:border-greyscale-light-300"
          : "cursor-pointer hover:shadow-md hover:bg-brand-secondary-50 hover:border-greyscale-light-200"
      )}
      onClick={() => {
        // Tıklanınca draft ise edit sayfası, değilse details
        if (exam.status === "draft") {
          router.push(`/app/exams/edit/${exam._id}`);
        } else {
          router.push(`/app/exams/details/${exam._id}`);
        }
      }}
    >
      {/* Hover tooltip */}
      <div className="absolute -top-8 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-brand-primary-800 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
          <span>{exam.status === "draft" ? "Edit draft" : "See quiz details"}</span>
          <div className="w-2 h-2 bg-brand-primary-800 absolute -bottom-1 right-3 rotate-45" />
        </div>
      </div>

      {/* QR Kod Dialog */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-xs max-h-[400px] mx-auto p-6 bg-base-white rounded-2xl">
          <div className="flex flex-col items-center gap-4">
            <QRCodeCanvas
              id={`quizQrCode-${exam._id}`}
              value={quizLink}
              size={256}
              bgColor="#FFFFFF"
              fgColor="#1F2937"
              level="H"
              className="rounded-lg"
            />
            <Button
              variant="outline"
              onClick={() => {
                const canvas = document.getElementById(
                  `quizQrCode-${exam._id}`
                ) as HTMLCanvasElement;
                if (!canvas) {
                  toast.error("QR code could not be found");
                  return;
                }
                const url = canvas.toDataURL();
                const a = document.createElement("a");
                a.download = `quiz-qrcode-${exam._id}.png`;
                a.href = url;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              Download QR
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        quizLink={quizLink}
      />

      {/* İçerik */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 space-y-2 min-w-0">
          {/* Başlık + Status */}
          <div className="flex items-center gap-3">
            <h3
              className={cn(
                "text-lg font-semibold text-brand-primary-900 truncate transition-colors",
                exam.status === "draft" && "group-hover:text-brand-primary-950"
              )}
            >
              {exam.title || "Untitled Quiz"}
            </h3>
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
              className="shrink-0"
            >
              {status}
            </Badge>
          </div>

          {/* Ek Bilgiler */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4 text-brand-primary-600" />
              <span className="font-medium">Start:</span>
              <span className="truncate">{startDate ? formatDate(startDate) : "N/A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4 text-brand-primary-600" />
              <span className="font-medium">Duration:</span>
              <span>{exam.duration || 0} min</span>
            </div>
            <div className="flex items-center gap-1">
              <UsersIcon className="w-4 h-4 text-brand-primary-600" />
              <span className="font-medium">Participants:</span>
              <span>{(exam as any).participants?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Sağdaki butonlar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div
            className="flex items-center gap-2 border-t sm:border-l sm:border-t-0 border-greyscale-light-200 pt-2 sm:pt-0 sm:pl-2 w-full justify-between sm:w-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-1">
              {/* Sil (yalnızca draft) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-red-50 text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(exam._id);
                }}
                disabled={isDeleting || exam.status === "draft" ? false : true}
                title={isDeleting ? "Deleting..." : "Delete"}
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <TrashIcon className="w-5 h-5" />
                )}
              </Button>

              {/* Share (draft değilse) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-brand-primary-50 text-brand-primary-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsShareModalOpen(true);
                }}
                disabled={exam.status === "draft"}
                title="Share"
              >
                <ShareIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Alt Kısım */}
      <div className="mt-4 pt-3 border-t border-greyscale-light-100 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <span className="text-greyscale-light-500 hidden sm:block">|</span>
          <span className="text-xs sm:text-sm text-greyscale-light-600">
            Last updated: {formatDate(new Date(exam.updatedAt))}
          </span>
        </div>
        {/* QR code (desktop) */}
        <div className="hidden sm:block">
          <QRCodeCanvas
            id={`smallQrCode-${exam._id}`}
            value={quizLink}
            size={72}
            bgColor="#FFFFFF"
            fgColor="#1F2937"
            level="M"
            className="rounded-lg border p-1 transition-all duration-200 hover:scale-105 active:scale-95 hidden md:block"
          />
        </div>
      </div>
    </div>
  );
}

/**********************************************************************
 * ANA SAYFA (QUIZ LİST)
 **********************************************************************/
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
  const [sortAsc, setSortAsc] = useState(true);

  const isLoading = isExamsLoading || isDraftsLoading;
  const isError = isExamsError || isDraftsError;

  const allExams = [...exams, ...draftExams];

  if (isLoading) {
    return (
      <div className="relative min-h-screen h-dvh flex flex-col z-0">
        <DashboardHeader withoutTabs={false} withoutNav={true} />
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="w-12 h-12 text-brand-primary-600" />
            <p className="text-brand-primary-900">Quizzes loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative min-h-screen h-dvh flex flex-col z-0">
        <DashboardHeader withoutTabs={false} withoutNav={true} />
        <Card className="m-8 p-6 text-center">
          <h3 className="text-red-600 text-lg font-semibold mb-4">Error loading quizzes</h3>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="hover:bg-brand-primary-50"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Quiz status bulma
  function getStatus(exam: DraftExam): string {
    if (exam.status === "draft") return "Draft";

    const now = new Date();
    const startDate = exam.startDate ? new Date(exam.startDate) : null;
    const endDate = startDate
      ? new Date(startDate.getTime() + Number(exam.duration) * 60_000)
      : null;

    if (startDate && startDate > now) return "Upcoming";
    if (startDate && startDate <= now && (!endDate || endDate > now) && !exam.isCompleted) {
      return "Active";
    }
    if ((endDate && endDate <= now) || exam.isCompleted) {
      return "Ended";
    }
    if (exam.isArchived) return "Archived";
    return "Upcoming";
  }

  // Filtre
  function filterExams(exams: DraftExam[]) {
    return exams.filter((exam) => {
      const status = getStatus(exam);
      if (filter === "All") return true;
      if (filter === "Draft") return exam.status === "draft";
      return status === filter;
    });
  }

  // Sıralama
  function sortExams(exams: DraftExam[]) {
    const arr = [...exams];
    arr.sort((a, b) => {
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
    return arr;
  }

  const filtered = filterExams(allExams as DraftExam[]);
  const finalExams = sortExams(filtered);

  // Sortable Header Fields
  const sortableHeaders: { label: string; field: SortField }[] = [
    { label: "Title", field: "title" },
    { label: "Start Date", field: "startDate" },
    { label: "Status", field: "status" },
    { label: "End Date", field: "endDate" },
    { label: "Duration", field: "duration" },
  ];

  // Dropdown "Sort by" & Asc/Desc
  const TableHeader = () => (
    <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-5 py-3 border-b border-greyscale-light-200 grid grid-cols-[auto_auto] gap-2 items-center justify-start">
      <DropdownMenu>
        <DropdownMenuTrigger className="max-w-[160px] flex items-center hover:bg-brand-primary-50 px-2 py-1 rounded-md transition-colors group">
          <span className="font-medium text-base text-greyscale-light-800 group-hover:text-brand-primary-900">
            Sort by: {sortableHeaders.find((f) => f.field === sortField)?.label}
          </span>
          <ChevronUpDownIcon className="w-3.5 h-3.5 ml-1 text-gray-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[140px] py-1">
          {sortableHeaders.map((field) => (
            <DropdownMenuItem
              key={field.field}
              onClick={() => setSortField(field.field as SortField)}
              className="flex justify-between items-center px-2 py-1 text-xs"
            >
              {field.label}
              {sortField === field.field && (
                <CheckIcon className="w-3.5 h-3.5 text-brand-primary-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setSortAsc(!sortAsc);
        }}
        className="hover:bg-brand-primary-50 px-2 h-7 text-xs gap-1"
        title={sortAsc ? "Ascending" : "Descending"}
      >
        {sortAsc ? "Asc" : "Desc"}
        {sortAsc ? (
          <ArrowUpIcon className="w-3.5 h-3.5" />
        ) : (
          <ArrowDownIcon className="w-3.5 h-3.5" />
        )}
      </Button>
    </div>
  );

  // Boş Ekran
  const EmptyStateComponent = () => (
    <div className="flex flex-col items-center justify-center py-10 gap-4 mt-8">
      <Image
        src={EmptyState}
        height={180}
        width={240}
        alt="No quizzes found"
        className="hover:scale-105 transition-transform duration-300"
      />
      <p className="text-md text-brand-primary-950 mt-1 text-center">
        No quizzes matching the criteria found.
        <br />
        <Button
          variant="default"
          className="mt-4 hover:bg-brand-primary-800"
          onClick={() => router.push("/app/create-exam/")}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create new quiz
        </Button>
      </p>
    </div>
  );

  // Filtre Butonları
  const renderFilterButtons = () => (
    <div className="flex flex-col w-full gap-3">
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-4 flex-1">
          <span className="text-sm shrink-0 text-greyscale-light-600">Filter by:</span>

          <div className="flex overflow-x-auto gap-2 flex-1 hide-scrollbar">
            <div className="flex items-center gap-2 flex-nowrap">
              {FILTER_OPTIONS.map((option) => (
                <Badge
                  key={option}
                  variant={filter === option ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer whitespace-nowrap transition-colors",
                    filter === option
                      ? "bg-brand-tertiary-100 border border-brand-tertiary-300 text-brand-primary-900 hover:bg-brand-tertiary-200"
                      : "hover:bg-brand-tertiary-50"
                  )}
                  onClick={() => setFilter(option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen h-dvh flex flex-col z-0 overflow-y-auto">
      <DashboardHeader withoutTabs={false} withoutNav={true} />

      <div className="px-4 lg:px-8 py-4 lg:pb-4 lg:pt-2 h-full flex flex-col overflow-hidden rounded-b-3xl">
        <div className="w-full flex flex-col pb-4 pt-2 flex-1 overflow-hidden">
          <Card className="bg-base-white rounded-3xl md:rounded-3xl border border-greyscale-light-200 flex-1 flex flex-col">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between gap-auto w-full">
                {/* Başlık ve Açıklama */}
                <div className="space-y-1.5">
                  <CardTitle className="text-2xl font-bold text-brand-primary-900">
                    Created quizzes
                  </CardTitle>
                  <CardDescription className="text-greyscale-light-600">
                    Manage and share all your created quizzes in one place
                  </CardDescription>
                </div>

                {/* Filtre ve "New Quiz" Butonu */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center">
                  {renderFilterButtons()}

                  <Button
                    variant="default"
                    className="w-full sm:w-auto justify-center sm:justify-start gap-2 py-4"
                    onClick={() => router.push("/app/create-exam/")}
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>New Quiz</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-0 pt-0">
              {/* Sıralama */}
              <TableHeader />

              {/* Liste */}
              <div className="overflow-y-auto max-h-[72vh] p-6 rounded-b-3xl">
                {finalExams.length === 0 ? (
                  <EmptyStateComponent />
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
