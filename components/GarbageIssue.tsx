import { useLanguage } from "@/contexts/LanguageContext";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import LocationMap from "./LocationMap";
import PhotoCapture from "./PhotoCapture";
import { Heading } from "./ui/heading";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

interface GarbageIssueProps {
  // Props will be added later
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const GarbageIssue: React.FC<GarbageIssueProps> = () => {
  const { getText, t } = useLanguage();
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const handleLocationChange = (coords: LocationCoords) => {
    setLocation(coords);
    console.log("Garbage Issue Location:", coords);
  };

  const handlePhotosChange = (newPhotos: string[]) => {
    setPhotos(newPhotos);
    console.log("Garbage Issue Photos:", newPhotos);
  };

  return (
    <ScrollView className="flex-1 bg-background-0">
      <VStack className="flex-1 p-4" space="lg">
        <VStack space="sm">
          <Heading size="xl" className="text-typography-900">
            {getText(t.issueTypes.kachraSamasya)}
          </Heading>
          <Text size="sm" className="text-typography-500">
            Report garbage-related issues in your area
          </Text>
        </VStack>

        {/* Map Component */}
        <VStack space="sm">
          <Text size="md" className="text-typography-700 font-medium">
            Location
          </Text>
          <LocationMap height={300} onLocationChange={handleLocationChange} />
        </VStack>

        {/* Photo Capture Component */}
        <PhotoCapture maxPhotos={3} onPhotosChange={handlePhotosChange} />

        {/* Garbage issue form will be added here */}
        <VStack space="sm">
          <Text size="sm" className="text-typography-500 text-center py-8">
            Form fields coming soon...
          </Text>
        </VStack>
      </VStack>
    </ScrollView>
  );
};

export default GarbageIssue;
