import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Camera,
  MapView,
  PointAnnotation,
  UserLocation,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Issue } from '@/services/api';
import { Droplet, Zap, Construction, Trash2, RefreshCw } from 'lucide-react-native';

interface IssuesMapProps {}

const IssuesMap: React.FC<IssuesMapProps> = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing map...');
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Default center coordinates (will be updated with user location)
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>([0, 0]);
  const [zoomLevel, setZoomLevel] = useState(12);

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    setLoadingMessage('Getting your location...');
    await requestLocationAccess();
    // Load issues after we have location
    setLoadingMessage('Loading nearby issues...');
    await loadIssues();
  };

  const requestLocationAccess = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const currentLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(currentLocation);
        setCenterCoordinate([currentLocation.longitude, currentLocation.latitude]);
        
        return currentLocation;
      } else {
        setError("Location permission denied. Please enable location access to view issues.");
        setIsLoading(false);
        return null;
      }
    } catch (err) {
      console.error("Error getting location:", err);
      setError("Failed to get your location. Please check your location settings.");
      setIsLoading(false);
      return null;
    }
  };

  const loadIssues = async () => {
    try {
      setError(null);
      
      if (!isAuthenticated) {
        router.push('/login' as any);
        return;
      }

      // Wait for user location if we don't have it yet
      let searchLocation = userLocation;
      if (!searchLocation) {
        searchLocation = await requestLocationAccess();
      }

      // If still no location, show error and return
      if (!searchLocation) {
        setError("Cannot load issues without location. Please enable location services.");
        setIsLoading(false);
        return;
      }

      const issuesData = await apiService.getMapIssues({
        latitude: searchLocation.latitude,
        longitude: searchLocation.longitude,
        radius: 50, // 50km radius
      });
      setIssues(issuesData);

      // Center map on issues if available
      if (issuesData.length > 0) {
        const latitudes = issuesData.map(i => i.latitude);
        const longitudes = issuesData.map(i => i.longitude);
        
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        
        setCenterCoordinate([centerLng, centerLat]);
        
        // Calculate appropriate zoom level based on bounds
        const latDelta = maxLat - minLat;
        const lngDelta = maxLng - minLng;
        const maxDelta = Math.max(latDelta, lngDelta);
        
        if (maxDelta > 0.5) setZoomLevel(10);
        else if (maxDelta > 0.1) setZoomLevel(12);
        else if (maxDelta > 0.05) setZoomLevel(13);
        else setZoomLevel(14);
      }
    } catch (err) {
      console.error('Failed to load issues:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load issues';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerPress = (issue: Issue) => {
    setSelectedIssue(issue);
  };

  const handleCloseDetail = () => {
    setSelectedIssue(null);
  };

  const getMarkerColor = (issueType: string, status: string) => {
    // Status colors take precedence
    switch (status) {
      case 'reported':
        return '#ef4444'; // red
      case 'pradhan_check':
        return '#eab308'; // yellow
      case 'started_working':
        return '#22c55e'; // green
      case 'finished_work':
        return '#3b82f6'; // blue
      default:
        // Fallback to issue type colors if status doesn't match
        switch (issueType) {
          case 'water':
            return '#3b82f6'; // blue
          case 'electricity':
            return '#eab308'; // yellow
          case 'road':
            return '#ef4444'; // red
          case 'garbage':
            return '#22c55e'; // green
          default:
            return '#6b7280'; // gray
        }
    }
  };

  const getIssueIcon = (issueType: string) => {
    switch (issueType) {
      case 'water':
        return '💧';
      case 'electricity':
        return '⚡';
      case 'road':
        return '🏗️';
      case 'garbage':
        return '🗑️';
      default:
        return '📍';
    }
  };

  const getIssueTypeLabel = (issueType: string) => {
    switch (issueType) {
      case 'water':
        return 'Water Issue';
      case 'electricity':
        return 'Electricity Issue';
      case 'road':
        return 'Road Issue';
      case 'garbage':
        return 'Garbage Issue';
      default:
        return issueType;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'reported':
        return 'Reported';
      case 'pradhan_check':
        return 'Pradhan Check';
      case 'started_working':
        return 'Started Working';
      case 'finished_work':
        return 'Finished Work';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">{loadingMessage}</Text>
      </View>
    );
  }

  // Show error state if we have an error and no location
  if (error && !userLocation) {
    return (
      <View className="flex-1 justify-center items-center bg-background-50 p-6">
        <Text className="text-2xl mb-4">📍</Text>
        <Text className="text-red-600 text-center font-semibold mb-2">
          Location Required
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          {error}
        </Text>
        <Button
          size="md"
          onPress={initializeMap}
          className="bg-blue-600"
        >
          <ButtonText>Try Again</ButtonText>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapView
        style={{ flex: 1 }}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
        logoEnabled={false}
        attributionEnabled={false}
        attributionPosition={{ bottom: 8, left: 8 }}
        compassEnabled={true}
        compassViewPosition={1}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={false}
        rotateEnabled={true}
      >
        <Camera
          ref={cameraRef}
          zoomLevel={zoomLevel}
          centerCoordinate={centerCoordinate}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* User location if available */}
        {userLocation && (
          <UserLocation
            visible={true}
            animated={true}
            renderMode="native"
            androidRenderMode="compass"
            showsUserHeadingIndicator={true}
            minDisplacement={10}
          />
        )}

        {/* Issue markers */}
        {issues.map((issue) => (
          <PointAnnotation
            key={`issue-${issue.id}`}
            id={`issue-${issue.id}`}
            coordinate={[issue.longitude, issue.latitude]}
            title={getIssueTypeLabel(issue.issue_type)}
            onSelected={() => handleMarkerPress(issue)}
          >
            <TouchableOpacity onPress={() => handleMarkerPress(issue)}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: getMarkerColor(issue.issue_type, issue.status),
                  borderWidth: 3,
                  borderColor: '#FFFFFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                  elevation: 5,
                }}
              >
                <Text style={{ fontSize: 20 }}>{getIssueIcon(issue.issue_type)}</Text>
              </View>
            </TouchableOpacity>
          </PointAnnotation>
        ))}
      </MapView>

      {/* Refresh Button */}
      <View className="absolute top-4 right-4">
        <Button
          size="md"
          onPress={loadIssues}
          className="bg-white shadow-lg"
          variant="outline"
        >
          <RefreshCw size={20} color="#3b82f6" />
        </Button>
      </View>

      {/* Issue Counter */}
      <View className="absolute top-4 left-4">
        <Box className="bg-white px-4 py-2 rounded-full shadow-lg">
          <Text className="font-semibold text-gray-800">
            {issues.length} issue{issues.length !== 1 ? 's' : ''}
          </Text>
        </Box>
      </View>

      {/* Selected Issue Detail Card */}
      {selectedIssue && (
        <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-4">
          <VStack space="md">
            <HStack className="justify-between items-start">
              <HStack space="sm" className="flex-1 items-start">
                <Text className="text-2xl">{getIssueIcon(selectedIssue.issue_type)}</Text>
                <VStack className="flex-1" space="xs">
                  <Text className="font-bold text-lg text-gray-900">
                    {getIssueTypeLabel(selectedIssue.issue_type)}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Status: {getStatusLabel(selectedIssue.status)}
                  </Text>
                </VStack>
              </HStack>
              <Button
                size="sm"
                variant="link"
                onPress={handleCloseDetail}
              >
                <Text className="text-gray-500 text-xl">✕</Text>
              </Button>
            </HStack>

            <Text className="text-gray-700">
              {selectedIssue.description}
            </Text>

            <HStack space="lg" className="flex-wrap">
              <Text className="text-xs text-gray-500">
                📍 {selectedIssue.latitude.toFixed(4)}, {selectedIssue.longitude.toFixed(4)}
              </Text>
              <Text className="text-xs text-gray-500">
                📅 {formatDate(selectedIssue.created_at)}
              </Text>
              {selectedIssue.photos && selectedIssue.photos.length > 0 && (
                <Text className="text-xs text-gray-500">
                  📷 {selectedIssue.photos.length} photo{selectedIssue.photos.length > 1 ? 's' : ''}
                </Text>
              )}
            </HStack>
          </VStack>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View className="absolute bottom-0 left-0 right-0 bg-red-50 p-4">
          <Text className="text-red-600 text-center">{error}</Text>
        </View>
      )}
    </View>
  );
};

export default IssuesMap;
