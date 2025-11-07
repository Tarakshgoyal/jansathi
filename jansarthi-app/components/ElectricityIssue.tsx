import { useLanguage } from "@/contexts/LanguageContext";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import LocationMap from "./LocationMap";
import PhotoCapture from "./PhotoCapture";
import { Button, ButtonText } from "./ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "./ui/form-control";
import { Textarea, TextareaInput } from "./ui/textarea";
import { VStack } from "./ui/vstack";

interface ElectricityIssueProps {
  // Props will be added later
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const ElectricityIssue: React.FC<ElectricityIssueProps> = () => {
  const { getText, t } = useLanguage();
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");

  const handleLocationChange = (coords: LocationCoords) => {
    setLocation(coords);
    console.log("Electricity Issue Location:", coords);
  };

  const handlePhotosChange = (newPhotos: string[]) => {
    setPhotos(newPhotos);
    console.log("Electricity Issue Photos:", newPhotos);
  };

  const handleSubmit = () => {
    // TODO: Implement form submission logic
    console.log("Submitting Electricity Issue:", {
      description,
      location,
      photos,
    });
  };

  return (
    <ScrollView className="flex-1 bg-background-50">
      <VStack className="flex-1 p-4" space="2xl">
        {/* Map Component */}
        <VStack space="sm">
          <LocationMap height={300} onLocationChange={handleLocationChange} />
        </VStack>

        {/* Issue Details Form */}
        <VStack space="md">
          {/* Description Field */}
          <FormControl isRequired>
            <FormControlLabel>
              <FormControlLabelText className="text-typography-700 font-bold">
                {getText(t.form.description)}
              </FormControlLabelText>
            </FormControlLabel>
            <Textarea size="md" className="min-h-32 bg-white">
              <TextareaInput
                placeholder={getText(t.form.descriptionPlaceholder)}
                value={description}
                onChangeText={setDescription}
                className="text-typography-900"
                placeholderTextColor="#525252"
              />
            </Textarea>
          </FormControl>
        </VStack>

        {/* Photo Capture Component */}
        <PhotoCapture maxPhotos={3} onPhotosChange={handlePhotosChange} />

        {/* Submit Button */}
        <Button
          action="primary"
          size="lg"
          onPress={handleSubmit}
          className="w-full rounded-md"
        >
          <ButtonText>{getText(t.actions.submit)}</ButtonText>
        </Button>
      </VStack>
    </ScrollView>
  );
};

export default ElectricityIssue;
