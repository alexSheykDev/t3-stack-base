"use client";

import { useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { addDays, isSameDay, startOfToday } from "date-fns";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { skipToken } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type Props = { apartmentId: string };

export default function BookingDialog({ apartmentId }: Props) {
  const utils = api.useUtils();
  const [range, setRange] = useState<DateRange | undefined>();
  const today = useMemo(() => startOfToday(), []);
  const router = useRouter();

  const { data: booked = [] } = api.booking.listBookingsByApartment.useQuery({
    apartmentId,
  });
  const bookedRanges = useMemo<DateRange[]>(() => {
    return booked.map((b) => {
      const from = new Date(b.startDate);
      const toExclusive = new Date(b.endDate);
      return { from, to: addDays(toExclusive, -1) };
    });
  }, [booked]);

  const hasBoth = !!(range?.from && range?.to);
  const validRange =
    hasBoth &&
    range.from! >= today &&
    range.from! < range.to! &&
    !isSameDay(range.from!, range.to!);

  const { data: availability } = api.booking.isApartmentAvailable.useQuery(
    validRange
      ? { apartmentId, start: range.from!, end: range.to! }
      : skipToken,
    { enabled: validRange },
  );

  const createMut = api.booking.createBooking.useMutation({
    onSuccess: async () => {
      toast.success("Booking confirmed");
      await Promise.all([
        utils.booking.listMyBookings.invalidate(),
        utils.booking.listBookingsByApartment.invalidate({ apartmentId }),
      ]);
      router.push("/bookings/my");
    },
    onError: (e) => toast.error(e.message ?? "Failed to book"),
  });

  const canConfirm =
    validRange && (availability?.available ?? false) && !createMut.isPending;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">Book now</Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Select your stay</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            captionLayout="dropdown"
            disabled={[{ before: today }, ...bookedRanges]}
            fromDate={today}
            modifiers={{ booked: bookedRanges }}
            modifiersClassNames={{
              booked: "bg-destructive/20 text-destructive line-through",
            }}
          />

          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {!hasBoth
                ? "Select a start and end date"
                : !validRange
                  ? range.from! < today
                    ? "Start date cannot be in the past"
                    : "Stay must be at least 1 night"
                  : availability?.available
                    ? "Dates available"
                    : "Dates unavailable"}
            </div>

            <Button
              onClick={() => {
                if (!validRange) return;
                createMut.mutate({
                  apartmentId,
                  start: range.from!,
                  end: range.to!,
                });
              }}
              disabled={!canConfirm}
            >
              {createMut.isPending ? "Booking..." : "Confirm booking"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
