import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bell, User } from "lucide-react-native";
import { Pressable, View } from "react-native";

export const Header = () => {
  const { t, getText } = useLanguage();

  return (
    <View className="bg-brand-500 px-6 pt-20 pb-8">
      <HStack className="justify-between items-start mb-6">
        <VStack space="xs" className="flex-1">
          <Heading size="2xl" className="text-typography-white font-bold">
            {getText(t.appName)}
          </Heading>
          <Text size="sm" className="text-typography-white/90 mt-1">
            {getText(t.menu.subtitle)}
          </Text>
        </VStack>
        <HStack className="ml-4 items-center" space="sm">
          <LanguageSwitcher />
          <Pressable className="border rounded-full p-3 bg-primary-0">
            <Bell />
          </Pressable>
          <Pressable className="border rounded-full p-3 bg-primary-0">
            <User />
          </Pressable>
        </HStack>
      </HStack>
    </View>
  );
};
