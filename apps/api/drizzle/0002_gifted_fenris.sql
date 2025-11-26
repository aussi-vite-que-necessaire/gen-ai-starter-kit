CREATE TYPE "public"."workflow_status" AS ENUM('PENDING', 'RUNNING', 'WAITING_FOR_INPUT', 'WAITING_CHILDREN', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TABLE "workflow_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"workflow_id" text NOT NULL,
	"status" "workflow_status" DEFAULT 'PENDING' NOT NULL,
	"parent_id" uuid,
	"parent_step_id" text,
	"context" jsonb DEFAULT '{}'::jsonb,
	"input" jsonb NOT NULL,
	"result" jsonb,
	"error" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflow_step" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"step_id" text NOT NULL,
	"status" "workflow_status" DEFAULT 'PENDING' NOT NULL,
	"input" jsonb,
	"output" jsonb,
	"error" text,
	"started_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "workflow_run" ADD CONSTRAINT "workflow_run_tenant_id_user_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_step" ADD CONSTRAINT "workflow_step_run_id_workflow_run_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."workflow_run"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workflow_run_parent_idx" ON "workflow_run" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "workflow_step_run_idx" ON "workflow_step" USING btree ("run_id");