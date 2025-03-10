import RequestBase from "../RequestBase";

import { ExamState } from "@/features/client/exam";

export interface Exam {
  _id: string;
  creator: string;
  title: string;
  description: string;
  duration: number;
  startDate: string;
  rootHash: string;
  secretKey: string;
  isCompleted: boolean;
  questionCount: number;
  uniqueId: number;
  isRewarded: boolean;
  rewardPerWinner: number;
  isDistributed: boolean;
  passingScore: number;
  contractAddress: string;
  deployJobId: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  backgroundImage: string | null;
  status: "published";
}

export interface GetExamsParams {
  role: "created" | "joined";
  filter?: "all" | "upcoming" | "active" | "ended";
  sortBy?: "title" | "startDate" | "duration" | "createdAt" | "score" | "endDate" | "status";
  sortOrder?: "asc" | "desc";
}

function getExamList(params: GetExamsParams): Promise<Exam[]> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get("/exams/myExams", params)
      .then((response) => {
        resolve(response.data.map((exam: any) => ({ ...exam, status: "published" })));
      })
      .catch((error) => {
        reject(error);
      });
  });
}
export interface CreatedExamResponse {
  _id: string;
  title: string;
  description: string;
  startDate: Date;
  duration: number;
  endDate: Date;
  totalParticipants: number;
  status: "upcoming" | "active" | "ended";
  pincode?: string;
}

export function getAllCreatedExams(params?: GetExamsParams): Promise<CreatedExamResponse[]> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get("/exams/myExams/created", params)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export class JoinedExamResponse {
  _id: string;
  title: string;
  description: string;
  examStartDate: Date;
  examEndDate: Date;
  examDuration: number;
  examFinishedAt: Date;
  status: "active" | "ended";
  userStartedAt: Date;
  userFinishedAt: Date | null;
  userDurationAsSeconds: number | null;
  userScore: number | null;
  userNickName: string;
  isCompleted: boolean;
  pincode?: string;
  questions: {
    text: string;
    options: {
      number: number;
      text: string;
    }[];
    correctAnswer: number;
    number: number;
    userAnswer: number | null;
    questionType: "mc" | "tf";
  }[];

  constructor(data?: Partial<JoinedExamResponse>) {
    this._id = data?._id ?? "mock-exam-123";
    this.title = data?.title ?? "Sample Mock Exam";
    this.description =
      data?.description ?? "This is a mock exam description with **markdown** support.";
    this.examStartDate = data?.examStartDate ?? new Date("2024-03-20T10:00:00Z");
    this.examEndDate = data?.examEndDate ?? new Date("2024-03-20T12:00:00Z");
    this.examDuration = data?.examDuration ?? 7200; // 2 hours in seconds
    this.examFinishedAt = data?.examFinishedAt ?? new Date("2024-03-20T11:45:00Z");
    this.status = data?.status ?? "ended";
    this.userStartedAt = data?.userStartedAt ?? new Date("2024-03-20T10:15:00Z");
    this.userFinishedAt = data?.userFinishedAt ?? new Date("2024-03-20T11:45:00Z");
    this.userDurationAsSeconds = data?.userDurationAsSeconds ?? 5400; // 1.5 hours
    this.userScore = data?.userScore ?? 80;
    this.userNickName = data?.userNickName ?? "TestUser123";
    this.isCompleted = data?.isCompleted ?? true;
    this.pincode = data?.pincode ?? "ABC123";
    this.questions = data?.questions ?? JoinedExamResponse.defaultQuestions;
  }

  static get defaultQuestions() {
    return [
      {
        text: "# Question 1\n\nWhat is the capital of France?\n\n```python\nprint('Hello World')\n```",
        options: [
          { number: 1, text: "London" },
          { number: 2, text: "Paris" },
          { number: 3, text: "Berlin" },
          { number: 4, text: "Madrid" },
        ],
        correctAnswer: 2,
        number: 1,
        userAnswer: 2,
        questionType: "mc" as const,
      },
      {
        text: "## Question 2\n\nIs the following statement true?\n\n> The Earth is flat.",
        options: [
          { number: 1, text: "True" },
          { number: 2, text: "False" },
        ],
        correctAnswer: 2,
        number: 2,
        userAnswer: 1,
        questionType: "tf" as const,
      },
      {
        text: "### Question 3\n\nWhich of these is a JavaScript framework?\n\n* Option A\n* Option B\n* Option C",
        options: [
          { number: 1, text: "Django" },
          { number: 2, text: "Flask" },
          { number: 3, text: "React" },
          { number: 4, text: "Laravel" },
        ],
        correctAnswer: 3,
        number: 3,
        userAnswer: 3,
        questionType: "mc" as const,
      },
      {
        text: "#### Question 4\n\nSelect the correct SQL query:\n\n```sql\nSELECT * FROM users;\n```",
        options: [
          { number: 1, text: "The query above" },
          { number: 2, text: "DELETE FROM users;" },
          { number: 3, text: "DROP TABLE users;" },
          { number: 4, text: "INSERT INTO users;" },
        ],
        correctAnswer: 1,
        number: 4,
        userAnswer: null,
        questionType: "mc" as const,
      },
    ];
  }

  // Instance methods
  getCorrectAnswersCount(): number {
    return this.questions.reduce(
      (count, q) => count + (q.userAnswer === q.correctAnswer ? 1 : 0),
      0
    );
  }

  getIncorrectAnswersCount(): number {
    return this.questions.reduce(
      (count, q) => count + (q.userAnswer !== null && q.userAnswer !== q.correctAnswer ? 1 : 0),
      0
    );
  }

  getUnansweredCount(): number {
    return this.questions.reduce((count, q) => count + (q.userAnswer === null ? 1 : 0), 0);
  }

  getCompletionPercentage(): number {
    const answered = this.questions.filter((q) => q.userAnswer !== null).length;
    return (answered / this.questions.length) * 100;
  }

  // Static methods
  static generateMock(overrides?: Partial<JoinedExamResponse>): JoinedExamResponse {
    return new JoinedExamResponse(overrides);
  }

  static generateMocks(count: number): JoinedExamResponse[] {
    return Array.from(
      { length: count },
      (_, index) =>
        new JoinedExamResponse({
          _id: `mock-exam-${index}`,
          title: `Mock Exam ${index + 1}`,
          userScore: Math.floor(Math.random() * 100),
          questions: this.defaultQuestions.map((q) => ({
            ...q,
            userAnswer:
              Math.random() > 0.7 ? null : Math.floor(Math.random() * q.options.length) + 1,
          })),
        })
    );
  }
}

