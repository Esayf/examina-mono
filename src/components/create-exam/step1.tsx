"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { step1ValidationSchema, useStep1Form } from "./step1-schema";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "./markdown";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import DashboardHeader from "@/components/ui/dashboard-header";
import { useFormContext } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeaderContent,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRightIcon,
  PlusIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowLeftIcon,
  ForwardIcon,
} from "@heroicons/react/24/outline";
import { QuestionListItem } from "./question-list-item";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import BGR from "@/images/backgrounds/bg-8-20.svg";
import { SaveAsDraftButton } from "@/components/create-exam/save-as-draft-button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { MediaUpload } from "./media-upload";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/** -----------------------------
 * AnswersProps Interface
 * ------------------------------
 * Tanımlanan 'Answers' bileşeni; her 'question' objesinin
 * 'answers' alt alanını yönetir.
 */
interface AnswersProps {
  index: number;
}

/** -------------------------------------
 * Answers Component
 * --------------------------------------
 * Soruya ait cevap seçeneklerini kontrol eder (TF/MC).
 * Bu bileşen, "questions[index].answers" üzerinde çalışır.
 */
export function Answers({ index }: AnswersProps) {
  const form = useStep1Form();
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: `questions.${index}.answers`,
  });

  // Radio butonda hangi answer'ın seçildiğini kontrol etmek için local state
  const [selectedValue, setSelectedValue] = useState<string | undefined>();

  // Yeni bir radio seçildiğinde
  const handleSelection = (value: string) => {
    setSelectedValue(value);
    form.setValue(`questions.${index}.correctAnswer`, value);
  };

  // Extra form yapısı (Zod val. vs), opsiyonel
  const correctAnswerForm = useForm({
    defaultValues: { correctAnswer: "" },
    resolver: zodResolver(step1ValidationSchema),
  });

  // questionType'i gözlemleyerek "tf" ya da "mc" moduna göre answers değiştir
  const questionType = form.watch(`questions.${index}.questionType`);
  const prevQuestionType = useRef(questionType);

  useEffect(() => {
    if (questionType === prevQuestionType.current) return;

    if (questionType === "tf") {
      // True/False sorusuna geçince varsayılan 2 cevap
      replace([{ answer: "True" }, { answer: "False" }]);
    } else if (questionType === "mc") {
      // Multiple Choice sorusuna geçince en az 2 boş cevap
      replace([{ answer: "" }, { answer: "" }]);
    }

    prevQuestionType.current = questionType;
  }, [questionType, replace]);

  // Mobilde tek sütun, masaüstünde 2 sütun
  const radioGroupClass = "grid grid-cols-1 md:grid-cols-1 gap-4 w-full";

  return (
    <div className="flex flex-col">
      <FormField
        control={form.control}
        name={`questions.${index}.correctAnswer`}
        render={({ field: radioField }) => (
          <FormItem className="mb-4">
            <FormLabel>Answer options</FormLabel>

            <RadioGroup
              className={radioGroupClass}
              value={selectedValue}
              onValueChange={(value) => {
                handleSelection(value);
                form.clearErrors(`questions.${index}.correctAnswer`);
              }}
              onBlur={() => form.trigger(`questions.${index}.correctAnswer`)}
            >
              {fields.map((field, i) => {
                // Karakter limiti
                const charCount = field.answer?.length || 0;
                const isOverLimit = charCount > 76; // Belirlediğimiz örnek limit
                const hasTrashIcon = fields.length > 2; // 2'den fazla answer varsa silebilelim

                // True/False renklendirme
                const isTrueOption = field.answer === "True";
                const isFalseOption = field.answer === "False";
                const isSelected = radioField.value === i.toString();

                // TF color
                let tfColorClass = "";
                if (questionType === "tf") {
                  if (isTrueOption) {
                    tfColorClass = isSelected
                      ? "bg-green-50 border border-green-600 text-green-900 shadow-sm text-lg md:text-xl hover:bg-green-100"
                      : "bg-green-50/50 text-green-800 border-green-200 text-base md:text-xl hover:bg-green-100";
                  } else if (isFalseOption) {
                    tfColorClass = isSelected
                      ? "bg-red-50 border border-red-600 text-red-900 shadow-sm text-lg md:text-xl hover:bg-red-100"
                      : "bg-red-50/50 text-red-800 border-red-200 text-base md:text-xl hover:bg-red-100";
                  }
                }

                return (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`questions.${index}.answers.${i}.answer`}
                    render={({ field: inputField }) => (
                      <FormItem className="w-full">
                        <div className="relative">
                          <Input
                            as="textarea"
                            placeholder={`Option ${i + 1}`}
                            maxLength={76}
                            {...inputField}
                            onKeyDown={(e) => {
                              // Enter tuşu yeni satır açmasın
                              if (e.key === "Enter") e.preventDefault();
                            }}
                            onChange={(e) => {
                              inputField.onChange(e);
                              form.setValue(
                                `questions.${index}.answers.${i}.answer`,
                                e.target.value
                              );
                            }}
                            // className: TF seçili/ seçilmemiş, MC seçili, limit aşımı vb.
                            className={cn(
                              "min-h-[6rem] overflow-y-auto px-11 py-5 w-full rounded-2xl border items-center text-xl font-mediumtransition-all duration-200",
                              questionType === "tf" && tfColorClass,
                              isSelected && questionType !== "tf"
                                ? "outline outline-2 outline-brand-primary-900 bg-brand-secondary-50 ring-0"
                                : "",
                              questionType === "tf" && "cursor-pointer",
                              isOverLimit ? "border-ui-error-500 focus:ring-ui-error-500" : ""
                            )}
                            readOnly={questionType === "tf"} // TF cevaplarını değiştirmeye gerek yok
                            // Tıklanınca radio seçili hale gelsin (TF'de)
                            onClick={() => {
                              if (questionType === "tf") {
                                radioField.onChange(i.toString());
                                handleSelection(i.toString());
                                form.setValue(`questions.${index}.correctAnswer`, i.toString());
                              }
                            }}
                            // Input'un solunda radio item
                            startElement={
                              <RadioGroupItem
                                className="size-6 mb-3"
                                value={i.toString()}
                                checked={isSelected}
                              />
                            }
                            // Sağ tarafta silme butonu
                            endElement={
                              hasTrashIcon && (
                                <div className="relative group inline-block">
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    onClick={() => {
                                      remove(i);
                                      // Hemen feedback için animasyon
                                      setTimeout(() => form.trigger(), 100);
                                    }}
                                  >
                                    <XMarkIcon className="size-4" />
                                  </Button>
                                  <div
                                    className="
                                      hidden group-hover:block
                                      absolute -top-10 left-1/2 -translate-x-1/2
                                      px-2 py-1 rounded-md text-white bg-black
                                      text-xs whitespace-nowrap
                                      animate-fadeIn
                                      z-50
                                    "
                                  >
                                    Are you sure?
                                  </div>
                                </div>
                              )
                            }
                          />
                          {/* TF dışında karakter sayısı göstergesi */}
                          {questionType !== "tf" && (
                            <div
                              className={cn(
                                "absolute top-2 right-2 text-xs bg-white/50 backdrop-blur-sm px-1.5 py-0.5 rounded-md",
                                isOverLimit ? "text-red-500" : "text-gray-500"
                              )}
                            >
                              {`${inputField.value?.length || 0}/76`}
                            </div>
                          )}
                        </div>
                        {isOverLimit && (
                          <p className="text-red-500 text-sm mt-1">
                            The answer option exceeds the maximum allowed 76 characters.
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                );
              })}
            </RadioGroup>

            <FormMessage />
          </FormItem>
        )}
      />

      {/* Çoktan seçmeli (mc) -> en fazla 4 cevap */}
      {form.watch(`questions.${index}.questionType`) === "mc" && fields.length < 4 && (
        <Button
          variant="outline"
          size="icon"
          className="rounded-full mx-auto flex mt-2 mb-4"
          onClick={() => {
            append({ answer: "" });
          }}
        >
          <PlusIcon className="size-6" />
        </Button>
      )}
    </div>
  );
}

/** -------------------------
 * Step1Props Interface
 * --------------------------
 * Step1 bileşeni, 'onNext' fonksiyonunu prop olarak alır.
 */
interface Step1Props {
  onNext: () => void;
}

// Müzik parçaları array'i
const musicTracks = [
  {
    id: 1,
    path: "/music/background-music-13.mp3",
    name: "Truth Whispers in the Silence",
  },
  {
    id: 2,
    path: "/music/background-music-9.mp3",
    name: "The Spark of Creation",
  },
  {
    id: 3,
    path: "/music/background-music-8.mp3",
    name: "Where Dreams Take Flight",
  },
  {
    id: 4,
    path: "/music/background-music-10.mp3",
    name: "Echoes of Inspiration",
  },
  {
    id: 5,
    path: "/music/background-music-12.mp3",
    name: "The Path Unfolds",
  },
];

// MusicControls bileşenini export edilebilir yap
export const MusicControls = () => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ses seviyesi değiştiğinde sadece volume'u güncelle
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Müzik değiştiğinde yeni müziği yükle
  useEffect(() => {
    const currentTime = audioRef.current?.currentTime || 0;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(musicTracks[currentTrackIndex].path);
    audioRef.current.volume = volume;
    audioRef.current.loop = false;

    const handleEnded = () => {
      setCurrentTrackIndex((prev) => (prev + 1) % musicTracks.length);
    };

    audioRef.current.addEventListener("ended", handleEnded);

    if (isMusicPlaying) {
      audioRef.current.play();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.pause();
      }
    };
  }, [currentTrackIndex]);

  // Play/Pause kontrolü
  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  const handlePrevTrack = () => {
    setIsMusicPlaying(true);
    setCurrentTrackIndex((prev) => (prev - 1 + musicTracks.length) % musicTracks.length);
  };

  const handleNextTrack = () => {
    setIsMusicPlaying(true);
    setCurrentTrackIndex((prev) => (prev + 1) % musicTracks.length);
  };

  return (
    <div className=" z-50 bg-white/90 backdrop-blur-sm p-4 rounded-t-3xl justify-end border-b border-gray-200 items-center gap-4 transition-all duration-300 hover:bg-white group hidden md:flex">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon-sm" onClick={handlePrevTrack}>
          <ForwardIcon className="h-4 w-4 rotate-180" />
        </Button>

        <Button
          variant={isMusicPlaying ? "default" : "outline"}
          size="icon-sm"
          onClick={() => setIsMusicPlaying(!isMusicPlaying)}
        >
          {isMusicPlaying ? (
            <SpeakerWaveIcon className="h-5 w-5" />
          ) : (
            <SpeakerXMarkIcon className="h-5 w-5" />
          )}
        </Button>

        <Button variant="outline" size="icon-sm" onClick={handleNextTrack}>
          <ForwardIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col min-w-[200px]">
        <span className="text-sm font-medium text-gray-900">
          {musicTracks[currentTrackIndex].name}
        </span>
        <span className="text-xs text-gray-500">
          Track {currentTrackIndex + 1}/{musicTracks.length}
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => {
          const newVolume = parseFloat(e.target.value);
          setVolume(newVolume);
        }}
        className="w-24 accent-brand-primary-700"
      />
    </div>
  );
};

