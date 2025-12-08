"use client";

import * as React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import ImageUploaderBlob from "../ImageUploaderBlob";

export type ApartmentFormValues = {
  title: string;
  description: string;
  imageUrl?: string;
  price: string;
  maxGuests: string;
};

function ApartmentForm({
  initial,
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial: ApartmentFormValues;
  onSubmit: (values: ApartmentFormValues) => Promise<void> | void;
  submitting?: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = React.useState<ApartmentFormValues>(initial);

  React.useEffect(() => setForm(initial), [initial]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((s) => ({ ...s, title: e.target.value }))
          }
          placeholder="Sunny 1BR near center"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={5}
          value={form.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setForm((s) => ({ ...s, description: e.target.value }))
          }
        />
      </div>

      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          inputMode="numeric"
          value={form.price}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((s) => ({ ...s, price: e.target.value }))
          }
          placeholder="Price"
        />
      </div>

      <div>
        <Label htmlFor="maxGuests">Max Guests</Label>
        <Input
          id="maxGuests"
          inputMode="numeric"
          value={form.maxGuests}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((s) => ({ ...s, maxGuests: e.target.value }))
          }
          placeholder="Max Guests"
        />
      </div>

      <ImageUploaderBlob
        value={form.imageUrl ?? null}
        onChange={(url) =>
          setForm((s) => ({ ...s, imageUrl: url ?? undefined }))
        }
      />

      <Button onClick={() => onSubmit(form)} disabled={submitting}>
        {submitting ? `${submitLabel}…` : submitLabel}
      </Button>
    </div>
  );
}

export default ApartmentForm;
