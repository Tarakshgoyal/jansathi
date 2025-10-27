import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { LucideIcon } from "lucide-react-native";

interface QuickActionItemProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}

export const QuickActionItem = ({
  icon: Icon,
  label,
  onPress,
}: QuickActionItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center py-4 active:opacity-70"
    >
      <VStack space="sm" className="items-center">
        <Icon size={28} className="text-brand-500" />
        <Text size="xs" className="text-typography-700 text-center">
          {label}
        </Text>
      </VStack>
    </Pressable>
  );
};
