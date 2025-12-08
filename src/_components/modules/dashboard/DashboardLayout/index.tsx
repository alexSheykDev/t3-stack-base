"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, Building2, CalendarDays, ShieldCheck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import UserMenu from "../../user/UserMenu";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  adminOnly?: boolean;
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isAdmin = session?.user && session.user.role === "ADMIN";

  const nav = useMemo<NavItem[]>(
    () => [
      { href: "/appartments", label: "Apartments", icon: Building2 },
      { href: "/bookings/my", label: "My bookings", icon: CalendarDays },
      {
        href: "/admin/appartments",
        label: "Admin • Apartments",
        icon: ShieldCheck,
        adminOnly: true,
        badge: "admin",
      },
      /* { href: "/settings", label: "Settings", icon: Settings }, */
    ],
    [],
  );

  const filtered = nav.filter((n) => (n.adminOnly ? isAdmin : true));

  return (
    <div className="flex min-h-dvh">
      <aside className="bg-background hidden w-72 border-r md:block">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <div className="bg-primary/10 size-8 rounded-lg" />
          <div className="font-semibold">My App</div>
        </div>
        <ScrollArea className="h-[calc(100dvh-4rem)] px-2">
          <nav className="mt-3 space-y-1">
            {filtered.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    active ? "bg-muted font-medium" : "hover:bg-muted",
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="outline" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex h-16 items-center gap-2 border-b px-4">
                <div className="bg-primary/10 size-8 rounded-lg" />
                <div className="font-semibold">My App</div>
              </div>
              <ScrollArea className="h-[calc(100dvh-4rem)] px-2 py-3">
                <nav className="space-y-1">
                  {filtered.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                          active ? "bg-muted font-medium" : "hover:bg-muted",
                        )}
                      >
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge variant="outline" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <div className="text-muted-foreground ml-1 truncate text-sm">
            {pathname === "/dashboard"
              ? "Dashboard"
              : pathname.replace("/", "").replaceAll("/", " / ")}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <UserMenu />
          </div>
        </header>

        <Separator />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
