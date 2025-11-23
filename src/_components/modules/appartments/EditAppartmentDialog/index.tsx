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

type ApartmentFormValues = {
  title: string;
  description: string;
  imageUrl?: string;
  price: string;
  maxGuests: string;
};

type ApartmentRow = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  price: number;
  maxGuests: number;
  isPublished: boolean;
};

function EditApartmentDialog({
  apartment,
  onUpdated,
  trigger,
}: {
  apartment: ApartmentRow;
  onUpdated?: () => void;
  trigger?: React.ReactNode;
}) {
  const utils = api.useUtils();
  const updateMut = api.appartment.update.useMutation({
    onSuccess: async () => {
      await utils.appartment.listAll.invalidate();
      onUpdated?.();
    },
  });

  const [open, setOpen] = React.useState(false);

  const initial: ApartmentFormValues = {
    title: apartment.title,
    description: apartment.description,
    imageUrl: apartment.imageUrl ?? "",
    price: String(apartment.price ?? ""),
    maxGuests: String(apartment.maxGuests ?? ""),
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            Edit
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit apartment</DialogTitle>
        </DialogHeader>

        <ApartmentForm
          initial={initial}
          submitting={updateMut.isPending}
          submitLabel="Save"
          onSubmit={async (values) => {
            await updateMut.mutateAsync({
              id: apartment.id,
              data: {
                title: values.title.trim(),
                description: values.description.trim(),
                imageUrl: values.imageUrl?.trim() ?? undefined,
                price: Number(values.price),
                maxGuests: Number(values.maxGuests),
              },
            });
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default EditApartmentDialog;
