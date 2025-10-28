import WaterIssue from "@/components/WaterIssue";
import { Stack } from "expo-router";

export default function WaterIssuePage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Water Issue",
          headerShown: true,
        }}
      />
      <WaterIssue />
    </>
  );
}
