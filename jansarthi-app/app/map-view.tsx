import BackHeader from "@/components/BackHeader";
import IssuesMap from "@/components/IssuesMap";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MapViewPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={{ flex: 1 }} className="bg-background-0">
        <BackHeader title="Issues Map" />
        <IssuesMap />
      </SafeAreaView>
    </>
  );
}
