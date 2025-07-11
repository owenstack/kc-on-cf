CREATE TABLE `booster` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`multiplier` real NOT NULL,
	`duration` integer,
	`price` real NOT NULL,
	`type` text NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`planType` text DEFAULT 'free' NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`planDuration` text NOT NULL,
	`startDate` integer NOT NULL,
	`endDate` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`description` text,
	`metadata` text,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`telegram_id` integer NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text,
	`username` text,
	`image` text,
	`role` text DEFAULT 'user' NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`wallet_balance` real DEFAULT 0 NOT NULL,
	`public_key` text NOT NULL,
	`is_onboarded` integer DEFAULT false NOT NULL,
	`referrer_id` integer,
	`banned` integer DEFAULT false NOT NULL,
	`ban_reason` text,
	`ban_expires` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_telegram_id_unique` ON `user` (`telegram_id`);--> statement-breakpoint
CREATE TABLE `user_booster` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`boosterId` text NOT NULL,
	`activatedAt` integer NOT NULL,
	`expiresAt` integer,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`boosterId`) REFERENCES `booster`(`id`) ON UPDATE no action ON DELETE cascade
);
