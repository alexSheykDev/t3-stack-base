import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

const baseApartment = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(2).max(2_000),
  price: z.number().min(1),
  maxGuests: z.number().min(1),
  imageUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const apartmentRouter = createTRPCRouter({
  listAll: adminProcedure.query(async () => {
    return db.apartment.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),
  listPublished: protectedProcedure.query(async () => {
    return db.apartment.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.apartment.findUnique({
        where: { id: input.id },
      });
    }),

  create: adminProcedure.input(baseApartment).mutation(async ({ input }) => {
    return db.apartment.create({
      data: {
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        price: input.price,
        maxGuests: input.maxGuests,
      },
    });
  }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        data: baseApartment.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      return db.apartment.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  publish: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      return db.apartment.update({
        where: { id: input.id },
        data: { isPublished: true },
      });
    }),

  unpublish: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      return db.apartment.update({
        where: { id: input.id },
        data: { isPublished: false },
      });
    }),

  getAvailability: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        from: z.date(),
        to: z.date(),
      }),
    )
    .query(async ({ input }) => {
      const ranges = await db.booking.findMany({
        where: {
          apartmentId: input.id,
          startDate: { lte: input.to },
          endDate: { gte: input.from },
        },
        select: { startDate: true, endDate: true },
        orderBy: { startDate: "asc" },
      });
      return { booked: ranges };
    }),
});
