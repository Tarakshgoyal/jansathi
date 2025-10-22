import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import "leaflet/dist/leaflet.css";

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

interface ReportsMapViewerProps {
  reports: Report[];
}

const ReportsMapViewer = ({ reports }: ReportsMapViewerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current || reports.length === 0) return;

    const initMap = async () => {
      const L = await import("leaflet");

      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current).setView(
        [reports[0].latitude, reports[0].longitude],
        10
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add markers for each report
      reports.forEach((report) => {
        const marker = L.marker([report.latitude, report.longitude]).addTo(map);

        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="font-weight: 600; margin-bottom: 8px;">${report.title}</h3>
            <div style="margin-bottom: 8px;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; background: #f3f4f6;">
                ${report.status}
              </span>
            </div>
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
              ${report.location_name || ""}
            </p>
            <button
              onclick="window.location.href='/report/${report.id}'"
              style="font-size: 12px; color: #2563eb; cursor: pointer; border: none; background: none; padding: 0; text-decoration: underline;"
            >
              View Details
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
      });

      return () => {
        map.remove();
      };
    };

    initMap();
  }, [reports, navigate]);

  return <div ref={mapRef} className="h-[400px] w-full rounded-lg overflow-hidden border" />;
};

export default ReportsMapViewer;
