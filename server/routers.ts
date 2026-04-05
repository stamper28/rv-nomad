import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { createPaymentIntent, getPaymentIntent, cancelPaymentIntent, createRefund } from "./stripe";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Bookings ──
  bookings: router({
    // Check availability for a site + date range
    checkAvailability: publicProcedure
      .input(
        z.object({
          siteId: z.string(),
          checkIn: z.string(),
          checkOut: z.string(),
        })
      )
      .query(({ input }) => {
        return db.checkAvailability(input.siteId, input.checkIn, input.checkOut);
      }),

    // Get all blocked dates for a site (for calendar display)
    getBlockedDates: publicProcedure
      .input(z.object({ siteId: z.string() }))
      .query(({ input }) => {
        return db.getBlockedDatesForSite(input.siteId);
      }),

    // Create a booking (requires auth)
    create: protectedProcedure
      .input(
        z.object({
          siteId: z.string(),
          siteName: z.string(),
          siteState: z.string(),
          checkInDate: z.string(),
          checkOutDate: z.string(),
          nights: z.number().min(1),
          guests: z.number().min(1).default(1),
          sitePrice: z.string(),
          bookingFee: z.string(),
          totalPrice: z.string(),
          guestName: z.string().optional(),
          guestEmail: z.string().optional(),
          guestPhone: z.string().optional(),
          rvType: z.string().optional(),
          rvLength: z.string().optional(),
          specialRequests: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Double-check availability before booking
        const avail = await db.checkAvailability(
          input.siteId,
          input.checkInDate,
          input.checkOutDate
        );
        if (!avail.available) {
          throw new Error(
            "Selected dates are no longer available. Please choose different dates."
          );
        }

        const bookingId = await db.createBooking({
          userId: ctx.user.id,
          siteId: input.siteId,
          siteName: input.siteName,
          siteState: input.siteState,
          checkInDate: new Date(input.checkInDate),
          checkOutDate: new Date(input.checkOutDate),
          nights: input.nights,
          guests: input.guests,
          sitePrice: input.sitePrice,
          bookingFee: input.bookingFee,
          totalPrice: input.totalPrice,
          status: "confirmed",
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone,
          rvType: input.rvType,
          rvLength: input.rvLength,
          specialRequests: input.specialRequests,
        });

        return { bookingId, success: true };
      }),

    // Get user's bookings
    myBookings: protectedProcedure.query(({ ctx }) => {
      return db.getUserBookings(ctx.user.id);
    }),

    // Cancel a booking
    cancel: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(({ ctx, input }) => {
        return db.cancelBooking(input.bookingId, ctx.user.id);
      }),

    // Update payment status
    updatePayment: protectedProcedure
      .input(
        z.object({
          bookingId: z.number(),
          paymentIntentId: z.string(),
          paymentStatus: z.string(),
        })
      )
      .mutation(({ input }) => {
        return db.updateBookingPayment(
          input.bookingId,
          input.paymentIntentId,
          input.paymentStatus
        );
      }),
  }),

  // ── Payments (Stripe) ──
  payments: router({
    // Create a payment intent for a booking
    createIntent: protectedProcedure
      .input(
        z.object({
          amount: z.number().min(50), // minimum 50 cents
          description: z.string().optional(),
          bookingId: z.number().optional(),
          siteName: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createPaymentIntent({
          amount: input.amount,
          currency: "usd",
          description: input.description || `RV Nomad Booking${input.siteName ? ` - ${input.siteName}` : ""}`,
          metadata: {
            ...(input.bookingId ? { bookingId: String(input.bookingId) } : {}),
            ...(input.siteName ? { siteName: input.siteName } : {}),
          },
        });
        return result;
      }),

    // Check payment status
    checkStatus: protectedProcedure
      .input(z.object({ paymentIntentId: z.string() }))
      .query(async ({ input }) => {
        const pi = await getPaymentIntent(input.paymentIntentId);
        return {
          status: pi.status,
          amount: pi.amount,
          currency: pi.currency,
        };
      }),

    // Request a refund
    refund: protectedProcedure
      .input(
        z.object({
          paymentIntentId: z.string(),
          amount: z.number().optional(), // partial refund in cents
        })
      )
      .mutation(async ({ input }) => {
        const refund = await createRefund(input.paymentIntentId, input.amount);
        return { refundId: refund.id, status: refund.status };
      }),
  }),

  // ── Reviews ──
  reviews: router({
    // Get reviews for a specific site
    forSite: publicProcedure
      .input(z.object({ siteId: z.string() }))
      .query(({ input }) => {
        return db.getReviewsForSite(input.siteId);
      }),

    // Get average rating for a site
    siteRating: publicProcedure
      .input(z.object({ siteId: z.string() }))
      .query(({ input }) => {
        return db.getSiteAverageRating(input.siteId);
      }),

    // Submit a review (requires auth)
    create: protectedProcedure
      .input(
        z.object({
          siteId: z.string(),
          siteName: z.string(),
          rating: z.number().min(1).max(5),
          title: z.string().optional(),
          body: z.string().min(10),
          rigType: z.string().optional(),
          visitDate: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        return db.createReview({
          userId: ctx.user.id,
          siteId: input.siteId,
          siteName: input.siteName,
          authorName: ctx.user.name || "Anonymous",
          rating: input.rating,
          title: input.title,
          body: input.body,
          rigType: input.rigType,
          visitDate: input.visitDate,
        });
      }),

    // Get user's reviews
    myReviews: protectedProcedure.query(({ ctx }) => {
      return db.getUserReviews(ctx.user.id);
    }),

    // Vote a review as helpful
    voteHelpful: protectedProcedure
      .input(z.object({ reviewId: z.number() }))
      .mutation(({ ctx, input }) => {
        return db.voteReviewHelpful(input.reviewId, ctx.user.id);
      }),
  }),

  // ── Community ──
  community: router({
    // Get posts (optionally filtered by category)
    posts: publicProcedure
      .input(
        z
          .object({
            category: z.string().optional(),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
          })
          .optional()
      )
      .query(({ input }) => {
        return db.getCommunityPosts(
          input?.category,
          input?.limit ?? 50,
          input?.offset ?? 0
        );
      }),

    // Create a post (requires auth)
    createPost: protectedProcedure
      .input(
        z.object({
          category: z.string().default("general"),
          title: z.string().min(1).max(255),
          body: z.string().min(1),
        })
      )
      .mutation(({ ctx, input }) => {
        return db.createCommunityPost({
          userId: ctx.user.id,
          authorName: ctx.user.name || "Anonymous",
          category: input.category as any,
          title: input.title,
          body: input.body,
        });
      }),

    // Get replies for a post
    replies: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(({ input }) => {
        return db.getPostReplies(input.postId);
      }),

    // Reply to a post (requires auth)
    createReply: protectedProcedure
      .input(
        z.object({
          postId: z.number(),
          body: z.string().min(1),
        })
      )
      .mutation(({ ctx, input }) => {
        return db.createReply({
          postId: input.postId,
          userId: ctx.user.id,
          authorName: ctx.user.name || "Anonymous",
          body: input.body,
        });
      }),

    // Like/unlike a post
    togglePostLike: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(({ ctx, input }) => {
        return db.togglePostLike(input.postId, ctx.user.id);
      }),

    // Like/unlike a reply
    toggleReplyLike: protectedProcedure
      .input(z.object({ replyId: z.number() }))
      .mutation(({ ctx, input }) => {
        return db.toggleReplyLike(input.replyId, ctx.user.id);
      }),

    // Get user's likes (for UI state)
    myLikes: protectedProcedure.query(({ ctx }) => {
      return db.getUserLikes(ctx.user.id);
    }),
  }),

  // ── AI Trip Planner ──
  ai: router({
    planTrip: publicProcedure
      .input(
        z.object({
          startLocation: z.string(),
          endLocation: z.string(),
          duration: z.number().min(1).max(90),
          rvType: z.string().optional(),
          rvLength: z.string().optional(),
          budget: z.string().optional(),
          interests: z.array(z.string()).optional(),
          travelers: z.number().optional(),
          pets: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const prompt = `You are an expert RV trip planner. Plan a detailed RV road trip with the following details:

- Start: ${input.startLocation}
- End: ${input.endLocation}
- Duration: ${input.duration} days
${input.rvType ? `- RV Type: ${input.rvType}` : ""}
${input.rvLength ? `- RV Length: ${input.rvLength}` : ""}
${input.budget ? `- Budget: ${input.budget}` : ""}
${input.interests?.length ? `- Interests: ${input.interests.join(", ")}` : ""}
${input.travelers ? `- Travelers: ${input.travelers}` : ""}
${input.pets ? "- Traveling with pets" : ""}

Return a JSON object with this structure:
{
  "tripName": "string - catchy trip name",
  "totalMiles": number,
  "estimatedFuelCost": number,
  "estimatedCampingCost": number,
  "estimatedFoodCost": number,
  "totalEstimatedCost": number,
  "stops": [
    {
      "day": number,
      "location": "City, State",
      "campground": "Campground name",
      "campgroundType": "rv_park|state_park|national_park|boondocking",
      "pricePerNight": number,
      "nights": number,
      "drivingMiles": number,
      "drivingTime": "string like 3h 45m",
      "highlights": ["string - things to do/see"],
      "notes": "string - tips for this stop",
      "latitude": number,
      "longitude": number
    }
  ],
  "tips": ["string - general trip tips"],
  "warnings": ["string - route warnings like low bridges, mountain passes, weather"]
}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert RV trip planner with deep knowledge of campgrounds, RV parks, boondocking spots, and road conditions across the US and Canada. Always return valid JSON." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        try {
          return JSON.parse(content as string);
        } catch {
          return { error: "Failed to parse trip plan", raw: content };
        }
      }),

    // AI-powered personalized recommendations
    recommend: publicProcedure
      .input(
        z.object({
          rvType: z.string().optional(),
          rvLength: z.string().optional(),
          budget: z.string().optional(),
          location: z.string(),
          preferences: z.array(z.string()).optional(),
          pastStays: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const prompt = `Based on the following RV traveler profile, recommend 5 campgrounds they would love:

- Current location: ${input.location}
${input.rvType ? `- RV Type: ${input.rvType}` : ""}
${input.rvLength ? `- RV Length: ${input.rvLength}` : ""}
${input.budget ? `- Budget: ${input.budget}` : ""}
${input.preferences?.length ? `- Preferences: ${input.preferences.join(", ")}` : ""}
${input.pastStays?.length ? `- Past stays they enjoyed: ${input.pastStays.join(", ")}` : ""}

Return a JSON object:
{
  "recommendations": [
    {
      "name": "Campground name",
      "location": "City, State",
      "type": "rv_park|state_park|national_park|boondocking",
      "pricePerNight": number,
      "whyYoullLoveIt": "string - personalized reason",
      "rating": number,
      "bestSeason": "string",
      "hookups": "full|water_electric|electric_only|dry",
      "latitude": number,
      "longitude": number
    }
  ]
}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert RV campground recommender. Return valid JSON with personalized recommendations." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        try {
          return JSON.parse(content as string);
        } catch {
          return { error: "Failed to parse recommendations", raw: content };
        }
      }),
  }),
});
export type AppRouter = typeof appRouter;
