import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import VoiceRecorder from "@/components/VoiceRecorder";
import InteractiveMap from "@/components/InteractiveMap";

const departments = [
  { value: "jal", label: "Water (Jal Samasya)", emoji: "💧" },
  { value: "bijli", label: "Electricity (Bijli)", emoji: "⚡" },
  { value: "sadak", label: "Road (Sadak)", emoji: "🛣️" },
  { value: "kachra", label: "Garbage (Kachra)", emoji: "🗑️" },
  { value: "severage", label: "Sewerage", emoji: "🚰" },
];

const CreateReport = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    departmentType: searchParams.get("dept") || "",
    latitude: 0,
    longitude: 0,
    locationName: "",
  });

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (userId: string) => {
    if (!photoFile) return null;

    const fileExt = photoFile.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from("report-photos")
      .upload(fileName, photoFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("report-photos")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const uploadAudio = async (userId: string) => {
    if (!audioBlob) return null;

    const fileName = `${userId}/${Date.now()}.webm`;

    const { error: uploadError } = await supabase.storage
      .from("audio-recordings")
      .upload(fileName, audioBlob);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("audio-recordings")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const photoUrl = await uploadPhoto(user.id);
      const audioUrl = await uploadAudio(user.id);

      const { error } = await supabase.from("reports").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        department_type: formData.departmentType,
        photo_url: photoUrl,
        audio_url: audioUrl,
        latitude: formData.latitude,
        longitude: formData.longitude,
        location_name: formData.locationName,
        status: "reported",
      });

      if (error) throw error;

      toast.success("Report submitted successfully!");
      navigate("/my-reports");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-6">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            ←
          </Button>
          <h1 className="text-2xl font-bold">Create Report</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.departmentType}
                onValueChange={(value) => setFormData({ ...formData, departmentType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.emoji} {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Problem Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Problem Title</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the problem"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description (Text or Audio)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the problem in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Or Record Audio Description</Label>
                <VoiceRecorder
                  onRecordingComplete={(blob) => setAudioBlob(blob)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photo Evidence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
                id="photo-input"
              />
              <Label htmlFor="photo-input">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors",
                    photoPreview && "border-primary"
                  )}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-md" />
                  ) : (
                    <div className="space-y-2">
                      <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Tap to capture or upload photo</p>
                    </div>
                  )}
                </div>
              </Label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InteractiveMap
                onLocationSelect={(lat, lng, locationName) => {
                  setFormData({
                    ...formData,
                    latitude: lat,
                    longitude: lng,
                    locationName,
                  });
                }}
                initialPosition={
                  formData.latitude && formData.longitude
                    ? [formData.latitude, formData.longitude]
                    : undefined
                }
              />
              {formData.locationName && (
                <div className="text-sm">
                  <strong>Selected Location:</strong> {formData.locationName}
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={loading || !formData.departmentType || !formData.title}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Report
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateReport;
