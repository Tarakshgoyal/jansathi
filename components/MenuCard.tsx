import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import React from "react";
import { View } from "react-native";
import { HStack } from "./ui/hstack";

interface MenuCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
  variant?: "primary" | "secondary";
}

export const MenuCard: React.FC<MenuCardProps> = ({
  title,
  description,
  icon: IconComponent,
  onPress,
  variant = "secondary",
}) => {
  const iconColor = variant === "primary" ? "text-brand-500" : "text-info-500";
  const borderColor =
    variant === "primary" ? "border-brand-200" : "border-outline-100";

  return (
    <Pressable
      onPress={onPress}
      className={`w-full bg-background-0 rounded-2xl p-6 shadow-soft-2 active:opacity-80 border-brand-200 border`}
      style={{
        // Ensure minimum touch target size for accessibility (44x44px)
        minHeight: 44,
      }}
    >
      <HStack space="sm" className="items-start w-full gap-4">
        <View className="rounded-full bg-background-50 p-4">
          <Icon
            as={IconComponent}
            size="xl"
            className={iconColor}
            style={{ width: 32, height: 32 }}
          />
        </View>
        <VStack space="xs" className="flex-1">
          <Heading size="lg" className="text-typography-900 font-semibold">
            {title}
          </Heading>
          <Text size="sm" className="text-secondary-500 leading-5">
            {description}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  );
};
