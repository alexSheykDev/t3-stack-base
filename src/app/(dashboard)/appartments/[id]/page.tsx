import Image from "next/image";
import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { Badge } from "~/components/ui/badge";
import BookingDialog from "~/_components/modules/appartments/BookingDialog";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const {id: aptId} = await params;
  const apt = await api.apartment.getById({ id: aptId });
  if (!apt) return {};
  return { title: apt.title };
}

export default async function ApartmentDetails({ params }: Props) {
  const {id: aptId} = await params;
  const apt = await api.apartment.getById({ id: aptId });

  if (!apt?.isPublished) return notFound();

  const today = new Date();
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  const availability = await api.apartment.getAvailability({
    id: apt.id,
    from: today,
    to: in30,
  });

  return (
    <div className="container py-8 space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border">
          {apt.imageUrl ? (
            <Image
              src={apt.imageUrl}
              alt={apt.title}
              width={1200}
              height={800}
              className="h-auto w-full object-cover"
              priority
            />
          ) : (
            <div className="aspect-video w-full bg-muted" />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">{apt.title}</h1>
            <Badge variant="secondary">Published</Badge>
          </div>

          <div className="text-lg">
            <span className="font-medium">${apt.price}</span>{" "}
            <span className="text-muted-foreground">/ night</span>
          </div>

          <p className="text-muted-foreground">{apt.description}</p>

          <div className="space-y-2">
            <h2 className="font-medium">Availability (next 30 days)</h2>
            {availability.booked.length === 0 ? (
              <p className="text-sm text-green-600">No bookings—wide open 🎉</p>
            ) : (
              <ul className="text-sm list-disc pl-5">
                {availability.booked.map((r, i) => (
                  <li key={i}>
                    {new Date(r.startDate).toLocaleDateString()} –{" "}
                    {new Date(r.endDate).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <BookingDialog apartmentId={apt.id} />
        </div>
      </div>
    </div>
  );
}
