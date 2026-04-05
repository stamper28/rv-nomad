CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`siteId` varchar(64) NOT NULL,
	`siteName` varchar(255) NOT NULL,
	`siteState` varchar(8) NOT NULL,
	`checkInDate` date NOT NULL,
	`checkOutDate` date NOT NULL,
	`nights` int NOT NULL,
	`guests` int NOT NULL DEFAULT 1,
	`sitePrice` decimal(10,2) NOT NULL,
	`bookingFee` decimal(10,2) NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
	`stripePaymentIntentId` varchar(255),
	`stripePaymentStatus` varchar(64),
	`guestName` varchar(255),
	`guestEmail` varchar(320),
	`guestPhone` varchar(32),
	`rvType` varchar(64),
	`rvLength` varchar(16),
	`specialRequests` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communityLikes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`postId` int,
	`replyId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communityLikes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communityPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`authorName` varchar(128) NOT NULL,
	`category` enum('general','tips','question','campground_review','route_share','gear_talk','meetup') NOT NULL DEFAULT 'general',
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`likes` int NOT NULL DEFAULT 0,
	`replyCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communityPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communityReplies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`authorName` varchar(128) NOT NULL,
	`body` text NOT NULL,
	`likes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communityReplies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviewVotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviewVotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`siteId` varchar(64) NOT NULL,
	`siteName` varchar(255) NOT NULL,
	`authorName` varchar(128) NOT NULL,
	`rating` int NOT NULL,
	`title` varchar(255),
	`body` text NOT NULL,
	`rigType` varchar(64),
	`visitDate` varchar(32),
	`helpfulCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siteAvailability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` varchar(64) NOT NULL,
	`blockedDate` date NOT NULL,
	`bookingId` int,
	`reason` enum('booked','maintenance','seasonal_closure') NOT NULL DEFAULT 'booked',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `siteAvailability_id` PRIMARY KEY(`id`)
);
