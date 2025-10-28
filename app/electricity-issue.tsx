import ElectricityIssue from "@/components/ElectricityIssue";
import { Stack } from "expo-router";

export default function ElectricityIssuePage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Electricity Issue",
          headerShown: true,
        }}
      />
      <ElectricityIssue />
    </>
  );
}
