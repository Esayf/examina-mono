"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import {
  getExamList,
  GetExamsParams,
  getDraftExams,
  deleteDraftExam,
  DraftExam,
  getAllCreatedExams,
} from "@/lib/Client/Exam";
import { formatDate } from "@/utils/formatter";

// UI & Components
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
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EraseButton from "@/components/ui/erase-button";

// Icons
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
  ArrowDownOnSquareIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/outline";
import { FaTwitter, FaTelegramPlane, FaEnvelope, FaWhatsapp, FaFacebookF } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import DurationFormatter from "@/components/ui/time/duration-formatter";
const FILTER_OPTIONS = ["All", "Active", "Ended", "Upcoming", "Draft"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];
type SortField = "title" | "startDate" | "endDate" | "duration" | "status";

/******************************************************************************
 * ShareModal
 ******************************************************************************/
interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  quizLink: string;
}

function getShareMessage(quizLink: string) {
  return {
    title: "Choz Quiz'e Davet",
    message: `🎯 Hey! I just created a #Choz quiz. Want to challenge yourself?

📝 Click here to join:
${quizLink}

🚀 Let's see how you do!

#ChozQuizzes`,
    shortMessage: `🎯 Hey! I just created a #Choz quiz. Want to challenge yourself?: ${quizLink} #ChozQuiz`,
  };
}

