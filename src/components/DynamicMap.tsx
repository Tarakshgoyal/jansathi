import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const MapSelector = lazy(() => import("./MapSelector"));

interface DynamicMapProps {
  onLocationSelect: (lat: number, lng: number, locationName: string) => void;
  initialPosition?: [number, number];
}

const DynamicMap = (props: DynamicMapProps) => {
  return (
    <Suspense
      fallback={
        <div className="h-[300px] w-full rounded-lg border flex items-center justify-center bg-muted/30">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <MapSelector {...props} />
    </Suspense>
  );
};

export default DynamicMap;
