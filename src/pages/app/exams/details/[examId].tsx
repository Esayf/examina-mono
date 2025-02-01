import { Badge } from "@/components/ui/badge";
import { getExamStatistics, ExamStatistics, Leaderboard, Participant } from "@/lib/Client/Exam";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AttendanceCharts from "@/components/details/attendanceCharts";
import rehypeRaw from "rehype-raw";

function walletRender(walletAddress: string): string {
  return `${walletAddress.slice(0, 5)}...${walletAddress.slice(-5)}`;
}

function isExamStatistics(obj: any): obj is ExamStatistics {
  return obj && typeof obj.title === "string";
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getScoreColorClass = (score: number, passingScore: number) => {
  return score >= passingScore ? "text-green-500" : "text-brand-primary-600";
};

const ExamDetails = () => {
  const router = useRouter();

  const examId = router.query.examId as string;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["examStatistics", examId],
    queryFn: () => getExamStatistics(examId),
    enabled: !!examId,
  });

  if (!isExamStatistics(data)) {
    return isLoading ? <div>Loading...</div> : <div>Error</div>;
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.startDate);
  endDate.setMinutes(endDate.getMinutes() + data.duration);

  const backgroundImageUrl = data.backgroundImage
    ? `/api/proxy?hash=${data.backgroundImage}`
    : "/_next/static/media/bg-8-20.32d1d22b.svg";
  const creatorWalletAddress = data.creator;
  const creatorWalletDisplay = `${creatorWalletAddress.slice(0, 5)}...${creatorWalletAddress.slice(
    -5
  )}`;
  const creatorWalletAddressUrl = `https://minascan.io/mainnet/account/${creatorWalletAddress}`;

  const totalQuestions = data.questionCount;
  const passingScore = data.passingScore;

  const now = new Date();
  let status = "Draft";
  if (data.isCompleted) {
    status = "Ended";
  } else if (startDate > now) {
    status = "Upcoming";
  } else {
    status = "Active";
  }

  const leaderboard = data.leaderboard && data.leaderboard.length > 0 ? data.leaderboard : []; // mockLeaderboard;
  const participants = data.participants ?? []; // mockParticipants;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Content Container */}
      <div className="relative flex justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-7xl min-h-fit bg-white bg-opacity-90 rounded-lg p-4 flex flex-col gap-4">
          {/* Grid Container */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
            {/* Title Section */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold border-b border-greyscale-light-200 pb-2">
                {data.title}
              </h2>
              <Badge variant={status.toLowerCase() as any} className="mt-2 text-sm">
                {status}
              </Badge>
            </div>

            {/* Creator Section */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-greyscale-light-200">
              <h3 className="text-lg font-semibold mb-2">Created By</h3>
              <a
                href={creatorWalletAddressUrl}
                className="text-sm text-brand-primary-600 hover:underline break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {creatorWalletDisplay}
              </a>
            </div>

            {/* Exam Details Section */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-greyscale-light-200">
              <h3 className="text-lg font-semibold mb-2">Exam Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex flex-row">
                  <div className="font-medium w-[6rem]">⏳ Duration</div>
                  <div>: {data.duration} minutes</div>
                </div>
                <div className="flex flex-row">
                  <div className="font-medium min-w-[6rem]"> 🏁 Started </div>{" "}
                  <p>
                    : on {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex flex-row">
                  <div className="font-medium min-w-[6rem]"> 🚩 Finished </div>{" "}
                  <p>
                    : on {endDate.toLocaleDateString()} at {endDate.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex flex-row">
                  <div className="font-medium w-[6rem]">❓ Questions</div> <p>: {totalQuestions}</p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-greyscale-light-200">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <ReactMarkdown
                className="prose max-w-full text-sm sm:text-base"
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {data.description || "No description available"}
              </ReactMarkdown>
            </div>

            {/* Charts Section */}
            <div className="md:col-span-1 bg-white rounded-xl p-4 shadow-sm border border-greyscale-light-200">
              <h3 className="text-lg font-semibold mb-4">Attendance</h3>
              {participants && (
                <AttendanceCharts
                  participants={participants}
                  startDate={startDate}
                  endDate={endDate}
                />
              )}
            </div>

            {/* Participants Section */}
            <div className="md:col-span-1 bg-white rounded-xl p-4 shadow-sm border border-greyscale-light-200">
              <h3 className="text-lg font-semibold mb-4">Participants</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-greyscale-light-200">
                      <th className="pb-2 text-sm font-medium min-w-[120px]">User</th>
                      <th className="pb-2 text-sm font-medium">Score</th>
                      <th className="pb-2 text-sm font-medium min-w-[100px]">Start</th>
                      <th className="pb-2 text-sm font-medium min-w-[100px]">End</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants?.map((item) => (
                      <tr
                        key={item.walletAddress}
                        className="border-b border-greyscale-light-100 hover:bg-greyscale-light-50"
                      >
                        <td className="py-3 text-sm truncate max-w-[150px]">
                          <a
                            href={`https://minascan.io/mainnet/account/${item.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-primary-600 hover:underline"
                          >
                            {walletRender(item.walletAddress)}
                          </a>
                        </td>
                        <td className="py-3 text-sm">
                          {item.score ? (
                            item.score
                          ) : (
                            <span className="text-greyscale-light-500">-</span>
                          )}
                        </td>
                        <td className="py-3 text-sm">
                          {new Date(item.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 text-sm">
                          {item.finishTime ? (
                            new Date(item.finishTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          ) : (
                            <span className="text-greyscale-light-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leaderboard Section */}
            <div className="md:col-span-1 bg-white rounded-xl p-4 shadow-sm border border-greyscale-light-200">
              <h3 className="text-lg font-semibold mb-4">Leaderboard</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-greyscale-light-200">
                      <th className="pb-2 text-sm font-medium">#</th>
                      <th className="pb-2 text-sm font-medium">User</th>
                      <th className="pb-2 text-sm font-medium">Score</th>
                      <th className="pb-2 text-sm font-medium min-w-[100px]">Finished at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((item, index) => {
                      const startTime = new Date(item.startTime);
                      const finishTime = new Date(item.finishTime);

                      const timeTaken = (finishTime.getTime() - startTime.getTime()) / 1000;
                      return (
                        <tr
                          key={item.userId}
                          className="border-b border-greyscale-light-100 hover:bg-greyscale-light-50"
                        >
                          <td className="py-3 text-sm">{index + 1}</td>
                          <td className="py-3 text-sm font-medium ">
                            <a
                              href={`https://minascan.io/mainnet/account/${item.walletAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-primary-600 hover:underline"
                            >
                              {walletRender(item.walletAddress)}
                            </a>
                          </td>
                          <td
                            className={`py-3 text-sm truncate ${getScoreColorClass(
                              item.score,
                              passingScore
                            )}`}
                          >
                            {item.score}
                          </td>
                          <td className="py-3 text-sm">
                            {formatTime(finishTime)} -
                            <span className="text-greyscale-light-500">{timeTaken} min</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;
