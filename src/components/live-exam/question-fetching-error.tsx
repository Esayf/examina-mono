import { useRouter } from "next/router";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export const QuestionFetchingError = () => {
  const router = useRouter();

  return (
    <div className="h-dvh flex flex-col md:px-6 ">
      <div className="w-full mx-auto flex flex-col pb-12 flex-1 overflow-hidden justify-center items-center">
        <Card>
          <CardHeader>
            <CardTitle>An error occured when fetching questions &#128534;</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-5 text-lg font-light flex flex-col gap-5">
            <p>
              Sorry, we couldn&apos;t process your request at the moment. This may be due to several
              reasons:
            </p>
            <ul>
              <li> 📌 the exam session may have ended or not started,</li>
              <li> 📌 you may not have the necessary authorization to access the exam,</li>
              <li>
                {" "}
                📌 our servers have burned down, and they may be raising the average temperature of
                the world with the carbon dioxide they emit,
              </li>
              <li> 📌 or you may not have logged into the application.</li>
            </ul>
            <p>
              Please check your credentials and try again later. If the issue persists, please
              contact support for assistance. We apologize for any inconvenience this may have
              caused.
            </p>
            <p>
              <a href="mailto:info@choz.io">Mail us</a>. Or send a DM on X (
              <a
                href="https://x.com/chozapp"
                target="_blank"
                className="text-primary hover:underline"
              >
                @chozapp
              </a>
              ).
            </p>
            <div>
              <Button onClick={() => router.reload()}>Try again</Button>
              <Button asChild variant="link">
                <Link href="/" prefetch={false} replace>
                  Go to homepage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
