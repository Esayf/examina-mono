import { Badge } from "@/components/ui/badge";
import { getExamStatistics, ExamStatistics } from "@/lib/Client/Exam";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router"
import React from "react";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function isExamStatistics(obj: any): obj is ExamStatistics {console.log(obj);
  return (obj && 
    typeof obj.title === "string"
  );
}

const ExamDetails = () => {
  const router = useRouter();

  const examId = router.query.examId as string;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["examStatistics", examId],
    queryFn: () => getExamStatistics(examId),
  });

  useEffect(() => {
    console.log(data);
  }, [data]);

  if (!isExamStatistics(data)) {
    return isLoading? <div>Loading...</div>
    : <div>Error</div>;
  }

  const startDate = new Date(data.startDate)
  const endDate = new Date(data.startDate);
  endDate.setMinutes(endDate.getMinutes() + data.duration);

  const backgroundImageUrl = data.backgroundImage ? `/api/proxy?hash=${data.backgroundImage}` 
    : "/_next/static/media/bg-8-20.32d1d22b.svg";
  const creatorWalletAddress = data.creator;
  const creatorWalletDisplay  = `${creatorWalletAddress.slice(0,5)}...${creatorWalletAddress.slice(-5)}`;
  const creatorWalletAddressUrl = `https://minascan.io/mainnet/account/${creatorWalletAddress}`;
  
  const now = new Date();
  let status = "Draft";
  if (startDate > now) {
    status = "Upcoming";
  } else if (startDate <= now && (!endDate || endDate > now) && !data.isCompleted) {
    status = "Active";
  } else if ((endDate && endDate <= now) || data.isCompleted) {
    status = "Ended";
  }


  const totalQuestions = data.questionCount;
  const totalParticipants = 10;
  const totalWinners = 8;
  const totalRewards = 1000;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Background Image */}
      {/* <div
        className="absolute inset-0 bg-cover bg-fixed"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      ></div> */}
  
      {/* İçerik */}
      <div className="relative flex justify-center h-screen p-4 overflow-y-auto">
        <div className="w-full min-h-fit bg-white bg-opacity-90 rounded-lg p-4 flex flex-col gap-4">
          {/* <h1 className="text-2xl font-bold">Details</h1> */}
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold border-b border-greyscale-light-200">{data.title}</h2>
              <div>
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
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">Created By</h2>
              <a href={creatorWalletAddressUrl} 
                className="text-sm text-gray-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {creatorWalletDisplay}
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">Description</h2>
              <ReactMarkdown
                className="
                  prose
                  max-w-full
                  text-base
                  text-greyscale-light-900
                  border
                  border-greyscale-light-200
                  rounded-2xl
                  p-4
                  break-words
                  overflow-y-auto
                  h-auto
                  max-h-[50vh]
                "
                remarkPlugins={[remarkGfm]}
              >
              {data.description || "No description yet..."}
              </ReactMarkdown>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">Participants</h2>
              <p className="text-sm text-gray-500">Duration {data.duration} minutes</p>
              <p className="text-sm text-gray-500">Start Date {startDate.toLocaleString()}</p>
              <p className="text-sm text-gray-500">End Date {endDate.toLocaleString()}</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">Exam Status</h2>
              <p className="text-sm text-gray-500">Duration {data.duration} minutes</p>
              <p className="text-sm text-gray-500">Start Date {startDate.toLocaleString()}</p>
              <p className="text-sm text-gray-500">End Date {endDate.toLocaleString()}</p>
            </div>
  
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">Exam </h2>
              <p className="text-sm text-gray-500">{startDate.toLocaleString()}</p>
            </div>
  
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">Exam End Date</h2>
              <p className="text-sm text-gray-500">{endDate.toLocaleString()}</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamDetails;