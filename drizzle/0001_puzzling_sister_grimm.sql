CREATE TABLE `commitment` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`category` text,
	`goal_hours` integer DEFAULT 100 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `milestone` (
	`id` text PRIMARY KEY NOT NULL,
	`commitment_id` text NOT NULL,
	`hours_threshold` integer NOT NULL,
	`user_synthesis` text NOT NULL,
	`ai_feedback` text,
	`completed_at` integer NOT NULL,
	FOREIGN KEY (`commitment_id`) REFERENCES `commitment`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `time_log` (
	`id` text PRIMARY KEY NOT NULL,
	`commitment_id` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`date` integer NOT NULL,
	`reflection` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`commitment_id`) REFERENCES `commitment`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `age`;