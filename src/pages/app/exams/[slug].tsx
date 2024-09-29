import styles from '@/styles/app/exams/ExamScreen.module.css';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  imagePlugin,
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

// Types
import Question from '@/lib/Question';

// Custom Layout
import Layout from './layout';

// Import Icons
import Clock from '@/icons/clock_red.svg';

// Radix Primitives
import * as RadioGroup from '@radix-ui/react-radio-group';

// API
import { getExamQuestions, getExamDetails, submitQuiz } from '@/lib/Client/Exam';

type CurrentQuestion = Question | undefined;
type Answer = 0 | 1 | 2 | 3 | 4 | 5;
type Choices = Answer[];

function ExamDetails() {
  const router = useRouter();
  const examID: string = router.query.slug as string;
  const mdRef = useRef<any>(null);

  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);
  const [choices, setChoices] = useState<Choices>([]);
  const [remainingTimeMiliseconds, setRemainingTimeMiliseconds] = useState<number | null>(null);
  const [startTimer, setStartTimer] = useState<boolean>(false);

  const {
    data: examData,
    isLoading: isloadingData,
    isError: isErrorExam,
  } = useQuery({
    queryKey: ['exam'],
    queryFn: () => getExamDetails(examID),
    enabled: !!examID,
  });

  const {
    data: questions,
    isLoading: isLoadingQuestions,
    isError: isErrorQuestions,
  } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => await getExamQuestions(examID),
    enabled: !!examID,
  });

  useEffect(() => {
    if (currentQuestion && mdRef.current) {
      const description = currentQuestion.text || '';
      mdRef.current.setMarkdown(description);
    }
  }, [currentQuestion]);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => {
      return await submitQuiz(
        (examData as any).exam._id,
        choices,
        (questions as any).map((el: any) => el._id)
      );
    },
    onSuccess: () => {
      toast.loading(
        'Your answers have been submitted successfully. Redirecting to the result page.',
        {
          duration: 2000,
        }
      );
      window.location.href = `/app/exams/result/${examID}`;
    },
    onError: (error) => {
      toast.error('An error occured when submitting the answers. Please try again later.');
    },
  });

  console.log('QQQ', questions);
  console.log('EEE', examData);
  console.log('CCC', currentQuestion);

  useEffect(() => {
    if (questions && examData) {
      console.log(questions);
      setChoices(new Array((questions as any).length).fill(0));
      setCurrentQuestion((questions as any)[0]);
      setRemainingTimeMiliseconds((prev) => {
        if (prev === null) {
          setStartTimer(true);
          return Math.floor(
            (new Date((examData as any).exam.startDate).getTime() +
              (examData as any).exam.duration * 60000 -
              new Date().getTime()) /
              1000
          );
        }
        return prev - 1;
      });
    }
  }, [questions, examData]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (startTimer) {
        setRemainingTimeMiliseconds((el) => (el !== null ? el - 1 : null));
      }
      if (startTimer && remainingTimeMiliseconds && remainingTimeMiliseconds <= 0) {
        mutate();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTimer]);

  if (isLoadingQuestions || isloadingData) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.exam_header_container}>
            <div className={styles.exam_header_container}>
              <h1 className={styles.exam_header_title}>
                I guess it will take some times &#128534;
              </h1>
            </div>
          </div>
          <p className={styles.error_description}>
            We are fetching the questions for you. Please wait a moment. If this takes too long,
            please try again later. We apologize for any inconvenience this may have caused.
          </p>
          <div className={styles.error_func_container}>
            <p onClick={() => router.reload()}>Try again</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (
    (!isLoadingQuestions && isErrorQuestions) ||
    (!isloadingData && isErrorExam) ||
    (remainingTimeMiliseconds !== null && remainingTimeMiliseconds <= 0)
  ) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.exam_header_container}>
            <div className={styles.exam_header_container}>
              <h1 className={styles.exam_header_title}>
                An error occured when fetching questions &#128534;
              </h1>
            </div>
          </div>
          <p className={styles.error_description}>
            Sorry, we couldn't process your request at the moment. This may be due to several
            reasons:
          </p>
          <ul className={styles.error_description}>
            <li> - the exam session may have ended or not started,</li>
            <li> - you may not have the necessary authorization to access the exam,</li>
            <li>
              {' '}
              - our servers have burned down, and they may be raising the average temperature of the
              world with the carbon dioxide they emit,
            </li>
            <li> - or you may not have logged into the application.</li>
          </ul>
          <p className={styles.error_description}>
            Please check your credentials and try again later. If the issue persists, please contact
            support for assistance. We apologize for any inconvenience this may have caused.
          </p>
          <p className={styles.error_description}>
            <a href="">Mail us</a>. Or send a DM on X (@chozapp).
          </p>
          <div className={styles.error_func_container}>
            <p onClick={() => router.reload()}>Try again</p>
            <Link href="/" prefetch={false} replace>
              Go to homepage
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.header_container}>
        <div className={styles.exam_header_container}>
          <div className={styles.exam_header_text_container}>
            <h3 className={styles.exam_header_type}>Quiz</h3>
            <h1 className={styles.exam_header_title}>{examData && (examData as any).exam.title}</h1>
          </div>
          <div className={styles.timer_container}>
            <Image src={Clock} alt="" width={22.51} />
            <p className={styles.timer_content}>
              {remainingTimeMiliseconds
                ? `${Math.floor(remainingTimeMiliseconds / 60)}:${(remainingTimeMiliseconds % 60)
                    .toString()
                    .padStart(2, '0')}`
                : '-'}
            </p>
          </div>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.content_container}>
          <h1 className={styles.question_number}>
            Question {currentQuestion ? (currentQuestion as any).number : ''}
          </h1>
          <div className={styles.preview_container}>
            <div className={styles.preview_question_container}>
              <div className={styles.question_container}>
                <MDXEditor
                  ref={mdRef}
                  readOnly
                  markdown={currentQuestion ? (currentQuestion as any).text : ''}
                  // markdown={
                  //   'ASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDG'
                  // }
                  plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),
                    imagePlugin(),
                  ]}
                />
                {/* <p className={styles.question_describe}>{currentQuestion?.description}</p> */}
                {/* <p className={styles.question_title}>{currentQuestion?.text}</p> */}
              </div>
              <div className={styles.answers_container}>
                <RadioGroup.Root
                  className="RadioGroupRoot"
                  defaultValue="default"
                  aria-label="View density"
                >
                  {currentQuestion &&
                    currentQuestion.options.map((el, i) => {
                      return (
                        <div
                          key={i}
                          className={`RadioGruopContainer ${
                            el.number === choices[currentQuestion.number - 1] &&
                            'RadioGroupContainer__active'
                          } RadioGruopContainerPreview`}
                          onClick={() => {
                            const newChoices = [...choices];
                            newChoices[currentQuestion.number - 1] = el.number;
                            setChoices(newChoices);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <RadioGroup.Item
                              className="RadioGroupItem"
                              value={el.text}
                              checked={
                                currentQuestion.options[i].number ===
                                choices[currentQuestion.number - 1]
                              }
                            >
                              <RadioGroup.Indicator className="RadioGroupIndicator" />
                            </RadioGroup.Item>
                            <p
                              className="RadioText"
                              style={{
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                              }}
                            >
                              {el.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </RadioGroup.Root>
              </div>
            </div>
            <div className={styles.preview_selector_container}>
              <div className={styles.preview_next_container}>
                <div className={styles.selector_container}>
                  {questions &&
                    (questions as any).map((el: any, _i: string) => {
                      return (
                        <div
                          key={_i}
                          className={`${styles.selector_box} ${
                            el.number === currentQuestion?.number && styles.selector_box_active
                          }`}
                          onClick={() => setCurrentQuestion(el)}
                        >
                          <p
                            className={`${styles.selector_box_text} ${
                              el.number === currentQuestion?.number &&
                              styles.selector_box_text_active
                            }`}
                          >
                            {_i + 1}
                          </p>
                        </div>
                      );
                    })}
                </div>
                <div className={styles.form_element_button_container_questions}>
                  <button
                    className={styles.form_element_button_next}
                    onClick={() => {
                      setCurrentQuestion(
                        (questions as any)[currentQuestion ? currentQuestion?.number : 0]
                      );
                    }}
                    disabled={isPending || currentQuestion?.number === (questions as any)?.length}
                  >
                    Next Question
                  </button>
                </div>
              </div>
              <div className={styles.form_element_button_container_questions}>
                <button
                  className={styles.form_element_button_finish}
                  onClick={() => {
                    console.log(choices);

                    // Check if choices is empty or all choices are 0
                    if (choices.length === 0 || choices.every((el) => el === 0)) {
                      toast.error('Please answer at least one question before submitting.');
                      return;
                    }

                    console.log('Selam');
                    mutate();
                  }}
                  disabled={isPending}
                >
                  {isPending ? 'Redirecting' : 'Finish Quiz'}
                </button>
              </div>
            </div>
          </div>
          {/* <div className={styles.form_element_button_container}>
            <button
              className={styles.form_element_button}
              onClick={() => {
                if (choices.length === 0) return;
                if (currentQuestion?.number === (questions as any).length) {
                  mutate();
                  return;
                }
                setCurrentQuestion(
                  (questions as any)[currentQuestion ? currentQuestion?.number : 0]
                );
              }}
              disabled={isPending}
            >
              {currentQuestion?.number === 10
                ? isPending
                  ? 'Redirecting'
                  : 'Save and Finish'
                : 'Next Question'}
            </button>
          </div> */}
        </div>
      </div>
    </Layout>
  );
}

export default ExamDetails;
