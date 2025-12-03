"use client";

import { useState } from "react";
import { type DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { skipToken } from '@tanstack/react-query';

type Props = { apartmentId: string };

export default function BookingDialog({ apartmentId }: Props) {
  const utils = api.useUtils();
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  const hasRange = !!(range?.from && range?.to);

const { data: availability } = api.booking.isApartmentAvailable.useQuery(
  hasRange
    ? { apartmentId, start: range.from!, end: range.to! }
    : skipToken,
  { enabled: hasRange }
);

  const createMut = api.booking.createBooking.useMutation({
    onSuccess: async () => {
      toast.success("Booking confirmed");
      await utils.booking.listMyBookings.invalidate();
    },
    onError: (e) => toast.error(e.message ?? "Failed to book"),
  });

  const canConfirm =
    !!range?.from &&
    !!range?.to &&
    (availability?.available ?? false) &&
    !createMut.isPending;

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
          />

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {range?.from && range?.to
                ? availability?.available
                  ? "Dates available"
                  : "Dates unavailable"
                : "Select a start and end date"}
            </div>

            <Button
              onClick={() => {
                if (!range?.from || !range?.to) return;
                createMut.mutate({
                  apartmentId,
                  start: range.from,
                  end: range.to,
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
