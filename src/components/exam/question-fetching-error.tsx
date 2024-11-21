import styles from "@/styles/app/exams/ExamScreen.module.css";
import { useRouter } from "next/router";
import Link from "next/link";

export const QuestionFetchingError = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.exam_header_container}>
        <div className={styles.exam_header_container}>
          <h1 className={styles.exam_header_title}>
            An error occured when fetching questions &#128534;
          </h1>
        </div>
      </div>
      <p className={styles.error_description}>
        Sorry, we couldn&apos;t process your request at the moment. This may be due to several
        reasons:
      </p>
      <ul className={styles.error_description}>
        <li> - the exam session may have ended or not started,</li>
        <li> - you may not have the necessary authorization to access the exam,</li>
        <li>
          {" "}
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
  );
};
