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
      <div className="gap-4 justify-between w-full sm:grid-cols-2 bg-white p-6 rounded-3xl border border-greyscale-light-200 grid grid-cols-1">
        <FormField
          name="rewardType"
          render={({ field: { onChange, ...field } }) => (
            <FormItem className="flex-1 space-y-1">
              <FormLabel className="font-bold text-sm">Reward Type</FormLabel>
              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select reward type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monetary (MINA Token)">
                    Monetary Reward (MINA Token)
                  </SelectItem>
                  <SelectItem disabled value="NFT (Coming soon)">
                    NFT Reward (Coming Soon)
                  </SelectItem>
                  <SelectItem disabled value="Custom (Coming soon)">
                    Custom Reward (Coming Soon)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-greyscale-dark-300">
                Select the type of reward to distribute
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passingScore"
          render={({ field: { onChange, ...field } }) => (
            <FormItem className="flex-1 space-y-1">
              <FormLabel className="font-bold text-sm">Minimum Passing Score</FormLabel>
              <FormControl>
                <Input
                  className="h-12"
                  placeholder="Enter passing score (0-100)"
                  type="number"
                  min={0}
                  max={100}
                  maxLength={3}
                  onChange={(e) => {
                    const value = e.target.value;
                    onChange(parseInt(value, 10));
                  }}
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-greyscale-dark-300">
                Minimum valid score (0-100 range)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="totalRewardPoolAmount"
          render={({ field }) => (
            <FormItem className="flex-1 space-y-1">
              <FormLabel className="font-bold text-sm">Total Reward Pool</FormLabel>
              <FormControl>
                <Input placeholder="Enter total reward pool" type="number" {...field}  
                  onChange={(e) => {
                    const value = e.target.value.replace(",", ".");
                    field.onChange(Number(value));
                  }} />
              </FormControl>
              <FormDescription className="text-greyscale-dark-300">
                Enter total reward amount to distribute
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rewardPerWinner"
          render={({ field }) => (
            <FormItem className="flex-1 space-y-1">
              <FormLabel className="font-bold text-sm">Reward Amount</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter reward amount"
                  type="number"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.replace(",", ".");
                    field.onChange(Number(value));
                  }} />
              </FormControl>
              <FormDescription className="text-greyscale-dark-300">
                Enter reward amount
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
