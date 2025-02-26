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
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  UsersIcon,
  ArrowDownCircleIcon,
  PlusIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { FaTwitter, FaTelegramPlane, FaEnvelope, FaWhatsapp, FaFacebookF } from "react-icons/fa";

// QR code
import { QRCodeCanvas } from "qrcode.react";
import { Input } from "@/components/ui/input";
import DurationFormatter from "@/components/ui/time/duration-formatter";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";

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

/****************************************
 * Paylaşım (Share) Modal
 ****************************************/
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

    const subject = encodeURIComponent("Check out this quiz!");
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?bcc=${emails.join(",")}&subject=${subject}&body=${body}`);
    toast.success("Email client opened with recipient list");
  };

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

/****************************************
 * JoinedExam satırı (Row) bileşeni
 ****************************************/
interface RowProps {
  exam: JoinedExamResponse;
}

function JoinedRow({ exam }: RowProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPulse(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const quizLink =
    (typeof window !== "undefined" ? window.location.origin : "") +
    (exam.pincode ? `/join/${exam.pincode}` : `/app/exams/get-started/${exam._id}`);

  return (
    <div
      className={cn(
        "group bg-white rounded-2xl p-5 shadow-sm transition-all duration-200 border border-greyscale-light-200 mb-4",
        "hover:shadow-lg hover:bg-brand-secondary-50 hover:border-brand-primary-700"
      )}
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
            <h3 className="text-lg font-semibold text-brand-primary-900 truncate transition-colors group-hover:text-brand-primary-700">
              {exam.title}
            </h3>
            <Badge variant={exam.status} className="shrink-0">
              {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
            </Badge>
          </div>

          {/* İkonlar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-1 transition-colors hover:text-brand-primary-700">
              <CalendarIcon className="w-4 h-4 text-brand-primary-600 transition-transform group-hover:scale-110" />
              <span className="font-medium">Start:</span>
              <span className="truncate">{formatDate(new Date(exam.examStartDate))}</span>
            </div>
            <div className="flex items-center gap-1 transition-colors hover:text-brand-primary-700">
              <ClockIcon className="w-4 h-4 text-brand-primary-600 transition-transform group-hover:scale-110" />
              <span className="font-medium">Duration:</span>
              <DurationFormatter duration={exam.examDuration} base="minutes" />
            </div>
            <div className="flex items-center gap-1 transition-colors hover:text-brand-primary-700">
              <span className="font-medium">Your nickname:</span>
              <Badge
                variant="outline"
                className="
                  bg-gradient-to-br from-brand-primary-50 to-brand-secondary-100 
                  text-brand-primary-700 border border-brand-primary-200/60
                  rounded-lg px-2.5 py-1 shadow-sm
                  hover:from-brand-primary-100 hover:to-brand-secondary-200
                  transition-all duration-200
                  group
                "
              >
                <UsersIcon className="w-4 h-4 mr-1.5 text-brand-primary-600 group-hover:text-brand-primary-700" />
                <span className="font-semibold">
                  {exam.userNickName
                    .replace(/_/g, " ")
                    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}
                </span>
              </Badge>
            </div>
            <div className="flex items-center gap-1 transition-colors hover:text-brand-primary-700">
              <CheckIcon className="w-4 h-4 text-brand-primary-600 transition-transform group-hover:scale-110" />
              <span className="font-medium">Your score:</span>
              <Badge
                variant="outline"
                className="
                  bg-gradient-to-br from-brand-primary-50 to-brand-secondary-100 
                  text-brand-primary-700 border border-brand-primary-200/60
                  rounded-lg px-2.5 py-1 shadow-sm
                  hover:from-brand-primary-100 hover:to-brand-secondary-200
                  transition-all duration-200
                  group
                "
              >
                <span className="font-semibold">
                  {exam.status === "ended"
                    ? exam.userScore !== null && exam.userScore !== undefined
                      ? exam.userScore
                      : "Not Completed"
                    : "???"}
                </span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Share buton */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 border-t sm:border-l sm:border-t-0 border-greyscale-light-200 pt-2 sm:pt-0 sm:pl-2 w-full justify-between sm:w-auto">
            {/* New Answer Key Button */}
            {exam.status === "ended" && exam.userScore !== null && exam.userScore !== undefined && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-brand-primary-50 text-brand-primary-700 relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/app/exams/answer-key/${exam._id}`);
                }}
                title="Answer Key"
              >
                <DocumentTextIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              </Button>
            )}

            {/* Existing Share Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-brand-primary-50 text-brand-primary-700 relative group"
              onClick={(e) => {
                e.stopPropagation();
                setIsShareModalOpen(true);
              }}
              title="Share"
            >
              <ShareIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              {showPulse && (
                <span className="absolute inset-0 rounded-full animate-ping bg-brand-primary-100 opacity-75 group-hover:opacity-100" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/****************************************
 * Boş (Empty) Durum Bileşeni
 * (İkinci snippet'teki stili koruyacak şekilde)
 ****************************************/
function EmptyStateComponent() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4 mt-4 col-span-full">
      <Image
        src={EmptyState}
        height={180}
        width={240}
        alt="No quizzes found"
        className="hover:scale-105 transition-transform duration-300"
      />
      <p className="text-md text-brand-primary-950 mt-1 text-center">No quizzes found.</p>
      <div className="flex gap-2">
        <Button variant="outline" className="mt-2 flex gap-2" onClick={() => router.push("/join/")}>
          Join a quiz
        </Button>
      </div>
    </div>
  );
}

