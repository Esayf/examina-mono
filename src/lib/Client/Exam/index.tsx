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
}

function getExamList(): Promise<Exam[]> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get("/exams/myExams")
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

interface ExamDetails {
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
  __v: number;
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
  correctAnswer: number;
  number: number;
  uniqueId: string;
}

interface QuestionResponse {
  status: number;
  data: QuestionDocument[];
  message?: string;
}

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

async function submitQuiz(examID: string, answers: number[], questions: string[]) {
  const _answers: any = [];

  for (let i = 0; i < questions.length; i++) {
    _answers.push({
      questionID: questions[i],
      answer: `${answers[i]}`,
    });
  }

  console.log(_answers);

  const requestBase = new RequestBase();
  await requestBase.post(`/exams/finishExam`, {
    examID: examID,
    answers: _answers,
  });
}

async function sendEmail(email: string) {
  const requestBase = new RequestBase();
  await requestBase.post(`/user/put/email`, {
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

function getScore(examID: string) {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get(`/exams/scores/get_user_score/${examID}`)
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
  getExamDetails,
  getExamQuestions,
  submitAnswers,
  getScore,
  startExam,
  submitQuiz,
  sendEmail,
};
