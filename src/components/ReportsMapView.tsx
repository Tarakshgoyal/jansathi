import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Report {
  id: string;
  title: string;
  department_type: string;
  status: string;
  latitude: number;
  longitude: number;
  location_name: string | null;
}

const statusColors = {
  reported: "destructive",
  assigned: "warning",
  in_progress: "info",
  completed: "success",
} as const;

interface ReportsMapViewProps {
  reports: Report[];
}

const ReportsMapView = ({ reports }: ReportsMapViewProps) => {
  const navigate = useNavigate();

  if (reports.length === 0) return null;

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={[reports[0].latitude, reports[0].longitude]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map((report) => (
          <Marker key={report.id} position={[report.latitude, report.longitude]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold mb-1">{report.title}</h3>
                <Badge variant={statusColors[report.status as keyof typeof statusColors]} className="mb-2">
                  {report.status}
                </Badge>
                <p className="text-xs text-muted-foreground mb-2">
                  {report.location_name}
                </p>
                <button
                  onClick={() => navigate(`/report/${report.id}`)}
                  className="text-xs text-primary hover:underline"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ReportsMapView;
