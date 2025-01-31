import { Badge } from "@/components/ui/badge";
import { getExamStatistics, ExamStatistics } from "@/lib/Client/Exam";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router"
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AttendanceCharts from "@/components/details/attendanceCharts";

function walletRender(walletAddress: string): string {
  return `${walletAddress.slice(0,5)}...${walletAddress.slice(-5)}`;
}

function isExamStatistics(obj: any): obj is ExamStatistics {
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

  const totalWinners = 8;
  const totalRewards = 1000;

  const winnerList = data.winnerlist;
  const participants = data.participants;
  const leaderboard = data.leaderboard ?? [];

  const mockLeaderboard = [
    {
      nickname: "John Doe",
      score: "100",
      finished: true,
      startDate: new Date("2025-11-01 03:32:10"),
      finishTime: new Date("2025-11-01 03:32:10"),
    },
    {
      nickname: "Jane Doe",
      score: "90",
      finished: true,
      startDate: new Date("2025-11-01 03:32:10"),
      finishTime: new Date("2025-01-01 08:41:20"),
    },
    {
      nickname: "Smith Fea",
      score: "80",
      finished: true,
      startDate: new Date("2025-11-01 03:32:10"),
      finishTime: new Date("2025-01-02 11:41:20"),
    },
    {
      nickname: "Randy Rando",
      score: "70",
      finished: false,
      startDate: new Date("2025-11-01 03:32:10"),
      finishTime: new Date("2025-01-01 10:41:20"),
    }
  ]



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
                {walletRender(creatorWalletAddress)}
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
              <h2 className="text-lg font-bold">Exam Status</h2>
              <p className="text-sm text-gray-500">Duration: {data.duration} minutes</p>
              <p className="text-sm text-gray-500">Start Date: {startDate.toLocaleString()}</p>
              <p className="text-sm text-gray-500">End Date: {endDate.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Questions: {totalQuestions}</p>
            </div>

            <div className="flex min-h-[200px] col-span-2 gap-2">
            
              {participants && 
              <AttendanceCharts participants={participants} 
                startDate={startDate} 
                endDate={endDate}/>
              }


            </div>


            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">Leaderboard</h2>
              {leaderboard.map((item) => (
                <div key={item.nickname} className="flex flex-col gap-2">
                  <p className="text-sm text-gray-500">{item.nickname}</p>
                  <p className="text-sm text-gray-500">{item.score}</p>
                  <p className="text-sm text-gray-500">{item.finishTime.toLocaleString()}</p>
                </div>
              ))}
            </div>
  
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">Winner List</h2>
              {winnerList?.map((item) => (
                <div key={`winner-list-${item.walletAddress}`} className="flex flex-col gap-2">
                  <p className="text-sm text-gray-500">{item.walletAddress}</p>
                  <p className="text-sm text-gray-500">{item.score}</p>
                  <p className="text-sm text-gray-500">{item.finishTime.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">Participants</h2>
              {participants?.map((item) => (
                <div key={`participant-${item.walletAddress}`} className="flex flex-col gap-2">
                  <div className="flex flex-row gap-2">
                    <p className="text-sm text-gray-500">{walletRender(item.walletAddress)}</p>
                    <p className="text-sm text-gray-500">{item.score}</p>
                    <p className="text-sm text-gray-500">{new Date(item.startTime).toLocaleString()}</p>
                    {item.finishTime && 
                    <p className="text-sm text-gray-500">{new Date(item.finishTime).toLocaleString()}</p>}
                  </div>
                </div>
              ))}
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