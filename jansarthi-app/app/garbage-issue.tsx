import BackHeader from "@/components/BackHeader";
import GarbageIssue from "@/components/GarbageIssue";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GarbageIssuePage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={{ flex: 1 }} className="bg-background-0">
        <BackHeader title="Garbage Issue" />
        <GarbageIssue />
      </SafeAreaView>
    </>
  );
}
