-- Create storage bucket for audio recordings
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-recordings', 'audio-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for audio recordings
CREATE POLICY "Users can upload their own audio recordings"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'audio-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Audio recordings are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audio-recordings');

CREATE POLICY "Users can update their own audio recordings"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'audio-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio recordings"
ON storage.objects
FOR DELETE
USING (bucket_id = 'audio-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);