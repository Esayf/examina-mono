export interface UserProfile {
  name: string;
  email: string;
  role: string;
  joinDate: string;
  stats: {
    createdQuizzes: number;
    participatedQuizzes: number;
    totalScore: number;
    successRate: string;
    highestScore: number;
    averageDuration: number;
    favoriteCategory: string;
  };
  recentQuizzes: Array<{
    _id: string;
    title: string;
    date: string;
    type: "created" | "participated";
    participants?: number;
    averageScore?: number;
    score?: number;
    duration?: string;
  }>;
}

// Mock veri döndüren fonksiyon
export async function getUserProfile(): Promise<UserProfile> {
  // API çağrısını simüle etmek için küçük bir gecikme ekleyelim
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    name: "John Doe",
    email: "john@example.com",
    role: "Quiz Master",
    joinDate: "01/01/2024",
    stats: {
      createdQuizzes: 15,
      participatedQuizzes: 45,
      totalScore: 890,
      successRate: "87.5%",
      highestScore: 98,
      averageDuration: 15, // dakika cinsinden
      favoriteCategory: "Science",
    },
    recentQuizzes: [
      {
        _id: "1",
        title: "Science Quiz #12",
        date: "2024-03-15",
        type: "created",
        participants: 25,
        averageScore: 85,
      },
      {
        _id: "2",
        title: "Math Challenge",
        date: "2024-03-14",
        type: "participated",
        score: 92,
        duration: "12:30",
      },
      {
        _id: "3",
        title: "History Trivia",
        date: "2024-03-13",
        type: "created",
        participants: 18,
        averageScore: 78,
      },
      {
        _id: "4",
        title: "Geography Explorer",
        date: "2024-03-12",
        type: "participated",
        score: 88,
        duration: "15:45",
      },
      {
        _id: "5",
        title: "Literature Quiz",
        date: "2024-03-11",
        type: "participated",
        score: 95,
        duration: "10:20",
      },
    ],
  };
}
