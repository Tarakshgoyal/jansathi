import BackHeader from "@/components/BackHeader";
import Profile from "@/components/Profile";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfilePage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={{ flex: 1 }} className="bg-background-0">
        <BackHeader title="Profile" />
        <Profile />
      </SafeAreaView>
    </>
  );
}
