import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface InteractiveMapProps {
  onLocationSelect: (lat: number, lng: number, locationName: string) => void;
  initialPosition?: [number, number];
}

const InteractiveMap = ({ onLocationSelect, initialPosition }: InteractiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState<[number, number]>(initialPosition || [30.0668, 79.0193]);

  useEffect(() => {
    // Dynamically import Leaflet only on client side
    const initMap = async () => {
      if (!mapRef.current || map) return;

      const L = await import("leaflet");
      
      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      const mapInstance = L.map(mapRef.current).setView(center, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);

      mapInstance.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        
        // Remove existing marker
        if (marker) {
          marker.remove();
        }

        // Add new marker
        const newMarker = L.marker([lat, lng]).addTo(mapInstance);
        setMarker(newMarker);

        // Fetch location name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await response.json();
          const locationName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          onLocationSelect(lat, lng, locationName);
        } catch (error) {
          console.error("Error fetching location name:", error);
          onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      });

      setMap(mapInstance);
    };

    initMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (map && center) {
      map.setView(center, 13);
    }
  }, [center, map]);

  const getCurrentLocation = async () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCenter([lat, lng]);

          // Remove existing marker
          if (marker) {
            marker.remove();
          }

          // Add marker at current location
          if (map) {
            const L = await import("leaflet");
            const newMarker = L.marker([lat, lng]).addTo(map);
            setMarker(newMarker);
          }

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await response.json();
            const locationName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            onLocationSelect(lat, lng, locationName);
          } catch (error) {
            console.error("Error fetching location name:", error);
            onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }

          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        }
      );
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={getCurrentLocation}
        disabled={loading}
        variant="outline"
        className="w-full"
      >
        <MapPin className="h-4 w-4 mr-2" />
        {loading ? "Getting Location..." : "Use My Current Location"}
      </Button>

      <div ref={mapRef} className="h-[300px] w-full rounded-lg overflow-hidden border" />
      
      <p className="text-xs text-muted-foreground">
        Click on the map to select exact location or use your current location
      </p>
    </div>
  );
};

export default InteractiveMap;
