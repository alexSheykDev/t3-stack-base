import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";

const dateRange = z.object({
  apartmentId: z.string().cuid(),
  start: z.coerce.date(),
  end: z.coerce.date(),
});

export const bookingRouter = createTRPCRouter({
  isApartmentAvailable: protectedProcedure
    .input(dateRange)
    .query(async ({ input }) => {
      const overlapping = await db.booking.findFirst({
        where: {
          apartmentId: input.apartmentId,
          status: "ACTIVE",
          AND: [
            { startDate: { lt: input.end } },
            { endDate: { gt: input.start } },
          ],
        },
        select: { id: true },
      });
      return { available: !overlapping };
    }),

  createBooking: protectedProcedure
    .input(
      dateRange.refine((v) => v.end > v.start, {
        message: "End must be after start",
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const apt = await db.apartment.findFirst({
        where: { id: input.apartmentId, isPublished: true },
        select: { id: true },
      });
      if (!apt)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Apartment not found",
        });

      const overlap = await db.booking.findFirst({
        where: {
          apartmentId: input.apartmentId,
          status: "ACTIVE",
          AND: [
            { startDate: { lt: input.end } },
            { endDate: { gt: input.start } },
          ],
        },
        select: { id: true },
      });
      if (overlap) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Dates are not available",
        });
      }

      const booking = await db.booking.create({
        data: {
          apartmentId: input.apartmentId,
          userId: ctx.session.user.id,
          startDate: input.start,
          endDate: input.end,
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          apartment: { select: { id: true, title: true } },
        },
      });

      return booking;
    }),

  listMyBookings: protectedProcedure.query(({ ctx }) =>
    db.booking.findMany({
      where: { userId: ctx.session.user.id, status: "ACTIVE" },
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        apartment: { select: { id: true, title: true, imageUrl: true } },
      },
    }),
  ),

  cancelBooking: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.booking.findUnique({ where: { id: input.id } });
      if (!existing || existing.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await db.booking.update({
        where: { id: input.id },
        data: { status: "CANCELLED" },
      });
      return { ok: true };
    }),
  listBookingsByApartment: publicProcedure
    .input(z.object({ apartmentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.booking.findMany({
        where: { apartmentId: input.apartmentId },
        select: { id: true, startDate: true, endDate: true },
        orderBy: { startDate: "asc" },
      });
    }),
});
