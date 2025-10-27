import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MenuCard } from "@/components/MenuCard";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "expo-router";
import { Eye, Map, Plus } from "lucide-react-native";
import { SafeAreaView, ScrollView, View } from "react-native";

export default function Index() {
  const { t, getText } = useLanguage();
  const router = useRouter();

  const handleCreateReport = () => {
    // Navigate to create report screen
    // router.push('/create-report');
    console.log("Navigate to create report");
  };

  const handleViewReports = () => {
    // Navigate to my reports screen
    // router.push('/my-reports');
    console.log("Navigate to my reports");
  };

  const handleViewMap = () => {
    // Navigate to map screen
    // router.push('/map');
    console.log("Navigate to map");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-50">
      <ScrollView className="flex-1">
        <View className="flex-1 px-4 pt-6 pb-8">
          {/* Header with Language Switcher */}
          <HStack className="justify-between items-start mb-8">
            <VStack space="xs" className="flex-1">
              <Heading size="2xl" className="text-gray-900 font-bold">
                {getText(t.menu.welcome)}
              </Heading>
              <Text size="sm" className="text-gray-600">
                {getText(t.menu.subtitle)}
              </Text>
            </VStack>
            <View className="ml-4">
              <LanguageSwitcher />
            </View>
          </HStack>

          {/* Menu Cards */}
          <VStack space="md" className="mt-4">
            <MenuCard
              title={getText(t.menu.createReport)}
              description={getText(t.menu.createReportDesc)}
              icon={Plus}
              onPress={handleCreateReport}
            />

            <MenuCard
              title={getText(t.menu.viewReports)}
              description={getText(t.menu.viewReportsDesc)}
              icon={Eye}
              onPress={handleViewReports}
            />

            <MenuCard
              title={getText(t.menu.viewMap)}
              description={getText(t.menu.viewMapDesc)}
              icon={Map}
              onPress={handleViewMap}
            />
          </VStack>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
