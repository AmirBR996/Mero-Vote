ALTER TABLE "users" ADD COLUMN "face_descriptor" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "has_voted" boolean DEFAULT false NOT NULL;