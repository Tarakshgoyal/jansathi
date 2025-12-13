import BackHeader from "@/components/BackHeader";
import MyReports from "@/components/MyReports";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyReportsPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={{ flex: 1 }} className="bg-background-0">
        <BackHeader title="My Reports" />
        <MyReports />
      </SafeAreaView>
    </>
  );
}
