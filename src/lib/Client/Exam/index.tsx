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
  role: 'created' | 'joined';
  filter?: 'all' | 'upcoming' | 'active' | 'ended';
  sortBy?: 'title' | 'startDate' | 'duration' | 'createdAt' | 'score' | 'endDate' | 'status';
  sortOrder?: 'asc' | 'desc';
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
  }
  user: {
    userName: string;
    walletAddress: string;
    _id: string;
  };
}

function getScore(examID: string):Promise<Score[]> {
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
};
