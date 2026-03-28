CREATE TYPE "public"."district" AS ENUM('KATHMANDU', 'LALITPUR', 'BHAKTAPUR', 'BARA', 'POKHARA', 'CHITWAN', 'DHANKUTA', 'MORANG', 'SURKHET', 'BHAIRAHAWA', 'KAILALI', 'KANCHANPUR', 'SOLUKHUMBU', 'TANAHU', 'NUWAKOT', 'SINDHUPALCHOK', 'MAKWANPUR', 'RAMECHHAP', 'DHADING', 'PALPA');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'VOTER');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'VOTER' NOT NULL,
	"dob" timestamp NOT NULL,
	"district" "district" NOT NULL,
	"citizen_no" varchar(255) NOT NULL,
	"photo_url" varchar(500) NOT NULL,
	"has_voted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_citizen_no_unique" UNIQUE("citizen_no")
);
