import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen pb-20 bg-muted/30">
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Jansarthi</h1>
          <p className="text-muted-foreground">
            Report and track civic issues in Uttarakhand
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="rounded-full h-16 w-16 shadow-lg"
            onClick={() => navigate("/create-report")}
          >
            <Plus className="h-8 w-8" />
          </Button>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => navigate("/my-reports")}
            >
              <span className="text-2xl">📋</span>
              <span>My Reports</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => navigate("/reports-map")}
            >
              <span className="text-2xl">🗺️</span>
              <span>View Map</span>
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Department Services</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Water", emoji: "💧", dept: "jal" },
              { name: "Electricity", emoji: "⚡", dept: "bijli" },
              { name: "Road", emoji: "🛣️", dept: "sadak" },
              { name: "Garbage", emoji: "🗑️", dept: "kachra" },
            ].map((service) => (
              <Button
                key={service.dept}
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => navigate(`/create-report?dept=${service.dept}`)}
              >
                <span className="text-2xl">{service.emoji}</span>
                <span className="text-sm">{service.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
