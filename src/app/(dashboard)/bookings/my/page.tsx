import MyBookings from "~/_components/modules/appartments/MyBookings";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Page() {
  const session = await auth();

  if (session?.user) {
    void api.booking.listMyBookings.prefetch();
  }
  return <HydrateClient><MyBookings /></HydrateClient>;
}
