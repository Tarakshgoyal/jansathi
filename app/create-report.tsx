import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/integrations/supabase/client';
import * as Location from 'expo-location';

// Location Map Component for Web
function LocationMap({ 
  latitude, 
  longitude, 
  onLocationChange, 
  onLocationNameChange 
}: { 
  latitude: number; 
  longitude: number; 
  onLocationChange: (lat: number, lng: number) => void;
  onLocationNameChange: (name: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchLocationName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      const locationName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      onLocationNameChange(locationName);
    } catch (error) {
      console.error('Error fetching location name:', error);
      onLocationNameChange(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || !mapRef.current) return;

    const initMap = async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      if (!leafletMapRef.current) {
        const map = L.map(mapRef.current).setView([latitude, longitude], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);
        leafletMapRef.current = map;

        // Add click event to map
        map.on('click', async (e: any) => {
          const { lat, lng } = e.latlng;
          
          // Remove existing marker
          if (markerRef.current) {
            markerRef.current.remove();
          }

          // Add new marker
          const newMarker = L.marker([lat, lng]).addTo(map);
          markerRef.current = newMarker;

          onLocationChange(lat, lng);
          await fetchLocationName(lat, lng);
        });

        // Add initial marker if coordinates exist
        if (latitude !== 0 && longitude !== 0) {
          const marker = L.marker([latitude, longitude]).addTo(map);
          markerRef.current = marker;
        }
      }
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update marker position when coordinates change
  useEffect(() => {
    if (markerRef.current && leafletMapRef.current && latitude !== 0) {
      markerRef.current.setLatLng([latitude, longitude]);
      leafletMapRef.current.setView([latitude, longitude], 13);
    }
  }, [latitude, longitude]);

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      // Update map view
      if (leafletMapRef.current) {
        leafletMapRef.current.setView([lat, lng], 13);
      }

      // Remove existing marker
      if (markerRef.current && Platform.OS === 'web') {
        markerRef.current.remove();
      }

      // Add marker at current location
      if (leafletMapRef.current && Platform.OS === 'web') {
        const L = await import('leaflet');
        const newMarker = L.marker([lat, lng]).addTo(leafletMapRef.current);
        markerRef.current = newMarker;
      }

      onLocationChange(lat, lng);
      await fetchLocationName(lat, lng);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ width: '100%' }}>
      <Pressable
        style={styles.getCurrentLocationButton}
        onPress={handleGetCurrentLocation}
        disabled={loading}
      >
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.getCurrentLocationText}>
          {loading ? 'Getting Location...' : 'Use My Current Location'}
        </Text>
      </Pressable>
      <div ref={mapRef} style={{ width: '100%', height: 300, borderRadius: 8, marginTop: 12 }} />
      <Text style={styles.mapHint}>
        Click on the map to select exact location or use your current location
      </Text>
    </View>
  );
}

const departments = [
  { value: 'jal', label: 'Water (Jal Samasya)', emoji: '💧' },
  { value: 'bijli', label: 'Electricity (Bijli)', emoji: '⚡' },
  { value: 'sadak', label: 'Road (Sadak)', emoji: '🛣️' },
  { value: 'kachra', label: 'Garbage (Kachra)', emoji: '🗑️' },
  { value: 'severage', label: 'Sewerage', emoji: '🚰' },
];

export default function CreateReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentType: (params.dept as string) || '',
    latitude: 0,
    longitude: 0,
    locationName: '',
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to create a report.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setFormData((prev) => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));

      // Get location name (reverse geocoding)
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const locationName = `${address.street || ''}, ${address.city || ''}, ${address.region || ''}`.trim();
        setFormData((prev) => ({
          ...prev,
          locationName: locationName || 'Unknown Location',
        }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location. Please try again.');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your report.');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description.');
      return;
    }

    if (!formData.departmentType) {
      Alert.alert('Error', 'Please select a department.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'You must be logged in to create a report.');
        router.push('/auth' as any);
        return;
      }

      const { error } = await supabase.from('reports').insert({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        department_type: formData.departmentType,
        latitude: formData.latitude,
        longitude: formData.longitude,
        location_name: formData.locationName,
        status: 'reported',
      });

      if (error) throw error;

      Alert.alert('Success', 'Your report has been submitted successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating report:', error);
      Alert.alert('Error', error.message || 'Failed to create report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Report</Text>
        <Text style={styles.subtitle}>Report a civic issue in your area</Text>

        {/* Department Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Department *</Text>
          <View style={styles.departmentGrid}>
            {departments.map((dept) => (
              <Pressable
                key={dept.value}
                style={[
                  styles.deptButton,
                  formData.departmentType === dept.value && styles.deptButtonSelected,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, departmentType: dept.value }))
                }
              >
                <Text style={styles.deptEmoji}>{dept.emoji}</Text>
                <Text
                  style={[
                    styles.deptLabel,
                    formData.departmentType === dept.value && styles.deptLabelSelected,
                  ]}
                >
                  {dept.label.split(' ')[0]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief description of the issue"
            value={formData.title}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide detailed information about the issue..."
            value={formData.description}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Location Display */}
        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                {formData.locationName || 'Getting location...'}
              </Text>
              {formData.latitude !== 0 && (
                <Text style={styles.locationCoords}>
                  {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </Text>
              )}
            </View>
            <Pressable onPress={getCurrentLocation} style={styles.refreshButton}>
              <Text style={styles.refreshText}>🔄</Text>
            </Pressable>
          </View>

          {/* Interactive Map */}
          {Platform.OS === 'web' && (
            <View style={styles.mapContainer}>
              <Text style={styles.mapLabel}>Interactive Map</Text>
              <LocationMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={(lat, lng) => {
                  setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
                }}
                onLocationNameChange={(name) => {
                  setFormData((prev) => ({ ...prev, locationName: name }));
                }}
              />
            </View>
          )}
        </View>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </Pressable>

        {/* Cancel Button */}
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  departmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  deptButton: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  deptButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  deptEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  deptLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  deptLabelSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 12,
    color: '#6b7280',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 20,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mapLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  getCurrentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  getCurrentLocationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginLeft: 8,
  },
  mapHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
