import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { MapPin, Loader2 } from "lucide-react";

const ReportsMapViewer = lazy(() => import("@/components/ReportsMapViewer"));

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

const ReportsMap = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, title, department_type, status, latitude, longitude, location_name")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setReports(data);
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-muted/30">
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Reports Map</h1>
        
        {reports.length > 0 ? (
          <Suspense
            fallback={
              <div className="h-[400px] w-full rounded-lg border flex items-center justify-center bg-muted/30">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <ReportsMapViewer reports={reports} />
          </Suspense>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No reports with location data available
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">All Reports</h2>
          {reports.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No reports available
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card
                key={report.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/report/${report.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold line-clamp-1">{report.title}</h3>
                    <Badge variant={statusColors[report.status as keyof typeof statusColors]}>
                      {report.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {report.location_name || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ReportsMap;
