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
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_booster` (
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
INSERT INTO `__new_booster`("id", "name", "description", "multiplier", "duration", "price", "type", "createdAt", "updatedAt") SELECT "id", "name", "description", "multiplier", "duration", "price", "type", "createdAt", "updatedAt" FROM `booster`;--> statement-breakpoint
DROP TABLE `booster`;--> statement-breakpoint
ALTER TABLE `__new_booster` RENAME TO `booster`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `subscription` ADD `amount` real DEFAULT 0 NOT NULL;