function ShareModal({ open, onClose, quizLink }: ShareModalProps) {
  const shareText = getShareMessage(quizLink);
  const [emails, setEmails] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isEmailListCopied, setIsEmailListCopied] = useState(false);

  const handleAddEmail = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const emailsToAdd = currentInput
        .split(/[,;\s]+/)
        .map((email) => email.trim())
        .filter((email) => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        .filter((email) => !emails.includes(email));

      if (emailsToAdd.length) {
        setEmails((prev) => [...prev, ...emailsToAdd]);
        setCurrentInput("");
      }
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  const handleEmailListCopy = () => {
    if (emails.length === 0) return;

    navigator.clipboard
      .writeText(emails.join(", "))
      .then(() => {
        toast.success("Email list copied to clipboard");
        setIsEmailListCopied(true);
        setTimeout(() => setIsEmailListCopied(false), 2000);
      })
      .catch(() => toast.error("Failed to copy email list"));
  };

  const handleEmailSend = () => {
    if (emails.length === 0) return;

    const subject = encodeURIComponent(shareText.title);
    const body = encodeURIComponent(shareText.message);
    window.open(`mailto:?bcc=${emails.join(",")}&subject=${subject}&body=${body}`);
    toast.success("Email client opened with recipient list");
  };

  const shareOptions = [
    {
      name: "Telegram",
      icon: <FaTelegramPlane />,
      onClick: () => {
        const text = encodeURIComponent(shareText.shortMessage);
        window.open(`https://t.me/share/url?text=${text}`, "_blank");
      },
    },
    {
      name: "Twitter",
      icon: <FaTwitter />,
      onClick: () => {
        const text = encodeURIComponent(shareText.shortMessage);
        window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
      },
    },
    {
      name: "Facebook",
      icon: <FaFacebookF />,
      onClick: () => {
        const text = encodeURIComponent(shareText.message);
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
        const subject = encodeURIComponent(shareText.title);
        const body = encodeURIComponent(shareText.message);
        window.open(`mailto:?subject=${subject}&body=${body}`);
      },
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp />,
      onClick: () => {
        const text = encodeURIComponent(shareText.shortMessage);
        window.open(`https://wa.me/?text=${text}`, "_blank");
      },
    },
  ];

  // QR code download
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
      <DialogContent className="max-w-2xl mx-auto p-6 relative bg-base-white max-h-[90vh] overflow-y-auto shadow-xl rounded-2xl w-[95%] sm:w-full">
        {/* Kapatma butonu */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-greyscale-light-600 hover:text-brand-primary-900 p-2 rounded-full border-2 border-greyscale-light-200 hover:border-brand-primary-900 hover:bg-brand-secondary-200 transition-colors duration-200"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold text-brand-primary-900">
            Choose your share options
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          {/* Sol taraf - Sosyal medya ve link paylaşımı */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-primary-900">Quick Share</h3>
              <div className="flex flex-wrap gap-6 items-center justify-center">
                {shareOptions.map(({ name, icon, onClick }) => (
                  <button
                    key={name}
                    onClick={onClick}
                    className="flex flex-col items-center text-brand-primary-950 hover:text-brand-primary-600 focus:outline-none transition-all duration-150 hover:scale-105 active:scale-95 group"
                  >
                    <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-xl mb-2 group-hover:bg-brand-primary-50 transition-colors">
                      <span className="text-2xl text-brand-primary-800 group-hover:text-brand-primary-600">
                        {icon}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-center">{name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-primary-900">Share with link</h3>
              <CopyLink link={quizLink} label="Quiz link" />
            </div>
          </div>

          {/* Sağ taraf - Email ve QR */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-primary-900">
                Share with email list
              </h3>
              <div className="space-y-3">
                {emails.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-greyscale-light-50 rounded-xl border border-greyscale-light-200">
                    {emails.map((email) => (
                      <Badge
                        key={email}
                        variant="secondary"
                        className="pl-3 pr-2 py-1.5 flex items-center gap-2 group hover:bg-greyscale-light-200"
                      >
                        {email}
                        <button
                          onClick={() => handleRemoveEmail(email)}
                          className="hover:bg-greyscale-light-300 rounded-full p-1 transition-colors"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Input
                    id="emailGroupTrigger"
                    placeholder="Enter email addresses (auto-complete with comma, space or semicolon)"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleAddEmail}
                    className="flex-1"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleEmailListCopy}
                      disabled={emails.length === 0}
                      className="flex-1"
                    >
                      {isEmailListCopied ? <CheckIcon className="w-4 h-4" /> : "Copy"}
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleEmailSend}
                      disabled={emails.length === 0}
                      className="flex-1"
                    >
                      Send
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-greyscale-light-500">
                  Emails will be sent as BCC to protect privacy
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-primary-900">QR Code</h3>
              <div className="flex flex-col items-center gap-4 p-4 bg-greyscale-light-50 rounded-xl border border-greyscale-light-200">
                <QRCodeCanvas
                  id="quizQrCode"
                  value={quizLink}
                  size={180}
                  bgColor="#FFFFFF"
                  className="rounded-lg bg-white p-2"
                  level="M"
                />
                <Button
                  variant="outline"
                  icon={true}
                  iconPosition="left"
                  onClick={downloadQRCode}
                  className="w-full"
                >
                  <ArrowDownCircleIcon className="w-6 h-6" />
                  Download QR
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/******************************************************************************
 * Row (tek quiz/draft)
 ******************************************************************************/
interface RowProps {
  exam: DraftExam;
}

function Row({ exam }: RowProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPulse(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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

  // Maksimum süre kontrolü eklendi
  const MAX_DURATION_MINUTES = 52_560_000;
  const duration = Math.min(exam.duration || 0, MAX_DURATION_MINUTES);

  const endDate =
    startDate && duration ? new Date(startDate.getTime() + duration * 60 * 1000) : null;

  let status = "Draft";
  if (startDate) {
    if (exam.isCompleted) {
      status = "Ended";
    } else if (startDate > now) {
      status = "Upcoming";
    } else if (endDate && endDate <= now) {
      status = "Ended";
    } else if (startDate <= now && (!endDate || endDate > now)) {
      status = "Active";
    }
  }

  const quizLink = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/app/exams/get-started/${exam._id}`;

  return (
    <div
      className={cn(
        "group bg-white rounded-2xl p-5 shadow-sm transition-all duration-200 border border-greyscale-light-200 mb-4",
        exam.status !== "draft"
          ? "cursor-pointer hover:shadow-lg hover:bg-brand-secondary-50 hover:border-brand-primary-700"
          : "cursor-pointer hover:shadow-md hover:bg-brand-secondary-50 hover:border-brand-primary-700"
      )}
      onClick={() => {
        if (exam.status === "draft") {
          router.push(`/app/exams/edit/${exam._id}`);
        } else {
          router.push(`/app/exams/details/${exam._id}`);
        }
      }}
    >
      {/* Share Modal */}
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        quizLink={quizLink}
      />

      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex-1 space-y-2 min-w-0">
          {/* Başlık + Status */}
          <div className="flex items-center justify-between gap-3">
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
                  ? "draft"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4 text-brand-primary-600" />
              <span className="font-medium">Start:</span>
              <span className="truncate">{startDate ? formatDate(startDate) : "N/A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4 text-brand-primary-600" />
              <span className="font-medium">Duration:</span>
              <DurationFormatter duration={exam.duration || 0} base="minutes" />
            </div>
            <div className="flex items-center gap-1">
              <UsersIcon className="w-4 h-4 text-brand-primary-600" />
              <span className="font-medium">Participants:</span>
              <span>{(exam as any).totalParticipants ?? "0"}</span>
            </div>
          </div>
        </div>

        {/* Sağ butonlar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div
            className="flex items-center gap-2 border-t sm:border-l sm:border-t-0 border-greyscale-light-200 pt-2 sm:pt-0 sm:pl-2 w-full justify-between sm:w-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-1">
              {/* Sil (yalnızca draft) */}
              {exam.status === "draft" && (
                <EraseButton
                  index={0}
                  onRemove={() => handleDelete(exam._id)}
                  isLoading={isDeleting}
                  onConfirm={() => handleDelete(exam._id)}
                  confirmMessage="Are you sure you want to delete this item?"
                  className="h-8 w-8"
                />
              )}

              {/* Paylaş (draft değilse) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-brand-primary-50 text-brand-primary-700 relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsShareModalOpen(true);
                }}
                disabled={exam.status === "draft"}
                title="Share"
              >
                <ShareIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                {showPulse && exam.status !== "draft" && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-brand-primary-100 opacity-75 group-hover:opacity-100" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/******************************************************************************
 * ANA SAYFA
 ******************************************************************************/
export default function Application() {
  const router = useRouter();

  // Sınavlar
  const {
    data: exams = [],
    isLoading: isExamsLoading,
    isError: isExamsError,
  } = useQuery({
    queryKey: ["createdExams"],
    queryFn: () => getAllCreatedExams(),
  });

  // Draftlar
  const {
    data: draftExams = [],
    isLoading: isDraftsLoading,
    isError: isDraftsError,
  } = useQuery({
    queryKey: ["draftExams"],
    queryFn: getDraftExams,
  });

  const isLoading = isExamsLoading || isDraftsLoading;
  const isError = isExamsError || isDraftsError;

  // Filtre
  const [filter, setFilter] = useState<FilterOption>("All");
  // Sıralama
  const [sortField, setSortField] = useState<SortField>("startDate");
  const [sortAsc, setSortAsc] = useState(true);

  // ----- YENİ: Search -----
  const [searchTerm, setSearchTerm] = useState("");

  // Tüm quizler
  const allExams = [...exams, ...draftExams];

  if (isLoading) {
    return (
      <div className="relative min-h-screen h-dvh flex flex-col z-0">
        <DashboardHeader withoutTabs={false} withoutNav={true} />
        <div className="flex items-center justify-center h-full">
          <Spinner className="w-12 h-12 text-brand-primary-600" />
          <p className="mt-2 text-brand-primary-900">Quizzes loading...</p>
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

  // Status bulma
  function getStatus(exam: DraftExam): string {
    // Draft durumu kontrolü:
    // 1. Status draft ise
    // 2. Başlık yoksa
    // 3. Başlangıç tarihi yoksa
    // 4. Süre yoksa veya 0 ise
    if (
      exam.status === "draft" ||
      !exam.title ||
      !exam.startDate ||
      !exam.duration ||
      exam.duration <= 0
    ) {
      return "Draft";
    }

    // Diğer status kontrolleri
    const now = new Date();
    const startDate = exam.startDate ? new Date(exam.startDate) : null;

    const MAX_DURATION_MINUTES = 52_560_000;
    const duration = Math.min(exam.duration || 0, MAX_DURATION_MINUTES);

    const endDate =
      startDate && duration ? new Date(startDate.getTime() + duration * 60 * 1000) : null;

    if (exam.isCompleted) return "Ended";
    if (startDate && startDate > now) return "Upcoming";
    if (endDate && endDate <= now) return "Ended";
    if (startDate && startDate <= now && (!endDate || endDate > now)) return "Active";

    return "Draft";
  }

  // Filtre
  function filterExams(exams: DraftExam[]) {
    return exams.filter((exam) => {
      // Önce başlık araması
      const titleMatch =
        !searchTerm.trim() || (exam.title?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      if (!titleMatch) return false;

      // Status kontrolü
      const status = getStatus(exam);

      // Filtre kontrolü
      if (filter === "All") {
        return true;
      }

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

  // Dropdown "Sort by" & Asc/Desc
  const sortableHeaders: { label: string; field: SortField }[] = [
    { label: "Title", field: "title" },
    { label: "Start Date", field: "startDate" },
    { label: "End Date", field: "endDate" },
    { label: "Duration", field: "duration" },
    { label: "Status", field: "status" },
  ];

  const EmptyStateComponent = () => (
    <div className="flex flex-col items-center justify-center py-10 gap-4 mt-4">
      <Image
        src={EmptyState}
        height={180}
        width={240}
        alt="No quizzes found"
        className="hover:scale-105 transition-transform duration-300"
      />
      <p className="text-md text-brand-primary-950 mt-1 text-center">
        No quizzes found.
        <Button
          variant="default"
          className="mt-4 hover:bg-brand-primary-800 flex gap-2"
          onClick={() => router.push("/app/create-exam/")}
        >
          <PlusIcon className="w-5 h-5" />
          Create new quiz
        </Button>
      </p>
    </div>
  );

  // Filtre Butonları & Search
  const renderFilterAndSearch = () => (
    <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-b border-greyscale-light-200">
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
              "bg-blue-50 text-blue-900 border border-blue-600 hover:bg-blue-100 hover:text-blue-700",
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
              "bg-blue-100 text-blue-900 border border-blue-600 hover:bg-transparent border-2",
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

      {/* Search input */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-40 sm:w-64 transition-all duration-300 focus:w-72 focus:ring-2 focus:ring-brand-primary-200"
        />
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen h-dvh flex flex-col z-0 overflow-y-auto">
      <DashboardHeader withoutTabs={false} withoutNav={true} />
      <div className="px-4 lg:px-8 py-4 lg:pb-4 lg:pt-2 h-full flex flex-col rounded-b-3xl">
        <Card className="bg-base-white rounded-3xl border border-greyscale-light-200 flex-1 flex flex-col">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
              <div className="space-y-1.5">
                <CardTitle className="text-2xl font-bold text-brand-primary-900">
                  Created quizzes
                </CardTitle>
                <CardDescription className="text-greyscale-light-600">
                  Manage and share all your created quizzes in one place
                </CardDescription>
              </div>
              <Button
                variant="default"
                icon
                iconPosition="left"
                className="w-full sm:w-auto justify-center sm:justify-start gap-2 py-4"
                onClick={() => router.push("/app/create-exam/")}
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create new</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-0 pt-0">
            {renderFilterAndSearch()}

            {/* Quiz Rows */}
            <div className="overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[72vh] p-4 rounded-b-3xl">
              {isLoading ? (
                // Loading skeleton
                Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-greyscale-light-100 rounded-2xl h-40"
                    />
                  ))
              ) : finalExams.length === 0 ? (
                <EmptyStateComponent />
              ) : (
                finalExams.map((exam, index) => (
                  <div
                    key={exam._id}
                    className="motion-safe:animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Row exam={exam} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
