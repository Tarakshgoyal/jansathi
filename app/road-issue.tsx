import RoadIssue from "@/components/RoadIssue";
import { Stack } from "expo-router";

export default function RoadIssuePage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Road Issue",
          headerShown: true,
        }}
      />
      <RoadIssue />
    </>
  );
}
