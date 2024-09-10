import styles from "@/styles/app/Dashboard.module.css";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getExamList } from "@/lib/Client/Exam";
import { formatDate } from "../../../utils/formatter";

// Import Custom Components
import DashboardHeader from "@/components/ui/DashboardHeader";

// Icons and Images
import Plus from "@/icons/plus.svg";
import Duplicate from "@/icons/duplicate.svg";
import Right from "@/icons/right_long.svg";
import None from "@/images/dashboard/none.svg";

function Application() {
  const [copied, setCopied] = useState<string>();

  const { data, isLoading, isError } = useQuery({ queryKey: ["exams"], queryFn: getExamList });

  const router = useRouter();

  if (isLoading === false && (data as any)?.length === 0 && isError === false) {
    return (
      <div>
        <DashboardHeader />
        <div className={`${styles.content_container} ${styles.container}`}>
          <div className={styles.content_header}>
            <h3 className={styles.content_header_title}>Your Quizzes</h3>
          </div>
          <div className={styles.no_content_container}>
            <div className={styles.no_content_inner_container}>
              <Image src={None} alt="" />
              <div className={styles.no_content_text_container}>
                <p className={styles.no_content_desc}>You haven't created any exams yet! </p>
                <h3 className={styles.no_content_title}>Create new quiz.</h3>
              </div>
              <div className={styles.no_content_button_container}>
                <div
                  className={styles.no_content_button}
                  onClick={() => router.push("/app/create-exam/")}
                >
                  <p className={styles.content_header_button_text}>Create Now</p>
                  <Image src={Right} alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader />
      <div className={`${styles.content_container} ${styles.container}`}>
        <div className={styles.content_header}>
          <h3 className={styles.content_header_title}>Your Quizzes</h3>
          <div
            className={styles.content_header_button}
            onClick={() => router.push("/app/create-exam/")}
          >
            <Image src={Plus} alt="" className={styles.plus_icon} />
            <p className={styles.content_header_button_text}>New Quiz</p>
          </div>
        </div>
        <div className={styles.table_container}>
          <div className={styles.table_inner_container}>
            <div className={styles.table_head_container}>
              <div className={`${styles.table_head_item_container} `}>
                <p className={styles.table_head_item}>NAME</p>
              </div>
              <div className={`${styles.table_head_item_container} `}>
                <p className={styles.table_head_item}>STATUS</p>
              </div>
              <div className={`${styles.table_head_item_container} `}>
                <p className={styles.table_head_item}>CREATED ON</p>
              </div>
              <div className={`${styles.table_head_item_container} `}>
                <p className={styles.table_head_item}>CREATED BY</p>
              </div>
              <div className={`${styles.table_head_item_container} `}>
                <p className={`${styles.table_head_item} ${styles.table_head_item_secondary}`}>
                  DURATION
                </p>
              </div>
            </div>
            {data &&
              (data as any)?.map((exam: any) => {
                return (
                  <div className={styles.table_rows_container} key={exam?._id}>
                    <div className={styles.table_row_container}>
                      <div className={`${styles.table_row_item_container}`}>
                        <p className={styles.table_row_item} title={exam?.title}>
                          {exam?.title.length > 18
                            ? `${exam?.title.substring(0, 18)}...`
                            : exam?.title}
                        </p>
                      </div>
                      <div className={`${styles.table_row_item_container}`}>
                        <p className={styles.table_row_item}>Active</p>
                      </div>
                      <div className={`${styles.table_row_item_container}`}>
                        <p className={styles.table_row_item}>
                          {formatDate(new Date(exam?.startDate))}
                        </p>
                      </div>
                      <div className={`${styles.table_row_item_container}`}>
                        <p className={styles.table_row_item}>
                          {exam?.creator.slice(0, 5)}...
                          {exam?.creator.slice(exam?.creator.length - 4, exam?.creator.length + 1)}
                        </p>
                      </div>
                      <div className={`${styles.table_row_item_container}`}>
                        <p className={styles.table_row_item}>{exam?.duration} min.</p>
                      </div>
                      <div className={`${styles.table_row_item_container}`}>
                        <div
                          className={styles.table_row_item_edit_container}
                          onClick={() => {
                            navigator.clipboard
                              .writeText(`https://choz.io/app/exams/get-started/${exam?._id}`)
                              .then(() => setCopied(exam?._id));
                          }}
                        >
                          {/* <Image src={Copy} alt="" /> */}
                          <Image src={Duplicate} alt="" />
                          <p className={styles.table_row_copy_link}>
                            {copied === exam?._id ? "Copied" : "Copy Link"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Application;