/****************************************
 * ANA BİLEŞEN (Joined Exams Page)
 ****************************************/
export default function JoinedExamsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // Pin code ile quiz'e katılma
  const handleJoinByPinCode = (pincode: string) => {
    router.push(`/join/${pincode}`);
  };

  // useQuery: Katıldığı sınavlar
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["joinedExams"],
    queryFn: () => getAllJoinedExams(),
  });

  // Filtre
  const [filter, setFilter] = useState<FilterOption>("All");

  // Simplify filterExams function to remove sorting
  function filterExams(exams: JoinedExamResponse[]) {
    // 1) Status filter
    const filteredByStatus = exams.filter((exam) => {
      if (filter === "All") return true;
      return exam.status.toLowerCase() === filter.toLowerCase();
    });

    // 2) Search filter
    return searchTerm.trim().length > 0
      ? filteredByStatus.filter((exam) => {
          const title = exam.title?.toLowerCase() || "";
          return title.includes(searchTerm.toLowerCase());
        })
      : filteredByStatus;
  }

  const filteredExams = filterExams(data);

  // ----- Loading -----
  if (isLoading) {
    return (
      <div className="relative min-h-screen h-dvh flex flex-col z-0">
        <DashboardHeader withoutTabs={false} withoutNav={true} />
        <div className="flex items-center justify-center h-full flex-col gap-2">
          <Spinner className="w-12 h-12 text-brand-primary-600" />
          <p className="text-brand-primary-900">Quizzes loading...</p>
        </div>
      </div>
    );
  }

  // ----- Error -----
  if (isError) {
    return (
      <div className="relative min-h-screen h-dvh flex flex-col z-0">
        <DashboardHeader withoutTabs={false} withoutNav={true} />
        <Card className="m-8 p-6 text-center w-full max-w-xl mx-auto">
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

  return (
    <div className="relative min-h-screen h-dvh flex flex-col z-0 overflow-y-auto">
      <DashboardHeader withoutTabs={false} withoutNav={true} />
      <div className="px-4 lg:px-8 py-4 lg:pb-4 lg:pt-2 h-full flex flex-col rounded-b-3xl">
        <Card className="bg-base-white rounded-3xl border border-greyscale-light-200 flex-1 flex flex-col">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
              <div className="space-y-1.5">
                <CardTitle className="text-2xl font-bold text-brand-primary-900">
                  Joined quizzes
                </CardTitle>
                <CardDescription className="text-greyscale-light-600">
                  All quizzes you participated in. Check your score or share them easily!
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-96">
                <Input
                  placeholder="Enter PIN code here..."
                  value={joinCode}
                  maxLength={6}
                  autoFocus={true}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleJoinByPinCode(joinCode);
                    }
                  }}
                  className="w-full transition-all focus:ring-2 focus:ring-brand-primary-200"
                />
                <Button
                  variant="default"
                  onClick={() => handleJoinByPinCode(joinCode)}
                  disabled={!joinCode}
                  className="shrink-0"
                >
                  Join
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0 pt-0">
            {/* Filtre ve arama */}
            <div className="sticky top-0 z-10 backdrop-blur-sm bg-white/90 border-b border-greyscale-light-200">
              <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:justify-between px-4 py-3">
                {/* Filtre butonları */}
                <div className="flex overflow-x-auto gap-2 hide-scrollbar">
                  {FILTER_OPTIONS.map((option) => (
                    <Badge
                      key={option}
                      variant={filter === option ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        filter === option
                          ? "bg-brand-primary-100 text-brand-primary-700 border-brand-primary-300"
                          : "hover:bg-brand-primary-50"
                      )}
                      onClick={() => setFilter(option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>

                {/* Arama input */}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-40 sm:w-64 transition-all duration-300 focus:w-72 focus:ring-2 focus:ring-brand-primary-200"
                  />
                </div>
              </div>
            </div>

            {/* Quiz listesi */}
            {filteredExams.length === 0 ? (
              <EmptyStateComponent />
            ) : (
              <div className="overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[72vh] p-4 rounded-b-3xl">
                {filteredExams.map((exam, index) => (
                  <div
                    key={exam._id}
                    className="motion-safe:animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <JoinedRow exam={exam} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
