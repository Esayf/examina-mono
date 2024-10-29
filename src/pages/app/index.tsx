import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Exam, getExamList } from "@/lib/Client/Exam";
import { formatDate } from "@/utils/formatter";

// Import Custom Components
import DashboardHeader from "@/components/ui/DashboardHeader";

// Icons and Images
import Right from "@/icons/right_long.svg";
import None from "@/images/dashboard/none.svg";
import { Button } from "@/components/ui/button";
import { DocumentDuplicateIcon, PlusIcon } from "@heroicons/react/24/outline";
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

  return (
    <div className="text-[#8b8d98]">
      <div className="flex transition-all duration-200 ease-in-out font-medium hover:bg-[#f6f4f9] hover:text-[#60646c] hover:font-bold">
        <div className="flex-1 p-6">
          <p className="text-inherit text-base font-normal leading-6" title={exam?.title}>
            {exam?.title.length > 18 ? `${exam?.title.substring(0, 18)}...` : exam?.title}
          </p>
        </div>
        <div className="flex-1 p-6">
          <Badge variant="active">Active</Badge>
        </div>
        <div className="flex-1 p-6">
          <p className="text-inherit text-base font-normal leading-6">
            {formatDate(new Date(exam?.startDate))}
          </p>
        </div>
        <div className="flex-1 p-6">
          <p className="text-inherit text-base font-normal leading-6">
            {exam?.creator.slice(0, 5)}...
            {exam?.creator.slice(exam?.creator.length - 4, exam?.creator.length + 1)}
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
            <DocumentDuplicateIcon className="size-4" />
            {copiedText ? "Copied" : "Copy Link"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Application() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["exams"], queryFn: getExamList });

  const router = useRouter();

  if (isLoading === false && data?.length === 0 && isError === false)
    return (
      <>
        <DashboardHeader />
        <div className="max-w-[76rem] mx-auto py-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-normal">All Quizzes</h3>
          </div>
          <div className="flex justify-center items-center min-h-[600px] h-[80vh]">
            <div className="flex flex-col gap-[2.625rem]">
              <Image src={None} alt="" />
              <div className="text-center">
                <p className="text-gray-800 text-2xl font-normal leading-9">
                  You haven&apos;t created any exams yet!{" "}
                </p>
                <h3 className="text-gray-800 text-2xl font-semibold leading-9">Create new quiz.</h3>
              </div>
              <div className="flex justify-center">
                <div
                  className="py-3 px-4.5 bg-[color:rgba(var(--mina-purple))] rounded-lg inline-flex items-center gap-2 shadow-[0_5.063px_0_0_#262525] transition-all duration-200 ease-in-out hover:shadow-[0_3.063px_0_0_#262525] hover:cursor-pointer"
                  onClick={() => router.push("/app/create-exam/")}
                >
                  <p className="text-white">Create Now</p>
                  <Image src={Right} alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );

  return (
    <>
      <DashboardHeader />
      <div className="max-w-[76rem] mx-auto py-7">
        <Card>
          <CardHeader>
            <CardHeaderContent>
              <CardTitle>All Quizzes</CardTitle>
              <CardDescription>
                All quizzes created by you are listed here. You can copy the link to share with
              </CardDescription>
            </CardHeaderContent>
            <Button asChild>
              <Link href="/app/create-exam/">
                <PlusIcon className="size-6" />
                New Quiz
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="px-0 pt-0">
            <div className="overflow-x-auto">
              <div className="flex">
                <div className="flex-1 p-6">
                  <p className="text-gray-500 text-base font-semibold leading-6">NAME</p>
                </div>
                <div className="flex-1 p-6">
                  <p className="text-gray-500 text-base font-semibold leading-6">STATUS</p>
                </div>
                <div className="flex-1 p-6">
                  <p className="text-gray-500 text-base font-semibold leading-6">CREATED ON</p>
                </div>
                <div className="flex-1 p-6">
                  <p className="text-gray-500 text-base font-semibold leading-6">CREATED BY</p>
                </div>
                <div className="flex-1 p-6">
                  <p className="text-red-500 text-base font-semibold leading-6">DURATION</p>
                </div>
                <div className="flex-1 p-6" />
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
