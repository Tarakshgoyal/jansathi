import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Picker } from "@react-native-picker/picker";
import { LanguagesIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, TouchableOpacity, View } from "react-native";

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t, getText } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: "en" | "hi") => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <View className="relative z-50">
      <Button
        variant="outline"
        size="sm"
        className="bg-background-0 border-outline-200 min-w-[100px] rounded-full border"
        onPress={() => setIsOpen(!isOpen)}
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

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-typography-900/20"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className="flex-1 items-end justify-start pt-20 px-4">
            <View className="bg-background-0 rounded-xl shadow-soft-2 border border-outline-200 overflow-hidden p-2">
              {/* Picker from @react-native-picker/picker for selecting language */}
              <Picker
                selectedValue={language}
                onValueChange={(itemValue) =>
                  handleLanguageChange(itemValue as "en" | "hi")
                }
                accessibilityLabel={
                  getText(t.language.selectLanguage) || "Select language"
                }
                style={{
                  minWidth: 140,
                }}
                mode="dropdown"
              >
                <Picker.Item label={getText(t.language.english)} value="en" />
                <Picker.Item label={getText(t.language.hindi)} value="hi" />
              </Picker>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
