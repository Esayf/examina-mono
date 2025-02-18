import { NextPage } from "next";
import Image from "next/image";

const ProfilePage: NextPage = () => {
  const user = {
    name: "Alice Smith",
    email: "alice@mail.com",
    role: "Teacher",
    joinDate: "January 2024",
    stats: {
      createdQuizzes: 15,
      participatedQuizzes: 45,
      totalScore: 850,
      successRate: "78%",
    },
    recentQuizzes: [
      {
        title: "Math Quiz #3",
        date: "2 days ago",
        type: "created",
        participants: 24,
        averageScore: 75,
      },
      {
        title: "Science Final",
        date: "5 days ago",
        type: "participated",
        score: 90,
        duration: "45 minutes",
      },
      {
        title: "English Grammar",
        date: "1 week ago",
        type: "created",
        participants: 35,
        averageScore: 82,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Banner */}
      <div className="w-full bg-gradient-to-r from-purple-600 to-blue-600 h-48"></div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-32">
        <div className="flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-purple-200 to-blue-200 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-600">{user.name[0]}</span>
              </div>
              <div className="flex-1 text-center sm:text-left space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                  <p className="text-xl text-gray-600">{user.role}</p>
                  <p className="text-sm text-gray-500">Member since: {user.joinDate}</p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                  <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md">
                    Create New Quiz
                  </button>
                  <button className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border-2 border-gray-200 hover:bg-gray-50 transition-all">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-purple-600">{user.stats.createdQuizzes}</div>
              <div className="text-gray-600 mt-2">Created Quizzes</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-blue-600">
                {user.stats.participatedQuizzes}
              </div>
              <div className="text-gray-600 mt-2">Participated Quizzes</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-green-600">{user.stats.totalScore}</div>
              <div className="text-gray-600 mt-2">Total Score</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-orange-600">{user.stats.successRate}</div>
              <div className="text-gray-600 mt-2">Success Rate</div>
            </div>
          </div>

          {/* Quiz Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Recent Quiz Activities</h2>
                <div className="space-y-6">
                  {user.recentQuizzes.map((quiz, index) => (
                    <div key={index} className="border-b last:border-b-0 pb-6 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{quiz.title}</h3>
                          <p className="text-sm text-gray-500">{quiz.date}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-4 py-2">
                          {quiz.type === "created" ? (
                            <div className="text-sm">
                              <span className="text-purple-600 font-medium">
                                {quiz.participants} Participants
                              </span>
                              <span className="mx-2">•</span>
                              <span className="text-gray-600">Avg. Score: {quiz.averageScore}</span>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <span className="text-blue-600 font-medium">Score: {quiz.score}</span>
                              <span className="mx-2">•</span>
                              <span className="text-gray-600">{quiz.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Achievement Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Quiz Achievements</h2>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">Quiz Master</div>
                    <p className="text-gray-600">
                      Total {user.stats.createdQuizzes + user.stats.participatedQuizzes} quiz
                      activities
                    </p>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Highest Score</span>
                      <span className="font-semibold">95</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Duration</span>
                      <span className="font-semibold">35 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Favorite Category</span>
                      <span className="font-semibold">Mathematics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
