import { NextPage } from "next";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, ClockIcon, CheckIcon, UsersIcon } from "@heroicons/react/24/outline";
import BackgroundPattern from "@/images/backgrounds/bg-5.svg";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { getUserProfile } from "@/components/profile/user"; // Bu API fonksiyonunu oluşturmanız gerekecek
import DurationFormatter from "@/components/ui/time/duration-formatter";
import router from "next/router";

const ProfilePage: NextPage = () => {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getUserProfile(),
  });

  if (isLoading) {
    return (
      <div className="relative min-h-screen h-dvh flex flex-col z-0">
        <div className="flex items-center justify-center h-full">
          <Spinner className="w-12 h-12 text-brand-primary-600" />
          <p className="mt-2 text-brand-primary-900">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="relative min-h-screen h-dvh flex flex-col z-0">
        <Card className="m-8 p-6 text-center">
          <h3 className="text-red-600 text-lg font-semibold mb-4">Error loading profile</h3>
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
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />

      <div className="px-4 lg:px-8 py-4 lg:pb-4 lg:pt-2 h-full flex flex-col rounded-b-3xl">
        <Card className="bg-base-white rounded-3xl border border-greyscale-light-200 flex-1 flex flex-col">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-brand-primary-100 to-brand-secondary-100 flex items-center justify-center">
                <span className="text-4xl font-bold text-brand-primary-600">{user.name[0]}</span>
              </div>
              <div className="flex-1 text-center sm:text-left space-y-4">
                <div>
                  <CardTitle className="text-3xl font-bold text-brand-primary-900">
                    {user.name}
                  </CardTitle>
                  <CardDescription className="text-xl text-greyscale-light-600">
                    {user.role}
                  </CardDescription>
                  <p className="text-sm text-greyscale-light-500">Member since: {user.joinDate}</p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                  <Button
                    variant="default"
                    className="gap-2"
                    onClick={() => router.push("/app/create-exam")}
                  >
                    <PlusIcon className="w-5 h-5" />
                    Create New Quiz
                  </Button>
                  <Button variant="outline" className="border-greyscale-light-200">
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Created Quizzes", value: user.stats.createdQuizzes, color: "primary" },
                {
                  label: "Participated Quizzes",
                  value: user.stats.participatedQuizzes,
                  color: "secondary",
                },
                { label: "Total Score", value: user.stats.totalScore, color: "success" },
                { label: "Success Rate", value: user.stats.successRate, color: "warning" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl border border-greyscale-light-200"
                >
                  <div className={`text-3xl font-bold text-brand-${stat.color}-600`}>
                    {stat.value}
                  </div>
                  <div className="text-greyscale-light-600 mt-2">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Quiz Activities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {user.recentQuizzes.map((quiz, index) => (
                      <div key={index} className="border-b last:border-b-0 pb-6 last:pb-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-brand-primary-900">
                              {quiz.title}
                            </h3>
                            <p className="text-sm text-greyscale-light-500">{quiz.date}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`
                              ${
                                quiz.type === "created"
                                  ? "bg-brand-primary-50 text-brand-primary-600"
                                  : "bg-brand-secondary-50 text-brand-secondary-600"
                              }
                            `}
                          >
                            {quiz.type === "created" ? (
                              <div className="flex items-center gap-2">
                                <UsersIcon className="w-4 h-4" />
                                <span>{quiz.participants} Participants</span>
                                <span className="mx-2">•</span>
                                <span>Avg. Score: {quiz.averageScore}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <CheckIcon className="w-4 h-4" />
                                <span>Score: {quiz.score}</span>
                                <span className="mx-2">•</span>
                                <ClockIcon className="w-4 h-4" />
                                <span>{quiz.duration}</span>
                              </div>
                            )}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Achievement Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-brand-primary-50 to-brand-secondary-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-brand-primary-600 mb-2">
                        Quiz Master
                      </div>
                      <p className="text-greyscale-light-600">
                        Total {user.stats.createdQuizzes + user.stats.participatedQuizzes} quiz
                        activities
                      </p>
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-greyscale-light-600">Highest Score</span>
                        <span className="font-semibold">{user.stats.highestScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-greyscale-light-600">Average Duration</span>
                        <DurationFormatter duration={user.stats.averageDuration} base="minutes" />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-greyscale-light-600">Favorite Category</span>
                        <span className="font-semibold">{user.stats.favoriteCategory}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
