"use client";

import Image from "next/image";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";

export default function MyBookings() {
  const utils = api.useUtils();

  const { data, isLoading } = api.booking.listMyBookings.useQuery(undefined, {
    suspense: false,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const cancelMut = api.booking.cancelBooking.useMutation({
    onSuccess: async () => {
      toast.success("Booking canceled");
      await utils.booking.listMyBookings.invalidate();
    },
  });

  if (isLoading)
    return <div className="container py-8">Loading your bookings…</div>;

  const bookings = data ?? [];

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-semibold">My bookings</h1>
      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-4 rounded-xl border p-4"
          >
            {b.apartment.imageUrl ? (
              <Image
                src={b.apartment.imageUrl}
                alt={b.apartment.title}
                width={96}
                height={72}
                className="h-18 w-24 rounded object-cover"
              />
            ) : (
              <div className="bg-muted h-18 w-24 rounded" />
            )}

            <div className="flex-1">
              <Link
                className="font-medium hover:underline"
                href={`/apartments/${b.apartment.id}`}
              >
                {b.apartment.title}
              </Link>
              <div className="text-muted-foreground text-sm">
                {format(new Date(b.startDate), "MMM d, yyyy")} –{" "}
                {format(new Date(b.endDate), "MMM d, yyyy")}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => cancelMut.mutate({ id: b.id })}
              disabled={cancelMut.isPending}
            >
              Cancel
            </Button>
          </div>
        ))}
        {bookings.length === 0 && (
          <p className="text-muted-foreground">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}
