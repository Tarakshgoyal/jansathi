import GarbageIssue from "@/components/GarbageIssue";
import { Stack } from "expo-router";

export default function GarbageIssuePage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Garbage Issue",
          headerShown: true,
        }}
      />
      <GarbageIssue />
    </>
  );
}
