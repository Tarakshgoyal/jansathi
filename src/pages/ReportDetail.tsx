import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Report {
  id: string;
  title: string;
  description: string | null;
  department_type: string;
  status: string;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  reported: "destructive",
  assigned: "warning",
  in_progress: "info",
  completed: "success",
} as const;

const statusLabels = {
  reported: "Reported",
  assigned: "Assigned to Pradhan",
  in_progress: "Work in Progress",
  completed: "Completed",
};

const departmentNames = {
  jal: "Water (Jal Samasya)",
  bijli: "Electricity (Bijli)",
  sadak: "Road (Sadak)",
  kachra: "Garbage (Kachra)",
  severage: "Sewerage",
};

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setReport(data);
      }
      setLoading(false);
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Report not found</p>
            <Button onClick={() => navigate("/my-reports")}>Back to Reports</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusSteps = ["reported", "assigned", "in_progress", "completed"];
  const currentStepIndex = statusSteps.indexOf(report.status);

  return (
    <div className="min-h-screen bg-muted/30 pb-6">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/my-reports")}>
            ←
          </Button>
          <h1 className="text-2xl font-bold">Report Details</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle>{report.title}</CardTitle>
              <Badge variant={statusColors[report.status as keyof typeof statusColors]}>
                {statusLabels[report.status as keyof typeof statusLabels]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Department</p>
              <p>{departmentNames[report.department_type as keyof typeof departmentNames]}</p>
            </div>

            {report.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p>{report.description}</p>
              </div>
            )}

            {report.photo_url && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Photo Evidence</p>
                <img
                  src={report.photo_url}
                  alt="Report"
                  className="w-full rounded-lg"
                />
              </div>
            )}

            {report.latitude && report.longitude && (
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p>{report.location_name || `${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reported On</p>
                <p>{format(new Date(report.created_at), "PPP")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-4">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      index <= currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index < currentStepIndex ? "✓" : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={index <= currentStepIndex ? "font-semibold" : "text-muted-foreground"}>
                      {statusLabels[step as keyof typeof statusLabels]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportDetail;