/** -------------------------
 * Step1 Component
 * --------------------------
 * Soru dizisini yönetir; aktif soruyu, listeyi, ekleme/silme,
 * form validasyonu vb. içerir.
 */
export const Step1 = ({ onNext }: Step1Props) => {
  const {
    control,
    formState: { errors },
    trigger,
    watch,
  } = useStep1Form();

  // questions field array
  const {
    fields,
    insert,
    remove: removeQuestion,
    move,
  } = useFieldArray({
    control,
    name: "questions",
  });

  // Hangi soru aktif (gösterilen)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const questions = watch("questions");

  // Yeni eklenen soruyu 2 saniye highlight etmek
  const [recentlyAddedIndex, setRecentlyAddedIndex] = useState<number | null>(null);

  // Refs for auto-scroll
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // 2 sn sonra highlight iptal
  useEffect(() => {
    if (recentlyAddedIndex !== null) {
      const timer = setTimeout(() => setRecentlyAddedIndex(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentlyAddedIndex]);

  // remove question + aktif index güncelle
  const remove = (index: number) => {
    removeQuestion(index);

    // Düzeltilmiş aktif index güncelleme mantığı
    setActiveQuestionIndex((prev) => {
      const newLength = fields.length - 1; // Silindikten sonraki yeni uzunluk

      // Eğer silinen index aktif indexten küçükse, bir öncekine geç
      if (prev > index) {
        return Math.min(prev - 1, newLength - 1);
      }
      // Eğer aktif index silinen indexse veya sonuncusuysa, yeni son indexi al
      return Math.min(prev, newLength - 1);
    });
  };

  // Aktif soru görünsün
  useEffect(() => {
    if (questions.length > 0 && questionRefs.current[activeQuestionIndex]) {
      questionRefs.current[activeQuestionIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeQuestionIndex, questions.length]);

  // "Next" => validasyon
  const handleNext = async () => {
    const isValid = await trigger();
    if (!isValid) {
      const questionsWithErrors = errors.questions ? Object.keys(errors.questions).map(Number) : [];
      toast(
        `Please complete these questions:\n\n${questionsWithErrors.map((q) => q + 1).join(", ")}`,
        { duration: 9000 }
      );
      return;
    }
    onNext();
  };

  // Kaç tane tamamlandı?
  const completedCount = questions.filter((q) => q.question && q.correctAnswer).length;
  const totalCount = fields.length;

  const pointerSensor = useSensor(PointerSensor, {
    // mesafeyi 10 px gibi bir değere ayarlarsanız,
    // kullanıcı 10 px sürüklemeden "drag" başlamaz
    activationConstraint: {
      distance: 10,
    },
  });

  // DND sensors
  const sensors = useSensors(
    pointerSensor,
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  // Sürükle-bırak işlemi tamamlandığında
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // "active" veya "over" yoksa reorder yapma
    if (!active || !over || active.id === over.id) return;

    // Soruyu gerçekten sürüklediysek reorder
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex !== newIndex) {
      move(oldIndex, newIndex);
      setActiveQuestionIndex(newIndex);
    }
  };

  // Aktif soru
  const activeQuestion = fields[activeQuestionIndex];

  // Step1 bileşeni içinde, remove fonksiyonunun üstüne ekleyin:
  const duplicate = (index: number) => {
    // Seçili soruyu kopyala
    const questionToDuplicate = questions[index];

    // Yeni bir kopya oluştur (deep clone)
    const duplicatedQuestion = JSON.parse(JSON.stringify(questionToDuplicate));

    // Kopyayı hemen sonraki indexe ekle
    insert(index + 1, duplicatedQuestion);

    // Yeni eklenen soruyu aktif yap
    setActiveQuestionIndex(index + 1);

    // Highlight efekti
    setRecentlyAddedIndex(index + 1);

    // Başarılı mesajı
    toast.success("Question duplicated successfully!");
  };

  return (
    <Card className="flex-1 flex flex-col overflow-y-auto bg-brand-secondary-50">
      <MusicControls /> {/* Yeni müzik kontrolleri */}
      {/* ------------ CARD HEADER ------------ */}
      <CardHeader>
        {/* Sol buton (dummy) */}
        <Button
          onClick={() => {}}
          variant="outline"
          className="hidden md:block items-center justify-center stroke-current text-3xl align-middle cursor-pointer bg-brand-secondary-50 text-brand-primary-900 hover:bg-brand-secondary-50 hover:cursor-default"
          size="icon"
          pill
        >
          <span className="text-2xl">💜</span>
        </Button>

        <CardHeaderContent>
          <CardTitle>Let's create your questions!</CardTitle>
        </CardHeaderContent>

        {/* Tamamlama göstergesi */}
        <div className="flex flex-col items-end gap-1 mr-4">
          <p className="text-sm text-greyscale-light-600 hidden md:block">
            {completedCount} / {totalCount} completed
          </p>
          <div className="w-32 h-2 bg-greyscale-light-300 rounded-full overflow-hidden hidden md:block">
            <div
              className="bg-brand-primary-700 h-full transition-all duration-300"
              style={{
                width: `${(completedCount / Math.max(1, totalCount)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* ESKİ MÜZİK BUTONUNU KALDIR */}
        <div className="flex items-center gap-2">
          <SaveAsDraftButton />
          <Button size="icon" onClick={handleNext} pill>
            <ArrowRightIcon className="size-6" />
          </Button>
        </div>
      </CardHeader>
      {/* ------------ CARD CONTENT ------------ */}
      <CardContent className="flex overflow-y-auto flex-1 gap-5 flex-col lg:flex-row relative p-5">
        {/* Soru Listesi (Sol tarafta) */}
        <Card className="border shadow-sm w-full lg:max-w-[280px] sticky bottom-0 md:top-0">
          <CardHeader className="px-4 py-3 bg-white border-b-2">
            <CardTitle className="text-lg">Question List</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col flex-1 overflow-y-auto mb-4 lg:max-h-full">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={fields} strategy={verticalListSortingStrategy}>
                <div className="flex-1 flex flex-row lg:flex-col gap-1 mt-4 overflow-y-auto">
                  {fields.map((field, index) => (
                    // Her soru için unique key kullan
                    <div
                      key={field.id}
                      className="relative w-full border-b border-brand-secondary-100 last:border-none transition-all duration-200 hover:scale-[1.005] hover:shadow-sm"
                      ref={(el) => {
                        if (el) questionRefs.current[index] = el;
                      }}
                    >
                      <SortableQuestionListItem
                        onClick={() => setActiveQuestionIndex(index)}
                        id={field.id}
                        index={index}
                        isActive={activeQuestionIndex === index}
                        onRemove={fields.length > 1 ? remove : undefined}
                        onDuplicate={() => duplicate(index)}
                        isIncomplete={errors.questions && !!errors.questions[index]}
                        questionText={questions[index]?.question || `NO CONTENT`}
                        className="flex-1 transition-transform duration-200 hover:-translate-y-0.5 animate-in slide-in-from-bottom-3"
                      />

                      {recentlyAddedIndex === index && (
                        <div className="absolute -top-4 left-0 bg-green-100 text-green-800 text-xs py-1 px-2 rounded shadow animate-zoom-in">
                          ✨ New question added!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
          <CardFooter>
            <FormItem>
              <Button
                variant="outline"
                size="default"
                icon
                onClick={() => {
                  const newIndex = activeQuestionIndex + 1;
                  insert(newIndex, {
                    question: "",
                    correctAnswer: "",
                    answers: [{ answer: "" }, { answer: "" }],
                    questionType: "mc",
                  });
                  setActiveQuestionIndex(newIndex);
                  setRecentlyAddedIndex(newIndex);
                }}
                className="hover:scale-105 transition-transform duration-200 active:scale-95 animate-in fade-in-50"
              >
                Add question
                <PlusIcon className="h-5 w-5 stroke-current animate-pulse" />
              </Button>
              <FormMessage />
            </FormItem>
          </CardFooter>
        </Card>

        {/* Aktif Soru Alanı (Sol tarafta) */}
        <div
          className="w-full flex flex-col bg-white flex-1 gap-5 p-5 border border-greyscale-light-200 rounded-3xl shadow-sm overflow-y-auto"
          key={fields[activeQuestionIndex]?.id}
        >
          {/* Key olarak field.id kullanılabilir, eğer _.id vs. destructure edilmişse */}
          <div className="w-full flex flex-col flex-1 md:max-w-full gap-4">
            <div className="flex flex-col gap-5 flex-1">
              {/* Soru metni (Markdown) */}
              <FormField
                control={control}
                name={`questions.${activeQuestionIndex}.question`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Enter the question below. You can use the markdown editor to customize it ☺︎
                    </FormLabel>
                    <FormControl>
                      <div className="border border-greyscale-light-200 rounded-2xl min-h-[20rem] max-h-[68rem] bg-base-white resize-y overflow-y-auto ring-0 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary-800">
                        <MarkdownEditor
                          className="mdxeditor w-full h-full"
                          markdown={field.value}
                          onChange={field.onChange}
                          contentEditableClassName="contentEditable"
                          placeholder="E.g. What is the capital of France?"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cevaplar */}
              <Answers index={activeQuestionIndex} />
            </div>
          </div>
        </div>

        <Card className="flex flex-col bg-white rounded-3xl border border-greyscale-light-200">
          <CardHeader className="px-4 py-3 bg-white border-b-2">
            <CardTitle className="text-lg">Question settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {/* questionType seçimi */}
              <FormField
                control={control}
                name={`questions.${activeQuestionIndex}.questionType`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col">
                      <FormLabel className="min-w-[10rem] flex items-center gap-2 text-base font-semibold text-brand-primary-900">
                        Question type
                      </FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full sm:min-w-[12rem]">
                            <SelectValue placeholder="Select a question type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mc">Multiple choice</SelectItem>
                            <SelectItem value="tf">True/False</SelectItem>
                            <SelectItem value="ord" disabled>
                              Ordering (soon)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Points seçimi için FormField'ı şu şekilde güncelleyin */}
              <FormField
                disabled={true}
                control={control}
                name={`questions.${activeQuestionIndex}.points`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col">
                      <FormLabel className="min-w-[10rem] items-center text-base font-medium text-greyscale-light-500 flex gap-2">
                        Difficulty
                        <span className="text-xs bg-greyscale-light-100 text-greyscale-light-500 px-2 py-0.5 rounded-full">
                          Coming soon
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value} disabled>
                          <SelectTrigger className="w-full sm:min-w-[12rem] cursor-not-allowed opacity-50">
                            <SelectValue placeholder="Select a point" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="very_hard">Very hard (3x)</SelectItem>
                            <SelectItem value="hard">Hard (2x)</SelectItem>
                            <SelectItem value="medium">Medium (1x)</SelectItem>
                            <SelectItem value="easy">Easy (0.5x)</SelectItem>
                            <SelectItem value="no_points">No points ☹️</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

// Mevcut QuestionListItem bileşenini Sortable versiyonu ile değiştirelim
const SortableQuestionListItem = ({
  id,
  index,
  onDuplicate,
  ...props
}: Parameters<typeof QuestionListItem>[0] & {
  id: string;
  onDuplicate?: (index: number) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <QuestionListItem
        index={index}
        {...props}
        dragHandle={
          <div className="mr-2 p-1 hover:bg-gray-100 rounded-lg">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400"
            >
              <path
                d="M5 3.5C5 4.32843 4.32843 5 3.5 5C2.67157 5 2 4.32843 2 3.5C2 2.67157 2.67157 2 3.5 2C4.32843 2 5 2.67157 5 3.5Z"
                fill="currentColor"
              />
              <path
                d="M5 10.5C5 11.3284 4.32843 12 3.5 12C2.67157 12 2 11.3284 2 10.5C2 9.67157 2.67157 9 3.5 9C4.32843 9 5 9.67157 5 10.5Z"
                fill="currentColor"
              />
              <path
                d="M8.5 5C9.32843 5 10 4.32843 10 3.5C10 2.67157 9.32843 2 8.5 2C7.67157 2 7 2.67157 7 3.5C7 4.32843 7.67157 5 8.5 5Z"
                fill="currentColor"
              />
              <path
                d="M10 10.5C10 11.3284 9.32843 12 8.5 12C7.67157 12 7 11.3284 7 10.5C7 9.67157 7.67157 9 8.5 9C9.32843 9 10 9.67157 10 10.5Z"
                fill="currentColor"
              />
            </svg>
          </div>
        }
        onDuplicate={onDuplicate}
      />
    </div>
  );
};
