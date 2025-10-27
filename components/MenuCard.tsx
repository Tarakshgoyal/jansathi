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
}

export const MenuCard: React.FC<MenuCardProps> = ({
  title,
  description,
  icon: IconComponent,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="w-full bg-white rounded-xl p-6 shadow-md active:opacity-80 mb-4 border border-gray-200"
    >
      <VStack space="md" className="items-start">
        <Icon as={IconComponent} size="xl" className="text-primary-600" />
        <VStack space="xs">
          <Heading size="lg" className="text-gray-900 font-semibold">
            {title}
          </Heading>
          <Text size="sm" className="text-gray-600">
            {description}
          </Text>
        </VStack>
      </VStack>
    </Pressable>
  );
};
