import React from "react";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useStep2Form } from "./step2-schema";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";

export const RewardDistributionForm = () => {
  const form = useStep2Form();
  return (
    <>
      <FormField
        control={form.control}
        name="minimumPassingScore"
        render={({ field: { onChange, ...field } }) => (
          <FormItem className="flex-1">
            <FormLabel>Minimum passing score</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter minimum passing score"
                type="number"
                min={0}
                max={100}
                onChange={(e) => {
                  const value = e.target.value;
                  onChange(parseInt(value, 10));
                }}
                {...field}
              />
            </FormControl>
            <FormDescription>Enter the total reward amount for distrubition.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex gap-4 justify-between flex-col sm:flex-row">
        <FormField
          control={form.control}
          name="totalRewardPoolAmount"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Total reward pool</FormLabel>
              <FormControl>
                <Input placeholder="Enter total reward pool" type="number" min={0} {...field} />
              </FormControl>
              <FormDescription>Enter the total reward amount for distrubition.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rewardPerWinner"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Reward amount</FormLabel>
              <FormControl>
                <Input placeholder="Enter reward amount" type="number" min={0} {...field} />
              </FormControl>
              <FormDescription>Enter the reward amount per winner.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
