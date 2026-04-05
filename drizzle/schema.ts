import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  date,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Bookings ──
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  siteId: varchar("siteId", { length: 64 }).notNull(),
  siteName: varchar("siteName", { length: 255 }).notNull(),
  siteState: varchar("siteState", { length: 8 }).notNull(),
  checkInDate: date("checkInDate").notNull(),
  checkOutDate: date("checkOutDate").notNull(),
  nights: int("nights").notNull(),
  guests: int("guests").notNull().default(1),
  sitePrice: decimal("sitePrice", { precision: 10, scale: 2 }).notNull(),
  bookingFee: decimal("bookingFee", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripePaymentStatus: varchar("stripePaymentStatus", { length: 64 }),
  guestName: varchar("guestName", { length: 255 }),
  guestEmail: varchar("guestEmail", { length: 320 }),
  guestPhone: varchar("guestPhone", { length: 32 }),
  rvType: varchar("rvType", { length: 64 }),
  rvLength: varchar("rvLength", { length: 16 }),
  specialRequests: text("specialRequests"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ── Site Availability (blocked dates) ──
export const siteAvailability = mysqlTable("siteAvailability", {
  id: int("id").autoincrement().primaryKey(),
  siteId: varchar("siteId", { length: 64 }).notNull(),
  blockedDate: date("blockedDate").notNull(),
  bookingId: int("bookingId"),
  reason: mysqlEnum("reason", ["booked", "maintenance", "seasonal_closure"]).default("booked").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SiteAvailability = typeof siteAvailability.$inferSelect;
export type InsertSiteAvailability = typeof siteAvailability.$inferInsert;

// ── Reviews ──
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  siteId: varchar("siteId", { length: 64 }).notNull(),
  siteName: varchar("siteName", { length: 255 }).notNull(),
  authorName: varchar("authorName", { length: 128 }).notNull(),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 255 }),
  body: text("body").notNull(),
  rigType: varchar("rigType", { length: 64 }),
  visitDate: varchar("visitDate", { length: 32 }),
  helpfulCount: int("helpfulCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ── Review Helpful Votes (prevent duplicate votes) ──
export const reviewVotes = mysqlTable("reviewVotes", {
  id: int("id").autoincrement().primaryKey(),
  reviewId: int("reviewId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReviewVote = typeof reviewVotes.$inferSelect;
export type InsertReviewVote = typeof reviewVotes.$inferInsert;

// ── Community Posts ──
export const communityPosts = mysqlTable("communityPosts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  authorName: varchar("authorName", { length: 128 }).notNull(),
  category: mysqlEnum("category", ["general", "tips", "question", "campground_review", "route_share", "gear_talk", "meetup"]).default("general").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  likes: int("likes").default(0).notNull(),
  replyCount: int("replyCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

// ── Community Replies ──
export const communityReplies = mysqlTable("communityReplies", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  authorName: varchar("authorName", { length: 128 }).notNull(),
  body: text("body").notNull(),
  likes: int("likes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommunityReply = typeof communityReplies.$inferSelect;
export type InsertCommunityReply = typeof communityReplies.$inferInsert;

// ── Post/Reply Likes (prevent duplicate likes) ──
export const communityLikes = mysqlTable("communityLikes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  postId: int("postId"),
  replyId: int("replyId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommunityLike = typeof communityLikes.$inferSelect;
export type InsertCommunityLike = typeof communityLikes.$inferInsert;
