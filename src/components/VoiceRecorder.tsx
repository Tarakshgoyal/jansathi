import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

const VoiceRecorder = ({ onRecordingComplete, disabled }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const deleteRecording = () => {
    setAudioURL(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {!isRecording && !audioURL && (
          <Button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="flex-1"
            variant="outline"
          >
            <Mic className="h-4 w-4 mr-2" />
            Record Audio Description
          </Button>
        )}

        {isRecording && (
          <>
            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 rounded-md">
              <div className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
              <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
            </div>
            <Button
              type="button"
              onClick={stopRecording}
              variant="destructive"
              size="icon"
            >
              <Square className="h-4 w-4" />
            </Button>
          </>
        )}

        {audioURL && !isRecording && (
          <>
            <audio src={audioURL} controls className="flex-1" />
            <Button
              type="button"
              onClick={deleteRecording}
              variant="outline"
              size="icon"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
