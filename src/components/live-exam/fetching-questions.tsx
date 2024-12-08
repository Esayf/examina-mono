import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export const FetchingQuestions = () => {
  const router = useRouter();

  return (
    <div className="h-dvh flex flex-col md:px-6 ">
      <div className="max-w-4xl w-full mx-auto flex flex-col pb-12 flex-1 overflow-hidden justify-center items-center">
        <Card>
          <CardHeader>
            <CardTitle>I guess it will take some times &#128534;</CardTitle>
          </CardHeader>

          <CardContent className="text-lg font-light flex flex-col gap-5 p-5">
            We are fetching the questions for you. Please wait a moment. If this takes too long,
            please try again later. We apologize for any inconvenience this may have caused.
            <div>
              <Button onClick={() => router.reload()}>Try again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
