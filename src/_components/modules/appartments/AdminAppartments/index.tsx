"use client";

import * as React from "react";
import Image from "next/image";
import { api } from "~/trpc/react";
import { Switch } from "~/components/ui/switch";
import CreateApartmentDialog from "../CreateAppartmentDialog";
import EditApartmentDialog from "../EditAppartmentDialog";

export default function AdminApartments() {
  const utils = api.useUtils();
  const [apartments] = api.apartment.listAll.useSuspenseQuery();

  const publishMut = api.apartment.publish.useMutation({
    onSuccess: async () => utils.apartment.listAll.invalidate(),
  });
  const unpublishMut = api.apartment.unpublish.useMutation({
    onSuccess: async () => utils.apartment.listAll.invalidate(),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Apartments</h1>
        <CreateApartmentDialog />
      </div>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Max Guests</th>
              <th className="p-3 text-left">Published</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apartments?.map((apartment) => (
              <tr key={apartment.id} className="border-t">
                <td className="p-3">
                  {apartment.imageUrl ? (
                    <Image
                      src={apartment.imageUrl}
                      alt={apartment.title}
                      width={64}
                      height={48}
                      className="h-12 w-16 rounded object-cover"
                    />
                  ) : (
                    <div className="bg-muted h-12 w-16 rounded" />
                  )}
                </td>
                <td className="p-3">{apartment.title}</td>
                <td className="max-w-[420px] p-3">{apartment.description}</td>
                <td className="p-3">{apartment.price}</td>
                <td className="p-3">{apartment.maxGuests}</td>
                <td className="p-3">
                  <Switch
                    checked={apartment.isPublished}
                    onCheckedChange={async (checked) => {
                      if (checked)
                        await publishMut.mutateAsync({ id: apartment.id });
                      else await unpublishMut.mutateAsync({ id: apartment.id });
                    }}
                    aria-label={apartment.isPublished ? "Unpublish" : "Publish"}
                  />
                </td>
                <td className="p-3 text-right">
                  <EditApartmentDialog apartment={apartment} />
                </td>
              </tr>
            ))}

            {apartments?.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-muted-foreground p-6 text-center"
                >
                  No apartments yet — create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
