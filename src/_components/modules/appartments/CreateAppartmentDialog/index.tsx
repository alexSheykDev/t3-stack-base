"use client";

import * as React from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import ApartmentForm from "../AppartmentForm";

function CreateApartmentDialog({ onCreated }: { onCreated?: () => void }) {
  const utils = api.useUtils();
  const createMut = api.appartment.create.useMutation({
    onSuccess: async () => {
      await utils.appartment.listAll.invalidate();
      onCreated?.();
    },
  });

  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New apartment</DialogTitle>
        </DialogHeader>

        <ApartmentForm
          initial={{
            title: "",
            description: "",
            imageUrl: "",
            price: "",
            maxGuests: "",
          }}
          submitting={createMut.isPending}
          submitLabel="Create"
          onSubmit={async (values) => {
            await createMut.mutateAsync({
              title: values.title.trim(),
              description: values.description.trim(),
              imageUrl: values.imageUrl?.trim() ?? undefined,
              price: Number(values.price),
              maxGuests: Number(values.maxGuests),
            });
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default CreateApartmentDialog;
