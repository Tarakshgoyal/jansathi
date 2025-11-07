import BackHeader from "@/components/BackHeader";
import ElectricityIssue from "@/components/ElectricityIssue";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ElectricityIssuePage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={{ flex: 1 }} className="bg-background-0">
        <BackHeader title="Electricity Issue" />
        <ElectricityIssue />
      </SafeAreaView>
    </>
  );
}
