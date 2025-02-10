// Radix Primitives
import * as RadioGroup from "@radix-ui/react-radio-group";

// API
import { QuestionDocument } from "@/lib/Client/Exam";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import { useEffect } from "react";

export const Question = ({
  index,
  option,
  choices,
  currentQuestion,
  setChoices,
  className,
}: {
  index: number;
  option: QuestionDocument["options"][number];
  choices: number[];
  currentQuestion: QuestionDocument;
  setChoices: (choices: number[]) => void;
  className?: string;
}) => {
  const handleSelection = () => {
    const newChoices = [...choices];
    newChoices[currentQuestion.number - 1] = option.number;
    setChoices(newChoices);
  };

  const playSound = (isSelected: boolean) => {
    const sound = new Audio("/audio/select-3.mp3");
    if (isSelected) {
      sound.pause();
      sound.currentTime = 0;
      sound.play();
    }
  };

  const isSelected = option.number === choices[currentQuestion.number - 1];

  useEffect(() => {
    if (isSelected) {
      playSound(true);
    }
  }, [isSelected]);

  return (
    <div
      className={`
        RadioGruopContainer
        ${
          isSelected
            ? "RadioGroupContainer__active shadow-sm border-2 border-brand-primary-300 animate-[bounce_0.6s_ease-in-out]"
            : "hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
        }
        RadioGroupContainerPreview
        relative overflow-hidden
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-brand-primary-50/20 before:to-transparent
        before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
      `}
      onClick={handleSelection}
      style={{ cursor: "pointer" }}
    >
      <div className="flex items-start gap-3 p-4 whitespace-normal break-words ">
        <RadioGroup.Item
          className={`
            RadioGroupItem rounded-full bg-base-white min-w-[24px] w-6 h-6 mt-1 
            hover:scale-105 hover:shadow-md transition-all duration-200 ease-out overflow-hidden
            ${
              isSelected
                ? "border-3 border-brand-primary-600 ring-4 ring-brand-primary-100 animate-[radioPop_0.4s_ease-out]"
                : "border-2 border-greyscale-light-400 hover:border-brand-primary-400"
            }
          `}
          value={String(option.number)}
          id={`option-${option.number}`}
          checked={option.number === choices[currentQuestion.number - 1]}
          onClick={handleSelection}
        >
          <RadioGroup.Indicator className="RadioGroupIndicator">
            <div className="absolute w-3 h-3 bg-brand-primary-600 rounded-full animate-[popIn_200ms_ease-out_forwards]" />
          </RadioGroup.Indicator>
        </RadioGroup.Item>

        <div className="flex flex-col gap-2">
          <ReactMarkdown
            className="mdxeditor prose min-w-full
              [&_blockquote]:animate-[fadeIn_0.5s_ease-in-out]
              [&_p]:hover:translate-x-1 [&_p]:transition-transform
              [&_li]:hover:pl-4 [&_li]:transition-all
              [&_img]:hover:scale-[1.02] [&_img]:transition-transform
              [&_strong]:animate-[pulse_2s_infinite]
              [&_code]:hover:scale-[1.05]
              [&_h1]:text-xl [&_h1]:sm:text-4xl [&_h1]:text-center [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:bg-brand-primary-900 [&_h1]:from-brand-primary-950 [&_h1]:to-brand-primary-900 [&_h1]:bg-clip-text [&_h1]:text-transparent [&_h1]:drop-shadow-md
              [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:text-brand-primary-600 [&_h2]:pl-4
              [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:text-brand-primary-800
              [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:text-brand-primary-950
              [&_h5]:text-lg [&_h5]:font-medium [&_h5]:mb-1 [&_h5]:text-brand-primary-950
              [&_h6]:text-base [&_h6]:font-normal [&_h6]:mb-0 [&_h6]:text-brand-primary-950
              [&_p]:text-xl [&_p]:font-normal [&_p]:text-brand-primary-950
              [&_a]:text-brand-secondary-950 [&_a]:font-medium [&_a]:hover:text-brand-secondary-900
              [&_code]:text-base [&_code]:bg-brand-primary-300 [&_code]:text-base-black [&_code]:font-bold [&_code]:px-2 [&_code]:py-1 [&_code]:rounded-lg
              [&_ul]:list-disc [&_ul]:pl-8 [&_ul]:space-y-3 [&_ul]:text-lg [&_ul]:text-brand-primary-950 [&_ul]:items-center [&_ul]:justify-center
              [&_li::marker]:text-brand-primary-500 [&_li::marker]:text-base [&_li::marker]:text-center [&_li::marker]:font-bold [&_ul_li::marker]:content-['🔘']
              [&_ol]:list-decimal [&_ol]:pl-8 [&_ol]:space-y-3 [&_ol]:text-lg [&_ol]:text-brand-primary-950 [&_ol]:items-center [&_ol]:justify-center
              [&_ol]:marker:font-bold  [&_ol]:marker:brand-primary-800 [&_ol]:marker:text-lg [&_ol]:font-normal 
              [&_li]:pl-3 [&_li]:space-x-2
              [&_blockquote]:border-l-4 [&_blockquote]:border-brand-primary-300 [&_blockquote]:bg-brand-secondary-50 [&_blockquote]:p-2 [&_blockquote]:w-full [&_blockquote]:text-brand-primary-950 [&_blockquote]:m-2 [&_blockquote]:italic [&_blockquote]:bg-white [&_blockquote]:rounded-xl [&_blockquote]:shadow-sm [&_blockquote]:justify-center [&_blockquote]:items-center [&_blockquote]:text-center
              [&_img]:rounded-2xl [&_img]:max-w-full [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:shadow-lg [&_img]:border-4 [&_img]:border-white
              [&_hr]:my-8 [&_hr]:border-t-4 [&_hr]:border-dashed [&_hr]:border-brand-primary/30"
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              a: ({ node, ...props }) => (
                <a
                  className="text-brand-secondary font-medium hover:text-brand-accent transition-all 
                          underline underline-offset-4 decoration-2 hover:decoration-brand-accent
                          hover:scale-105 inline-block"
                  {...props}
                />
              ),
              table: ({ node, ...props }) => (
                <div className="rounded-2xl shadow-lg overflow-hidden my-6 mx-4 border border-greyscale-light-200 items-center justify-center">
                  <table className="w-full divide-y divide-brand-primary-200" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th
                  className="py-3 px-4 text-left bg-brand-primary-900 font-bold text-brand-secondary-200 text-base uppercase"
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td
                  className="py-3 px-4 border-t text-base text-base-black border-greyscale-light-200 text-brand-dark even:bg-brand-light/20"
                  {...props}
                />
              ),
              code: ({ node, ...props }) => (
                <code
                  className="bg-brand-accent/10 px-2 py-1 rounded-md font-mono text-sm text-brand-accent border border-brand-accent/20 hover:bg-brand-accent/20 transition-colors"
                  {...props}
                />
              ),
              pre: ({ node, ...props }) => (
                <pre
                  className="bg-brand-dark p-6 rounded-xl overflow-x-auto text-sm my-6 text-white 
                          shadow-2xl border-2 border-brand-primary/30 hover:border-brand-accent/50 transition-all"
                  {...props}
                />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-black text-brand-accent drop-shadow-sm" {...props} />
              ),
              em: ({ node, ...props }) => (
                <em className="italic text-brand-primary/90 font-semibold" {...props} />
              ),
            }}
          >
            {option.text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
