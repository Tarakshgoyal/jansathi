import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { Icon } from "./ui/icon";

interface QuickActionItemProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}

export const QuickActionItem = ({
  icon: IconComponent,
  label,
  onPress,
}: QuickActionItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center py-4 active:opacity-70"
    >
      <VStack space="sm" className="items-center">
        <View className="rounded-full p-2 bg-brand-200">
          <Icon size="xl" className="text-brand-500" as={IconComponent} />
        </View>
        <Text size="xs" className="text-typography-700 text-center">
          {label}
        </Text>
      </VStack>
    </Pressable>
  );
};
