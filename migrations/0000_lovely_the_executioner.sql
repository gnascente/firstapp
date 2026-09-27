CREATE TABLE `cards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`image_path` text,
	`locked_by` text,
	`locked_at` text,
	`created_at` integer NOT NULL
);