export function getAllJoinedExams(params?: GetExamsParams): Promise<JoinedExamResponse[]> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get("/exams/myExams/joined", params)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// Usage examples:
/*
// Create a single mock exam
const mockExam = new JoinedExamResponse();

// Create a mock exam with custom values
const customMockExam = new JoinedExamResponse({
  title: "Custom Exam",
  userScore: 95
});

// Generate multiple mock exams
const multipleExams = JoinedExamResponse.generateMocks(5);

// Use instance methods
console.log(mockExam.getCorrectAnswersCount());
console.log(mockExam.getCompletionPercentage());
*/

function getDraftExams(): Promise<DraftExam[]> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get("/drafts")
      .then((response) => {
        resolve(response.data.map((exam: any) => ({ ...exam, status: "draft" })));
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export interface DraftExam extends Omit<Exam, "status"> {
  id: any;
  questions: {
    text: string;
    options: {
      number: number;
      text: string;
    }[];
    correctAnswer: number;
    number: number;
    questionType: "mc" | "tf";
  }[];
  status: "draft";
  totalRewardPoolAmount: number;
  pincode?: string;
}

function getDraftExam(examID: string): Promise<DraftExam> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get(`/drafts/${examID}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

interface ErrorResponse {
  message: string;
}

export interface ExamStatistics extends Exam {
  winnerlist?: Winner[];
  participants?: Participant[];
  leaderboard?: Leaderboard;
}

export type Winner = {
  walletAddress: string;
  score: number;
  finishTime: Date;
};

export interface Participant {
  isCompleted: boolean;
  userId: string;
  nickname: string; // TODO: Will be nicknames after random nickname implementation. For now username it is.
  walletAddress: string;
  score?: number;
  startTime: Date;
  finishTime?: Date;
}

export type Leaderboard = Array<
  Participant & {
    score: number;
    finishTime: Date;
  }
>;

interface ExamDetails {
  exam: Exam;
  participatedUser: ParticipatedUser;
}

interface ParticipatedUser {
  createdAt: string;
  exam: string;
  isFinished: boolean;
  isMailSent: boolean;
  isRewardSent: boolean;
  isWinner: boolean;
  jobAdded: boolean;
}

function getExamDetails(examID: string): Promise<ExamDetails | ErrorResponse> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get(`/exams/${examID}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getExamStatistics(examID: string): Promise<ExamStatistics | ErrorResponse> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get(`/exams/${examID}/details`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function startExam(examID: string) {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    console.log(examID);
    requestBase
      .post(`/exams/startExam`, {
        examId: examID,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export interface QuestionDocument {
  exam: string;
  text: string;
  options: Array<{
    number: number;
    text: string;
  }>;
  number: number;
  uniqueId: string;
  _id: string;
}

type QuestionResponse = QuestionDocument[];

function getExamQuestions(examID: string): Promise<QuestionResponse | ErrorResponse> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get(`/questions/${examID}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function createExam(exam: ExamState) {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .post("/exams/create", {
        ...exam,
        duration: parseInt(exam.duration),
        rootHash: "0x0",
        secretKey: "SIOSDajksa",
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export type CreateDraftInput = {
  title: string;
  description?: string | undefined;
  startDate?: string | undefined;
  duration?: number | undefined;
  questionCount?: number | undefined;
  isRewarded?: boolean | undefined;
  isPrivate?: boolean | undefined;
  questions?:
    | {
        number: number;
        text: string;
        options: {
          number: number;
          text: string;
        }[];
        correctAnswer: number;
      }[]
    | undefined;
  rewardPerWinner?: number | undefined;
  passingScore?: number | undefined;
};

export interface SaveDraftError {
  error: string;
  message: string;
  errors: {
    field: string;
    message: string;
  }[];
}

function saveDraftExam(draft: CreateDraftInput): Promise<DraftExam> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .post("/drafts", draft)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function updateDraftExam(draft: CreateDraftInput & { id: string }): Promise<DraftExam> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    const { id, ...rest } = draft;

    requestBase
      .put(`/drafts/${id}`, rest)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function deleteDraftExam(examID: string) {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .delete(`/drafts/${examID}`)
      .then((response: any) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function submitQuiz(examId: string, answers: number[], questions: string[]) {
  const _answers: any = [];

  for (let i = 0; i < questions.length; i++) {
    _answers.push({
      questionId: questions[i].toString(),
      answer: `${answers[i]}`,
    });
  }

  const requestBase = new RequestBase();

  console.log({
    examId: examId,
    answers: _answers,
  });

  await requestBase.post(`/exams/finishExam`, {
    examId: examId,
    answers: _answers,
  });
}

async function sendEmail(email: string) {
  const requestBase = new RequestBase();
  await requestBase.post(`/users/put/email`, {
    email: email,
  });
}

async function submitAnswers(examID: string, answers: number[], questions: string[]) {
  for (let i = 0; i < answers.length; i++) {
    const requestBase = new RequestBase();
    await requestBase.post(`/exams/${examID}/answer/submit`, {
      answer: {
        selectedOption: answers[i],
        questionId: questions[i],
      },
    });
  }
}

export interface Score {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  isWinner: boolean;
  exam: {
    title: string;
    _id: string;
  };
  user: {
    userName: string;
    walletAddress: string;
    _id: string;
  };
}

function getScore(examID: string): Promise<Score[]> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get(`/scores/${examID}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export interface PinCode {
  examId: string;
}

function getExamByPinCode(pinCode: string): Promise<PinCode> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get(`/pincode/${pinCode}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export {
  getExamList,
  createExam,
  saveDraftExam,
  updateDraftExam,
  deleteDraftExam,
  getExamDetails,
  getExamQuestions,
  getDraftExams,
  getDraftExam,
  submitAnswers,
  getScore,
  startExam,
  submitQuiz,
  sendEmail,
  getExamStatistics,
  getExamByPinCode,
};
