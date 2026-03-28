ALTER TABLE "candidates" RENAME COLUMN "symbol" TO "position";--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "bio" text NOT NULL;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "election_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "vote_count" integer DEFAULT 0 NOT NULL;