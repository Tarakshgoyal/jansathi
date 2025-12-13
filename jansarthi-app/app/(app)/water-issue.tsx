import BackHeader from "@/components/BackHeader";
import WaterIssue from "@/components/WaterIssue";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WaterIssuePage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={{ flex: 1 }} className="bg-background-0">
        <BackHeader title="Water Issue" />
        <WaterIssue />
      </SafeAreaView>
    </>
  );
}
