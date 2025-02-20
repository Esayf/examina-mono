import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import BackgroundPattern from "@/images/backgrounds/bg-7.svg";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const JoinExam = () => {
  const [examLink, setExamLink] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Link formatını kontrol et
    if (!examLink.trim()) {
      setError("Please enter a quiz link");
      return;
    }

    try {
      let examId;

      // Tam URL mi yoksa sadece ID mi kontrol et
      if (examLink.includes("http")) {
        examId = new URL(examLink).pathname.split("/").pop();
      } else {
        // Direkt ID girilmiş olabilir
        examId = examLink.trim();
      }

      if (!examId) {
        setError("Invalid exam link");
        return;
      }

      // Sınav sayfasına yönlendir
      window.location.href = `/app/exams/get-started/${examId}`;
    } catch {
      setError("Invalid URL format");
    }
  };

  return (
    <div className="flex w-full justify-center flex-col items-center h-dvh bg-[url('/bg.png')] bg-cover">
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        className="absolute flex justify-center items-center h-dvh object-cover"
      />
      <div className="flex flex-col items-center justify-center flex-1 z-10">
        <Card className="max-w-[36rem] w-full px-10 py-16">
          <CardContent className="space-y-8">
            <div className="text-start">
              <h2 className="text-3xl font-extrabold text-brand-primary-950">
                Ready for an adventure? 🚀
              </h2>
              <p className="mt-2 text-brand-primary-900">
                Join an exciting quiz and test your knowledge!
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="examLink"
                  className="block text-sm font-medium text-brand-primary-950"
                >
                  Quiz Link or ID
                </label>
                <div className="mt-1">
                  <Input
                    id="examLink"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-greyscale-light-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-secondary-500 focus:border-brand-secondary-500"
                    placeholder="Paste your quiz link or enter quiz ID"
                    value={examLink}
                    onChange={(e) => setExamLink(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                  <span>&#128561; Oops! </span>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="default"
                size="default"
                icon
                iconPosition="right"
                className="w-full hover:border-brand-primary-700 transition-transform hover:scale-[1.01] active:scale-[0.99] cubic-bezier(0.4, 0, 0.2, 1)"
              >
                Let's begin! <ArrowUpRightIcon className="size-4" />
              </Button>

              <div className="mt-4 text-center text-sm text-gray-600">
                Or, to view your statistics,{"  "}
                <Link
                  href="/app/dashboard/joined"
                  className="font-medium text-brand-primary-600 hover:text-brand-primary-800"
                >
                  Go to Dashboard ↗️
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinExam;
