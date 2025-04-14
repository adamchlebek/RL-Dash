-- Create the Replay table
CREATE TABLE IF NOT EXISTS "Replay" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "ballchasingId" TEXT UNIQUE NOT NULL,
  "fileName" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "uploadedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "processedAt" TIMESTAMP WITH TIME ZONE
); 