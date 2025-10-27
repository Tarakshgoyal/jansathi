import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import React from "react";

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
      className={`w-full bg-background-0 rounded-2xl p-6 shadow-soft-1 active:opacity-80 border ${borderColor}`}
      style={{
        // Ensure minimum touch target size for accessibility (44x44px)
        minHeight: 44,
      }}
    >
      <VStack space="md" className="items-start">
        <Icon
          as={IconComponent}
          size="xl"
          className={iconColor}
          // Accessible icon size
          style={{ width: 32, height: 32 }}
        />
        <VStack space="xs">
          <Heading size="lg" className="text-typography-900 font-semibold">
            {title}
          </Heading>
          <Text size="sm" className="text-secondary-500 leading-5">
            {description}
          </Text>
        </VStack>
      </VStack>
    </Pressable>
  );
};
