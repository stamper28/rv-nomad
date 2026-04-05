import { eq, and, gte, lte, desc, asc, sql, or, between } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  bookings,
  InsertBooking,
  siteAvailability,
  InsertSiteAvailability,
  reviews,
  InsertReview,
  reviewVotes,
  communityPosts,
  InsertCommunityPost,
  communityReplies,
  InsertCommunityReply,
  communityLikes,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── User Queries ──

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Booking Queries ──

export async function checkAvailability(siteId: string, checkIn: string, checkOut: string) {
  const db = await getDb();
  if (!db) return { available: true, blockedDates: [] as string[] };

  const blocked = await db
    .select()
    .from(siteAvailability)
    .where(
      and(
        eq(siteAvailability.siteId, siteId),
        sql`${siteAvailability.blockedDate} >= ${checkIn}`,
        sql`${siteAvailability.blockedDate} <= ${checkOut}`
      )
    );

  return {
    available: blocked.length === 0,
    blockedDates: blocked.map((b) => String(b.blockedDate)),
  };
}

export async function getBlockedDatesForSite(siteId: string) {
  const db = await getDb();
  if (!db) return [] as { date: string; reason: string }[];

  const today = new Date().toISOString().split("T")[0]!;
  const blocked = await db
    .select({ date: siteAvailability.blockedDate, reason: siteAvailability.reason })
    .from(siteAvailability)
    .where(
      and(
        eq(siteAvailability.siteId, siteId),
        sql`${siteAvailability.blockedDate} >= ${today}`
      )
    );

  return blocked.map((b) => ({ date: String(b.date), reason: b.reason }));
}

export async function createBooking(data: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Insert the booking
  const result = await db.insert(bookings).values(data);
  const bookingId = Number(result[0].insertId);

  // Block the dates
  const checkInStr = String(data.checkInDate);
  const checkOutStr = String(data.checkOutDate);
  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);
  const datesToBlock: InsertSiteAvailability[] = [];

  for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
    datesToBlock.push({
      siteId: data.siteId,
      blockedDate: new Date(d.toISOString().split("T")[0]!),
      bookingId,
      reason: "booked",
    });
  }

  if (datesToBlock.length > 0) {
    await db.insert(siteAvailability).values(datesToBlock);
  }

  return bookingId;
}

export async function getUserBookings(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt));
}

export async function cancelBooking(bookingId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify ownership
  const booking = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
    .limit(1);

  if (booking.length === 0) throw new Error("Booking not found");
  if (booking[0].status === "cancelled") throw new Error("Booking already cancelled");

  // Cancel booking
  await db
    .update(bookings)
    .set({ status: "cancelled" })
    .where(eq(bookings.id, bookingId));

  // Unblock dates
  await db
    .delete(siteAvailability)
    .where(eq(siteAvailability.bookingId, bookingId));

  return true;
}

export async function updateBookingPayment(
  bookingId: number,
  paymentIntentId: string,
  paymentStatus: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(bookings)
    .set({
      stripePaymentIntentId: paymentIntentId,
      stripePaymentStatus: paymentStatus,
      status: paymentStatus === "succeeded" ? "confirmed" : "pending",
    })
    .where(eq(bookings.id, bookingId));
}

// ── Review Queries ──

export async function getReviewsForSite(siteId: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(reviews)
    .where(eq(reviews.siteId, siteId))
    .orderBy(desc(reviews.createdAt));
}

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reviews).values(data);
  return Number(result[0].insertId);
}

export async function getUserReviews(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(reviews)
    .where(eq(reviews.userId, userId))
    .orderBy(desc(reviews.createdAt));
}

export async function voteReviewHelpful(reviewId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check for existing vote
  const existing = await db
    .select()
    .from(reviewVotes)
    .where(and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    // Remove vote
    await db.delete(reviewVotes).where(eq(reviewVotes.id, existing[0].id));
    await db
      .update(reviews)
      .set({ helpfulCount: sql`${reviews.helpfulCount} - 1` })
      .where(eq(reviews.id, reviewId));
    return { voted: false };
  } else {
    // Add vote
    await db.insert(reviewVotes).values({ reviewId, userId });
    await db
      .update(reviews)
      .set({ helpfulCount: sql`${reviews.helpfulCount} + 1` })
      .where(eq(reviews.id, reviewId));
    return { voted: true };
  }
}

export async function getSiteAverageRating(siteId: string) {
  const db = await getDb();
  if (!db) return { average: 0, count: 0 };

  const result = await db
    .select({
      avg: sql<number>`AVG(${reviews.rating})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .where(eq(reviews.siteId, siteId));

  return {
    average: result[0]?.avg ?? 0,
    count: result[0]?.count ?? 0,
  };
}

// ── Community Post Queries ──

export async function getCommunityPosts(category?: string, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  if (category && category !== "all") {
    return db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.category, category as any))
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  return db
    .select()
    .from(communityPosts)
    .orderBy(desc(communityPosts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function createCommunityPost(data: InsertCommunityPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(communityPosts).values(data);
  return Number(result[0].insertId);
}

export async function getPostReplies(postId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(communityReplies)
    .where(eq(communityReplies.postId, postId))
    .orderBy(asc(communityReplies.createdAt));
}

export async function createReply(data: InsertCommunityReply) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(communityReplies).values(data);

  // Increment reply count on parent post
  await db
    .update(communityPosts)
    .set({ replyCount: sql`${communityPosts.replyCount} + 1` })
    .where(eq(communityPosts.id, data.postId));

  return Number(result[0].insertId);
}

export async function togglePostLike(postId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(communityLikes)
    .where(and(eq(communityLikes.postId, postId), eq(communityLikes.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(communityLikes).where(eq(communityLikes.id, existing[0].id));
    await db
      .update(communityPosts)
      .set({ likes: sql`${communityPosts.likes} - 1` })
      .where(eq(communityPosts.id, postId));
    return { liked: false };
  } else {
    await db.insert(communityLikes).values({ postId, userId });
    await db
      .update(communityPosts)
      .set({ likes: sql`${communityPosts.likes} + 1` })
      .where(eq(communityPosts.id, postId));
    return { liked: true };
  }
}

export async function toggleReplyLike(replyId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(communityLikes)
    .where(and(eq(communityLikes.replyId, replyId), eq(communityLikes.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(communityLikes).where(eq(communityLikes.id, existing[0].id));
    await db
      .update(communityReplies)
      .set({ likes: sql`${communityReplies.likes} - 1` })
      .where(eq(communityReplies.id, replyId));
    return { liked: false };
  } else {
    await db.insert(communityLikes).values({ replyId, userId });
    await db
      .update(communityReplies)
      .set({ likes: sql`${communityReplies.likes} + 1` })
      .where(eq(communityReplies.id, replyId));
    return { liked: true };
  }
}

export async function getUserLikes(userId: number) {
  const db = await getDb();
  if (!db) return { postIds: [], replyIds: [] };

  const likes = await db
    .select()
    .from(communityLikes)
    .where(eq(communityLikes.userId, userId));

  return {
    postIds: likes.filter((l) => l.postId !== null).map((l) => l.postId!),
    replyIds: likes.filter((l) => l.replyId !== null).map((l) => l.replyId!),
  };
}
