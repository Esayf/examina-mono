import Image from "next/image";
import router, { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Exam, getDraftExams, getExamList } from "@/lib/Client/Exam";
import { formatDate } from "@/utils/formatter";
import { useState } from "react";

// Import Custom Components
import DashboardHeader from "@/components/ui/dashboard-header";

// Icons and Images
import EmptyState from "@/images/emptystates.svg";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRightIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
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
import { iconComponentFor$ } from "@mdxeditor/editor";
import { IconRight } from "react-day-picker";

interface RowProps {
  exam: Exam;
}

function Row({ exam }: RowProps) {
  const [copiedText, copy] = useCopyToClipboard();

  const now = new Date();
  const startDate = new Date(exam.startDate);
  const endDate =
    exam.duration && exam.startDate
      ? new Date(new Date(exam.startDate).getTime() + Number(exam.duration) * 60 * 1000)
      : null;

  let status = "Upcoming";
  if (startDate > now) {
    status = "Upcoming";
  } else if (startDate <= now && (!endDate || endDate > now) && !exam.isCompleted) {
    status = "Active";
  } else if ((endDate && endDate <= now) || exam.isCompleted) {
    status = "Ended";
  } else {
    status = "Draft";
  }

  return (
    <div className="flex flex-col">
    <div className="text-greyscale-light-700">
      <div className="flex transition-all duration-200 ease-in-out font-medium hover:bg-brand-primary-50 hover:text-brand-primary-600 hover:font-base border-t border-greyscale-light-200">
        <div className="flex-1 p-5 min-w-[154px] max-h-[72px] max-w-[220px] border-r border-greyscale-light-100">
          <p className="text-inherit text-base font-medium leading-6 overflow-y-hidden overflow-x-hidden" title={exam?.title}>
            {exam?.title.length > 15 ? `${exam?.title.substring(0, 15)}...` : exam?.title}
          </p>
        </div>
        <div className="hidden sm:flex flex-1 p-5 min-w-[180px] max-w-[240px] max-h-[72px] border-r border-greyscale-light-100">
          <p className="text-inherit text-base font-normal leading-6 whitespace-nowrap">
            {formatDate(new Date(exam?.startDate))}
          </p>
        </div>
        <div className="hidden lg:flex flex-1 p-5 min-w-[180px] max-w-[240px] max-h-[72px] border-r border-greyscale-light-100">
          <p className="text-inherit text-base font-normal leading-6 whitespace-nowrap">
            {endDate ? formatDate(endDate) : "N/A"}
          </p>
        </div>
        <div className="hidden sm:flex flex-1 p-5 min-w-[120px] max-w-[160px] max-h-[72px] border-r border-greyscale-light-100">
          <p className="text-inherit text-base font-normal leading-6 whitespace-nowrap">
            {exam?.duration} min.
          </p>
        </div>
        <div className="flex-1 p-5 min-w-[80px] max-w-[160px] max-h-[72px]">
          <Badge
            variant={status === "Active" ? "active" : status === "Ended" ? "ended" : "upcoming"}
          >
            {status}
          </Badge>
        </div>
        <div className="flex-1 p-5 min-w-[100px] min-h-[72px] flex justify-end gap-2">
             <Button disabled={exam.isCompleted} variant="outline" size="icon-sm" className="max-w-8 max-h-8 min-w-8 min-h-8 border"
             onClick={() => {
              router.push("/app/create-exam")
            }}
            >
              <PencilIcon className="size-4 w-4 h-4 stroke-current stroke-1 hidden md:block" />
            </Button>
            <Button variant="default" size="sm" icon={true} className="border"
              onClick={() => {
                copy(`${window.location.origin}/app/exams/get-started/${exam._id}`);
              }}
            >
              {copiedText ? "Copied!" : "Copy link"}
              <DocumentDuplicateIcon className="size-4 w-4 h-4 stroke-current stroke-1 hidden md:block" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Application() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["exams"],
    queryFn: getExamList,
  });
  const { data: draftExams } = useQuery({
    queryKey: ["draftExams"],
    queryFn: getDraftExams,
  });

  const router = useRouter();

  if (isLoading === false && data?.length === 0 && draftExams?.length === 0 && isError === false)
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
                <Button variant="default" onClick={() => router.push("/app/create-exam/")}>
                  Create now
                  <ArrowUpRightIcon className="size-6" color="brand-primary-950" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );

  return (
    <>
    <div className="h-dvh flex flex-col bg-brand-secondary-50">
      <DashboardHeader withoutTabs={false} withoutNav={true}/>
      <div className="sm:px-4 lg:px-8 h-full flex flex-col overflow-hidden">
        <div className="max-w-[76rem] w-full mx-auto flex flex-col pb-12 pt-8 flex-1 overflow-hidden">
        <Card className="bg-base-white rounded-2xl md:rounded-3xl flex-1 flex flex-col">
          <CardHeader>
            <CardHeaderContent>
              <CardTitle>All quizzes</CardTitle>
              <CardDescription>
                All quizzes created by you are listed here. You can copy the link to share with
                audience. 
              </CardDescription>
            </CardHeaderContent>
            <Button
              variant="default"
              icon={true}
              iconPosition="right"
              pill
              onClick={() => router.push("/app/create-exam/")}
            >
              Create new
              <ArrowUpRightIcon className="size-6" />
            </Button>
          </CardHeader>

          <CardContent className="px-0 pt-0 pb-5">
              <div className="flex min-w-full">
                <div className="flex-1 p-5 bg-greyscale-light-100 border-r border-r-greyscale-light-200 min-w-[154px] max-w-[220px] border-b-4">
                  <p className="text-brand-primary-950 text-base font-medium leading-4 whitespace-nowrap">Title</p>
                </div>
                <div className="hidden sm:flex flex-1 p-5 bg-greyscale-light-100 border-r border-r-greyscale-light-200 min-w-[180px] max-w-[240px] border-b-4">
                  <p className="text-brand-primary-950 text-base font-medium leading-4 whitespace-nowrap">Start Date</p>
                </div>
                <div className="hidden lg:flex flex-1 p-5 bg-greyscale-light-100 border-r border-r-greyscale-light-200 min-w-[180px] max-w-[240px] border-b-4">
                  <p className="text-brand-primary-950 text-base font-medium leading-4 whitespace-nowrap">End Date</p>
                </div>
                <div className="hidden sm:flex flex-1 p-5 bg-greyscale-light-100 border-r border-r-greyscale-light-200 min-w-[120px] max-w-[160px] border-b-4">
                  <p className="text-brand-primary-950 text-base font-medium leading-4 whitespace-nowrap">Duration</p>
                </div>  
                <div className="flex-1 p-5 bg-greyscale-light-100 min-w-[80px] max-w-[160px] border-b-4">
                  <p className="text-brand-primary-950 text-base font-medium leading-4 whitespace-nowrap">Status</p>
                </div>
                <div className="flex-1 p-5 bg-greyscale-light-100 min-w-[100px] justify-end border-b-4" />
              </div>
              <div className="overflow-y-auto max-h-[628px]">
              {data?.map((exam) => (
                <Row key={exam?._id} exam={exam} />
              ))}
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
