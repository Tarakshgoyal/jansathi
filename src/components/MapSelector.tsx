import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number, locationName: string) => void;
  initialPosition?: [number, number];
}

interface MapEventsProps {
  onLocationSelect: (lat: number, lng: number, locationName: string) => void;
}

const MapEvents = ({ onLocationSelect }: MapEventsProps) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  const fetchLocationName = useCallback(async (lat: number, lng: number) => {
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
  }, [onLocationSelect]);

  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      fetchLocationName(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
};

const MapSelector = ({ onLocationSelect, initialPosition }: MapSelectorProps) => {
  const [center, setCenter] = useState<[number, number]>(initialPosition || [30.0668, 79.0193]);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCenter([lat, lng]);
          
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

      <div className="h-[300px] w-full rounded-lg overflow-hidden border">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onLocationSelect={onLocationSelect} />
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Click on the map to select exact location or use your current location
      </p>
    </div>
  );
};

export default MapSelector;
