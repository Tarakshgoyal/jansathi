import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguagesIcon } from "lucide-react-native";
import React from "react";
import { View } from "react-native";

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t, getText } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  return (
    <View className="relative z-50">
      <Button
        variant="outline"
        size="sm"
        className="bg-background-0 border-outline-200 min-w-[100px] rounded-full border"
        onPress={toggleLanguage}
        style={{
          // Ensure minimum touch target size for accessibility (44x44px)
          minHeight: 44,
          minWidth: 100,
        }}
      >
        <ButtonText className="text-typography-900 text-sm font-medium">
          {language === "en"
            ? getText(t.language.english)
            : getText(t.language.hindi)}
        </ButtonText>
        <ButtonIcon
          as={LanguagesIcon}
          className="ml-1 w-4 h-4 text-typography-900"
        />
      </Button>
    </View>
  );
};
