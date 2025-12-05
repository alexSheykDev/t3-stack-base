import Link from "next/link";
import Image from "next/image";
import { api } from "~/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export const metadata = { title: "Apartments" };

export default async function ApartmentsPage() {
  const items = await api.apartment.listPublished();

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-semibold">Apartments</h1>

      {items.length === 0 ? (
        <p className="text-muted-foreground">No published apartments yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <Link key={a.id} href={`/appartments/${a.id}`}>
              <Card className="h-full overflow-hidden transition hover:shadow-md">
                {a.imageUrl ? (
                  <Image
                    src={a.imageUrl}
                    alt={a.title}
                    width={800}
                    height={520}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="bg-muted h-40 w-full" />
                )}
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="line-clamp-1">{a.title}</span>
                    <Badge variant="secondary">Published</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {a.description}
                  </p>
                  <div className="text-sm">
                    <span className="font-medium">${a.price}</span>{" "}
                    <span className="text-muted-foreground">
                      / night • max {a.maxGuests} guests
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
