// import React from "react";

// import {
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { useStep1Form } from "./step1-schema";
// import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
// import { Input } from "../ui/input";

// export const RewardDistributionForm = () => {
//   const form = useStep1Form();
//   return (
//     <>
//       <FormField
//         control={form.control}
//         name="distributionWay"
//         render={({ field }) => (
//           <FormItem className="space-y-3">
//             <FormLabel>Distrubition way</FormLabel>
//             <FormControl>
//               <RadioGroup
//                 onValueChange={field.onChange}
//                 defaultValue={field.value}
//                 className="flex flex-col space-y-1"
//               >
//                 <FormItem className="flex items-center space-x-3 space-y-0">
//                   <FormControl>
//                     <RadioGroupItem value="manual" />
//                   </FormControl>
//                   <FormLabel className="font-normal">Manual</FormLabel>
//                 </FormItem>
//                 <FormItem className="flex items-center space-x-3 space-y-0">
//                   <FormControl>
//                     <RadioGroupItem value="auto" />
//                   </FormControl>
//                   <FormLabel className="font-normal">Auto</FormLabel>
//                 </FormItem>
//               </RadioGroup>
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       <div className="flex gap-4 justify-between flex-col sm:flex-row">
//         <FormField
//           control={form.control}
//           name="rewardType"
//           render={({ field }) => (
//             <FormItem className="flex-1">
//               <FormLabel>Reward type (only MINA token avaliable now)</FormLabel>
//               <Select onValueChange={field.onChange} defaultValue={field.value}>
//                 <FormControl>
//                   <SelectTrigger className="box-border">
//                     <SelectValue placeholder="Select reward type" />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   <SelectItem value="mina">MINA</SelectItem>
//                 </SelectContent>
//               </Select>
//               <FormDescription>
//                 Select a reward type that motivates your participants.
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />{" "}
//         <FormField
//           control={form.control}
//           name="minimumPassingScore"
//           render={({ field: { onChange, ...field } }) => (
//             <FormItem className="flex-1">
//               <FormLabel>Minimum passing score</FormLabel>
//               <FormControl>
//                 <Input
//                   placeholder="Enter minimum passing score"
//                   type="number"
//                   min={0}
//                   max={100}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     onChange(parseInt(value, 10));
//                   }}
//                   {...field}
//                 />
//               </FormControl>
//               <FormDescription>Enter the total reward amount for distrubition.</FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//       </div>

//       <div className="flex gap-4 justify-between flex-col sm:flex-row">
//         <FormField
//           control={form.control}
//           name="totalRewardPool"
//           render={({ field: { onChange, ...field } }) => (
//             <FormItem className="flex-1">
//               <FormLabel>Total reward pool</FormLabel>
//               <FormControl>
//                 <Input
//                   placeholder="Enter total reward pool"
//                   type="number"
//                   min={0}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     onChange(parseInt(value, 10));
//                   }}
//                   {...field}
//                 />
//               </FormControl>
//               <FormDescription>Enter the total reward amount for distrubition.</FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="rewardAmount"
//           render={({ field: { onChange, ...field } }) => (
//             <FormItem className="flex-1">
//               <FormLabel>Reward amount</FormLabel>
//               <FormControl>
//                 <Input
//                   placeholder="Enter reward amount"
//                   type="number"
//                   min={0}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     onChange(parseInt(value, 10));
//                   }}
//                   {...field}
//                 />
//               </FormControl>
//               <FormDescription>Enter the total reward amount for distrubition.</FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//       </div>
//     </>
//   );
// };
