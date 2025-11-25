CREATE TABLE "VisitorLog" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"name" text,
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
