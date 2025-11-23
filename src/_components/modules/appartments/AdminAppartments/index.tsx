"use client";

import * as React from "react";
import Image from "next/image";
import { api } from "~/trpc/react";
import { Switch } from "~/components/ui/switch";
import CreateApartmentDialog from "../CreateAppartmentDialog";
import EditApartmentDialog from "../EditAppartmentDialog";

export default function AdminApartments() {
  const utils = api.useUtils();
  const [appartments] = api.appartment.listAll.useSuspenseQuery();

  const publishMut = api.appartment.publish.useMutation({
    onSuccess: async () => utils.appartment.listAll.invalidate(),
  });
  const unpublishMut = api.appartment.unpublish.useMutation({
    onSuccess: async () => utils.appartment.listAll.invalidate(),
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
            {appartments?.map((appartment) => (
              <tr key={appartment.id} className="border-t">
                <td className="p-3">
                  {appartment.imageUrl ? (
                    <Image
                      src={appartment.imageUrl}
                      alt={appartment.title}
                      width={64}
                      height={48}
                      className="h-12 w-16 rounded object-cover"
                    />
                  ) : (
                    <div className="bg-muted h-12 w-16 rounded" />
                  )}
                </td>
                <td className="p-3">{appartment.title}</td>
                <td className="line-clamp-2 max-w-[420px] p-3">
                  {appartment.description}
                </td>
                <td className="p-3">{appartment.price}</td>
                <td className="p-3">{appartment.maxGuests}</td>
                <td className="p-3">
                  <Switch
                    checked={appartment.isPublished}
                    onCheckedChange={async (checked) => {
                      if (checked)
                        await publishMut.mutateAsync({ id: appartment.id });
                      else
                        await unpublishMut.mutateAsync({ id: appartment.id });
                    }}
                    aria-label={
                      appartment.isPublished ? "Unpublish" : "Publish"
                    }
                  />
                </td>
                <td className="p-3 text-right">
                  <EditApartmentDialog apartment={appartment} />
                </td>
              </tr>
            ))}

            {appartments?.length === 0 && (
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
