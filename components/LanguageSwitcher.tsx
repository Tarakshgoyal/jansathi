import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronDown } from "lucide-react-native";
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
        className="bg-white min-w-[100px]"
        onPress={() => setIsOpen(!isOpen)}
      >
        <ButtonText className="text-gray-700 text-sm">
          {language === "en"
            ? getText(t.language.english)
            : getText(t.language.hindi)}
        </ButtonText>
        <ButtonIcon as={ChevronDown} className="ml-1 w-4 h-4" />
      </Button>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/20"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className="flex-1 items-end justify-start pt-20 px-4">
            <View className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[140px] overflow-hidden">
              <Pressable
                onPress={() => handleLanguageChange("en")}
                className={`p-4 border-b border-gray-100 ${
                  language === "en" ? "bg-primary-50" : "bg-white"
                } active:bg-gray-100`}
              >
                <Text
                  className={`text-sm ${
                    language === "en"
                      ? "text-primary-600 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {getText(t.language.english)}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleLanguageChange("hi")}
                className={`p-4 ${
                  language === "hi" ? "bg-primary-50" : "bg-white"
                } active:bg-gray-100`}
              >
                <Text
                  className={`text-sm ${
                    language === "hi"
                      ? "text-primary-600 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {getText(t.language.hindi)}
                </Text>
              </Pressable>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
