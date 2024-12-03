import React from "react";

import { DurationPicker } from "./duration-picker";
import { Button } from "@/components/ui/button";
import { ArrowRightCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
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
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useStep1Form } from "./step1-schema";
import { Textarea } from "@/components/ui/textarea";
import { ControlledDateTimePicker } from "./controlled-date-time-picker";
import { Switch } from "../ui/switch";
// import { RewardDistributionForm } from "./reward-distrubition";

interface Step1Props {
  onNext: () => void;
}

export const Step1 = ({ onNext }: Step1Props) => {
  const form = useStep1Form();

  // const rewardDistribution = form.watch("rewardDistribution");

  return (
    <Card className="mt-7 rounded-none md:rounded-3xl flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardHeaderContent>
          <CardTitle>Quiz details</CardTitle>
          <CardDescription>
            Enter quiz details before creating questions, this will give participants information
            about the quiz.
          </CardDescription>
        </CardHeaderContent>
        <ArrowRightCircleIcon className="size-7 shrink-0" />
      </CardHeader>

      <CardContent className="max-w-3xl mx-auto space-y-5 flex-1 w-full overflow-y-auto gap-6 flex-col relative mb-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quiz Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter quiz title" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive title will give participants an indication of what the quiz is about.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 justify-between flex-col sm:flex-row">
          <ControlledDateTimePicker
            control={form.control}
            name="startDate"
            label="Start date"
            description="Please select date which you want to start the quiz."
            placeholder="Pick a date"
            className="flex-1"
            calendarProps={{
              disabled: { before: new Date() },
            }}
          />

          <DurationPicker
            className="flex-1"
            name="duration"
            label="Duration"
            control={form.control}
            description="You can add a duration for the quiz."
            placeholder="Select duration"
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quiz information for participants</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter quiz description" {...field} />
              </FormControl>
              <FormDescription>
                A good description will help participants get accurate information about the quiz.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
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
        /> */}

        {/* {rewardDistribution && <RewardDistributionForm />} */}
      </CardContent>
      <CardFooter className="max-w-3xl mx-auto w-full">
        <Button
          pill
          onClick={() => {
            onNext();
          }}
          className="w-full"
        >
          Start Create
          <ArrowRightIcon className="size-6" />
        </Button>
      </CardFooter>
    </Card>
  );
};
