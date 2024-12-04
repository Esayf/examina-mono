import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Exam, getExamList } from "@/lib/Client/Exam";
import { formatDate } from "@/utils/formatter";
import { useState } from "react";

// Import Custom Components
import DashboardHeader from "@/components/ui/dashboard-header";

// Icons and Images
import EmptyState from "@/images/emptystates.svg";
import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon, DocumentDuplicateIcon, PlusIcon } from "@heroicons/react/24/outline";
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

interface RowProps {
  exam: Exam;
}

function Row({ exam }: RowProps) {
  const [copiedText, copy] = useCopyToClipboard();

  const now = new Date();
  const startDate = new Date(exam.startDate);
  const endDate = new Date(
    new Date(exam.startDate).getTime() + Number(exam.duration) * 60 * 1000
  );

  let status = "Upcoming";
  if (startDate > now) {
    status = "Upcoming";
  } else if (startDate <= now && (!endDate || endDate > now) && !exam.isCompleted) {
    status = "Active";
  } else if (endDate && endDate <= now || exam.isCompleted) {
    status = "Ended";
  }

  return (
    <div className="text-brand-primary-950">
      <div className="flex transition-all duration-200 ease-in-out font-medium hover:bg-brand-primary-50 hover:text-brand-primary-600 hover:font-bold">
        <div className="flex-1 p-6">
          <p className="text-inherit text-base font-light leading-6" title={exam?.title}>
            {exam?.title.length > 18 ? `${exam?.title.substring(0, 18)}...` : exam?.title}
          </p>
        </div>
        <div className="flex-1 p-6">
          <Badge
            variant={status === "Active" ? "active" : status === "Ended" ? "ended" : "upcoming"}
          >
            {status}
          </Badge>
        </div>
        <div className="flex-1 p-6">
          <p className="text-inherit text-base font-normal leading-6">
            {formatDate(new Date(exam?.startDate))}
          </p>
        </div>
        <div className="flex-1 p-6">
          <p className="text-inherit text-base font-normal leading-6">
            {endDate ? formatDate(endDate) : "N/A"}
          </p>
        </div>
        <div className="flex-1 p-6">
          <p className="text-inherit text-base font-normal leading-6">{exam?.duration} min.</p>
        </div>
        <div className="flex-1 p-6 text-right">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              copy(`${window.location.origin}/app/exams/get-started/${exam._id}`);
            }}
          >
            <DocumentDuplicateIcon className="size-3" />
            {copiedText ? "Copied to clipboard!" : "Copy quiz link"}
          </Button>
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

  const router = useRouter();

  if (isLoading === false && data?.length === 0 && isError === false)
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
      <DashboardHeader />
      <div className="max-w-[76rem] min-h-screen mx-auto my-auto py-8 px:10">
        <Card className="bg-base-white min-h-screen rounded-none md:rounded-3xl">
          <CardHeader>
            <CardHeaderContent>
              <CardTitle>All Quizzes</CardTitle>
              <CardDescription>
                All quizzes created by you are listed here. You can copy the link to share with
                audience.
              </CardDescription>
            </CardHeaderContent>
            <Button asChild pill>
              <Link href="/app/create-exam/">
                Create new
                <ArrowUpRightIcon className="size-6" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="px-0 pt-0">
            <div className="overflow-x-auto">
              <div className="flex">
                <div className="flex-1 p-6 bg-brand-secondary-100">
                  <p className="text-brand-primary-950 text-sm font-medium leading-6">Quiz Title</p>
                </div>
                <div className="flex-1 p-6 bg-brand-secondary-100">
                  <p className="text-brand-primary-950 text-sm font-medium leading-6">Status</p>
                </div>
                <div className="flex-1 p-6 bg-brand-secondary-100">
                  <p className="text-brand-primary-950 text-sm font-medium leading-6">Start Date</p>
                </div>
                <div className="flex-1 p-6 bg-brand-secondary-100">
                  <p className="text-brand-primary-950 text-sm font-medium leading-6">End Date</p>
                </div>
                <div className="flex-1 p-6 bg-brand-secondary-100">
                  <p className="text-brand-primary-950 text-sm font-medium leading-6">Total Time</p>
                </div>
                <div className="flex-1 p-6 bg-brand-secondary-100" />
              </div>
              {data?.map((exam) => (
                <Row key={exam?._id} exam={exam} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default Application;
