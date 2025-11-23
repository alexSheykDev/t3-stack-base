import AdminApartments from "~/_components/modules/appartments/AdminAppartments";
import { auth } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";

export default async function Page() {
  const session = await auth();

  if (session?.user) {
    void api.appartment.listAll.prefetch();
  }

  return (
    <HydrateClient>
      <AdminApartments />
    </HydrateClient>
  );
}
