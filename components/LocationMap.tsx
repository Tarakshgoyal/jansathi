import {
  Camera,
  MapView,
  PointAnnotation,
  UserLocation,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { translations } from "../config/translations";
import { useLanguage } from "../contexts/LanguageContext";
import { Box } from "./ui/box";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

interface LocationMapProps {
  height?: number;
  onLocationChange?: (location: {
    latitude: number;
    longitude: number;
  }) => void;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

const LocationMap: React.FC<LocationMapProps> = ({
  height = 300,
  onLocationChange,
}) => {
  const { language } = useLanguage();
  const t = translations.map;

  const cameraRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestLocationAccess();
  }, []);

  const requestLocationAccess = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const currentLocation: UserLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(currentLocation);

        // Notify parent component about location
        if (onLocationChange) {
          onLocationChange(currentLocation);
        }
      } else {
        setError(t.permissionDenied[language]);
      }
    } catch (err) {
      console.error("Error getting location:", err);
      setError(t.locationError[language]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box
        className="items-center justify-center bg-background-50"
        style={{ height }}
      >
        <VStack space="md" className="items-center">
          <ActivityIndicator size="large" color="#0066CC" />
          <Text className="text-typography-600">
            {t.loadingLocation[language]}
          </Text>
        </VStack>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box
        className="items-center justify-center bg-background-50 p-4"
        style={{ height }}
      >
        <VStack space="sm" className="items-center">
          <Text className="text-error-600 text-center font-medium">
            {error}
          </Text>
          <Text className="text-typography-500 text-center text-sm">
            {t.enableLocationInstructions[language]}
          </Text>
        </VStack>
      </Box>
    );
  }

  // Show map with user location
  if (userLocation) {
    // OpenStreetMap style configuration
    const mapStyle = {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: "osm",
          type: "raster",
          source: "osm",
        },
      ],
    };

    return (
      <View style={{ height }}>
        <MapView
          style={{ flex: 1 }}
          mapStyle="https://tiles.openfreemap.org/styles/bright"
          logoEnabled={false}
          attributionEnabled={false}
          attributionPosition={{ bottom: 8, left: 8 }}
          compassEnabled={true}
          compassViewPosition={1}
          zoomEnabled={true}
          scrollEnabled={false}
          pitchEnabled={true}
          rotateEnabled={true}
        >
          <Camera
            ref={cameraRef}
            zoomLevel={16}
            centerCoordinate={[userLocation.longitude, userLocation.latitude]}
            animationMode="flyTo"
            animationDuration={1000}
          />

          {/* User location marker */}
          <PointAnnotation
            id="userLocation"
            coordinate={[userLocation.longitude, userLocation.latitude]}
            title={t.yourLocation[language]}
          >
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: "#0066CC",
                borderWidth: 3,
                borderColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 5,
              }}
            />
          </PointAnnotation>

          {/* Show user location with native component */}
          <UserLocation
            visible={true}
            animated={true}
            renderMode="native"
            androidRenderMode="compass"
            showsUserHeadingIndicator={true}
            minDisplacement={10}
          />
        </MapView>
      </View>
    );
  }

  // Fallback
  return (
    <Box
      className="items-center justify-center bg-background-50"
      style={{ height }}
    >
      <Text className="text-typography-600">
        {t.unsupportedPlatform[language]}
      </Text>
    </Box>
  );
};

export default LocationMap;
