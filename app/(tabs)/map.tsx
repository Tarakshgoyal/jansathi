import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { supabase } from '@/integrations/supabase/client';

interface Report {
  id: string;
  title: string;
  latitude: number | null;
  longitude: number | null;
  department_type: string;
  status: string;
}

const DEFAULT_CENTER = { latitude: 30.3165, longitude: 78.0322 };

const DEPARTMENT_COLORS: Record<string, string> = {
  jal: '#3b82f6', bijli: '#eab308', sadak: '#6b7280', kachra: '#22c55e', severage: '#8b5cf6',
};

const DEPARTMENT_NAMES: Record<string, string> = {
  jal: 'Water Supply', bijli: 'Electricity', sadak: 'Roads', kachra: 'Garbage', severage: 'Sewerage',
};

function WebMap({ reports }: { reports: Report[] }) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const leafletMapRef = React.useRef<any>(null);

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
        const map = L.map(mapRef.current).setView([DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);
        leafletMapRef.current = map;
      }

      leafletMapRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) leafletMapRef.current.removeLayer(layer);
      });

      reports.forEach((report) => {
        if (report.latitude && report.longitude) {
          const color = DEPARTMENT_COLORS[report.department_type] || '#ef4444';
          const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
            iconSize: [25, 25],
            iconAnchor: [12, 25],
          });
          const marker = L.marker([report.latitude, report.longitude], { icon: markerIcon }).addTo(leafletMapRef.current);
          marker.bindPopup(`<div style="font-family: system-ui; padding: 8px;"><strong style="font-size: 14px; color: #1f2937;">${report.title}</strong><br/><span style="font-size: 12px; color: #6b7280;">${DEPARTMENT_NAMES[report.department_type] || report.department_type} • ${report.status}</span></div>`);
        }
      });

      if (reports.length > 0) {
        const validReports = reports.filter(r => r.latitude && r.longitude);
        if (validReports.length > 0) {
          const bounds = L.latLngBounds(validReports.map(r => [r.latitude!, r.longitude!]));
          leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    };

    initMap();
    return () => { if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null; } };
  }, [reports]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 12 }} />;
}

export default function MapScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase.from('reports').select('id, title, latitude, longitude, department_type, status').not('latitude', 'is', null).not('longitude', 'is', null).order('created_at', { ascending: false }).limit(100);
      if (!error && data) setReports(data);
    } catch (error) { console.error('Error fetching reports:', error); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports Map</Text>
        <Text style={styles.subtitle}>{reports.length} reports with location data</Text>
        <Text style={styles.mapInfo}>🗺️ Powered by OpenStreetMap</Text>
      </View>
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? <WebMap reports={reports} /> : (
          <View style={styles.nativeMapPlaceholder}>
            <Text style={styles.placeholderEmoji}>📱</Text>
            <Text style={styles.placeholderTitle}>Mobile Map Coming Soon</Text>
            <Text style={styles.placeholderText}>Interactive map with OpenStreetMap is currently available on web.</Text>
            {reports.length > 0 && <Text style={styles.reportCount}>{reports.length} reports ready to display</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 4 },
  mapInfo: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
  mapContainer: { flex: 1, margin: 24, marginTop: 0, borderRadius: 12, overflow: 'hidden', backgroundColor: '#e5e7eb' },
  nativeMapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  placeholderEmoji: { fontSize: 64, marginBottom: 16 },
  placeholderTitle: { fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 12, textAlign: 'center' },
  placeholderText: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  reportCount: { fontSize: 14, color: '#3b82f6', fontWeight: '500' },
});
