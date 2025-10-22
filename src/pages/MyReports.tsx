import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Report {
  id: string;
  title: string;
  department_type: string;
  status: string;
  created_at: string;
  photo_url: string | null;
}

const statusColors = {
  reported: "destructive",
  assigned: "warning",
  in_progress: "info",
  completed: "success",
} as const;

const departmentNames = {
  jal: "Water",
  bijli: "Electricity",
  sadak: "Road",
  kachra: "Garbage",
  severage: "Sewerage",
};

const MyReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setReports(data);
      }
      setLoading(false);
    };

    fetchReports();
  }, [navigate]);

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
        <h1 className="text-2xl font-bold">My Reports</h1>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No reports yet. Create your first report!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/report/${report.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-1">{report.title}</CardTitle>
                    <Badge variant={statusColors[report.status as keyof typeof statusColors]}>
                      {report.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {departmentNames[report.department_type as keyof typeof departmentNames]}
                    </span>
                    <span className="text-muted-foreground">
                      {format(new Date(report.created_at), "MMM dd, yyyy")}
                    </span>
                  </div>
                  {report.photo_url && (
                    <img
                      src={report.photo_url}
                      alt="Report"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyReports;
