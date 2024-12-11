import React from "react";

import { DurationPicker } from "./duration-picker";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeaderContent,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useStep2Form } from "./step2-schema";
import { Textarea } from "@/components/ui/textarea";
import { ControlledDateTimePicker } from "./controlled-date-time-picker";
import { PublishButton } from "./publish-button";
import { RewardDistributionForm } from "./reward-distrubition";
import { Switch } from "../ui/switch";
import "../../styles/globals.css";
import { cn } from "@/lib/utils";

interface Step2Props {
  onBack: () => void;
}

export const Step2 = ({ onBack }: Step2Props) => {
  const form = useStep2Form();
  const rewardDistribution = form.watch("rewardDistribution");

  return (
    <Card className="bg-base-white rounded-2xl md:rounded-3xl flex-1 flex flex-col overflow-y-auto">
      <CardHeader>
        <Button size="icon" pill variant="default" onClick={onBack}>
          <ArrowLeftIcon className="size-5 shrink-0" />
        </Button>
        <CardHeaderContent>
          <CardTitle>Complete your quiz details</CardTitle>
          <CardDescription>
            Enter quiz details before creating questions, this will give participants information
            about the quiz.
          </CardDescription>
        </CardHeaderContent>
        <PublishButton />
      </CardHeader>

      <CardContent className="w-full px-5 py-5 space-y-5 flex-1 overflow-y-auto gap-8 flex-col relative mb-5">
      <FormField
      control={form.control}
      name="title"
      render={({ field }) => {
        const characterCount = field.value?.length || 0;
        const isOverLimit = characterCount > 200;

         return (
      <FormItem>
        <p className="text-lg font-bold text-brand-primary-950 mb-2">1. Title</p>
        <FormLabel>Quiz name</FormLabel>
        <FormControl>
          <div className="relative">
            <Input
              maxLength={120}
              placeholder="Give your quiz a clear, engaging name.."
              className={cn(
                "rounded-2xl border",
                isOverLimit
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-greyscale-light-300"
              )}
              {...field}
            />
            <div
              className={`text-sm absolute right-3 top-3 ${
                isOverLimit ? "text-red-500" : "text-greyscale-light-500"
              }`}
            >
              {`${characterCount}/120`}
            </div>
          </div>
        </FormControl>
        <FormDescription>
          A descriptive name will give participants an indication of what the quiz is about.
        </FormDescription>
        <FormMessage />
      </FormItem>
    );
  }}
/>


        <div className="flex flex-col sm:flex-row">
          <div className="flex-1 gap-4">
            <p className="text-lg font-bold text-brand-primary-950 mb-2">2. Live quiz</p>
            <div className="flex gap-4 justify-between flex-col sm:flex-row">
              <ControlledDateTimePicker
                control={form.control}
                name="startDate"
                label="When should this quiz start?"
                description="Choose a date and time for the quiz to begin."
                placeholder="Select date and time" 
                className="flex-1"
                calendarProps={{
                disabled: { before: new Date(Date.now() + 5 * 60 * 1000) },
                }}
               />
              <DurationPicker 
                className="flex-1"
                name="duration"
                label="How long should this quiz take? (in minutes)"
                control={form.control}
                description="Once the time is up, the quiz will automatically end."
                placeholder="Select duration" 
                />
              </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            
            <FormItem>
            <p className="text-lg font-bold text-brand-primary-950 mb-2">3. Description</p>
            <FormLabel>Quiz overview for participants</FormLabel>
            <FormControl>
              <div className="relative">
                <Textarea
                  maxLength={360}
                  className={cn(
                    "rounded-2xl pl-4 pr-24 pt-3 min-h-[160px]",
                    field.value?.length > 360 ? "border-red-500 focus:ring-red-500" : "border-greyscale-light-300"
                  )}
                  placeholder="Share key details about the quiz.."
                  {...field}
                />
                <div
                  className={`text-sm absolute right-3 top-3 ${
                    field.value?.length > 360 ? "text-red-500" : "text-greyscale-light-500"
                  }`}
                >
                  {`${field.value?.length || 0}/360`}
                </div>
              </div>
            </FormControl>
            <FormDescription>
              An engaging and clear description ensures participants understand the purpose and format of the quiz.
            </FormDescription>
            {field.value?.length > 360 && (
              <p className="text-red-500 text-sm mt-1">
                The description exceeds the maximum allowed 360 characters.
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
        />
        <FormField
          control={form.control}
          name="rewardDistribution"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-end">
              <div className="space-y-0.5">
                <FormLabel className="text-base pe-4">Reward distrubition</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {rewardDistribution && <RewardDistributionForm />}
      </CardContent>
    </Card>
  );
};
