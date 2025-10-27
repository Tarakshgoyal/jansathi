import { Header } from "@/components/Header";
import { MenuCard } from "@/components/MenuCard";
import { VStack } from "@/components/ui/vstack";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "expo-router";
import { Eye, Map, Plus } from "lucide-react-native";
import { ScrollView, View } from "react-native";

export const MainMenu = () => {
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
    <ScrollView className="flex-1">
      {/* Header with Brand Background */}
      <Header />

      {/* Content Area */}
      <View className="flex-1 bg-background-0 rounded-t-3xl -mt-4 pt-6 px-6 pb-10">
        {/* Menu Cards */}
        <VStack space="lg" className="mt-2">
          <MenuCard
            title={getText(t.menu.createReport)}
            description={getText(t.menu.createReportDesc)}
            icon={Plus}
            onPress={handleCreateReport}
            variant="primary"
          />

          <MenuCard
            title={getText(t.menu.viewReports)}
            description={getText(t.menu.viewReportsDesc)}
            icon={Eye}
            onPress={handleViewReports}
            variant="secondary"
          />

          <MenuCard
            title={getText(t.menu.viewMap)}
            description={getText(t.menu.viewMapDesc)}
            icon={Map}
            onPress={handleViewMap}
            variant="secondary"
          />
        </VStack>
      </View>
    </ScrollView>
  );
};
