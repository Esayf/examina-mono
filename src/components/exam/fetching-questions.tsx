import styles from "@/styles/app/exams/ExamScreen.module.css";
import { useRouter } from "next/router";

export const FetchingQuestions = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.exam_header_container}>
        <div className={styles.exam_header_container}>
          <h1 className={styles.exam_header_title}>I guess it will take some times &#128534;</h1>
        </div>
      </div>
      <p className={styles.error_description}>
        We are fetching the questions for you. Please wait a moment. If this takes too long, please
        try again later. We apologize for any inconvenience this may have caused.
      </p>
      <div className={styles.error_func_container}>
        <p onClick={() => router.reload()}>Try again</p>
      </div>
    </div>
  );
};
