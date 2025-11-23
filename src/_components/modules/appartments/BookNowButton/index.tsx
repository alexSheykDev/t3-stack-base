"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function BookNowButton({ apartmentId }: { apartmentId: string }) {
  const router = useRouter();

  const onClick = () => {
    router.push(`/book?apartmentId=${apartmentId}`);
  };

  return <Button onClick={onClick}>Book now</Button>;
}
