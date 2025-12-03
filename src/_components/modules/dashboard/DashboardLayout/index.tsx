"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, Home, Building2, CalendarDays, Settings, ShieldCheck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

type NavItem = { href: string; label: string; icon: React.ElementType; badge?: string; adminOnly?: boolean };

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isAdmin = session?.user && (session.user).role === "ADMIN";

  const nav = useMemo<NavItem[]>(
    () => [
      { href: "/dashboard", label: "Overview", icon: Home },
      { href: "/apartments", label: "Apartments", icon: Building2 },
      { href: "/my-bookings", label: "My bookings", icon: CalendarDays },
      { href: "/admin/apartments", label: "Admin • Apartments", icon: ShieldCheck, adminOnly: true, badge: "admin" },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
    []
  );

  const filtered = nav.filter((n) => (n.adminOnly ? isAdmin : true));

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden md:block w-64 border-r bg-background">
        <div className="h-16 flex items-center gap-2 px-4 border-b">
          <div className="size-8 rounded-lg bg-primary/10" />
          <div className="font-semibold">YourApp</div>
        </div>
        <ScrollArea className="h-[calc(100dvh-4rem)] px-2">
          <nav className="mt-3 space-y-1">
            {filtered.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    active ? "bg-muted font-medium" : "hover:bg-muted"
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                  {item.badge && <Badge variant="outline" className="ml-auto">{item.badge}</Badge>}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center gap-2 px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <div className="h-16 flex items-center gap-2 px-4 border-b">
                <div className="size-8 rounded-lg bg-primary/10" />
                <div className="font-semibold">YourApp</div>
              </div>
              <ScrollArea className="h-[calc(100dvh-4rem)] px-2 py-3">
                <nav className="space-y-1">
                  {filtered.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                          active ? "bg-muted font-medium" : "hover:bg-muted"
                        )}
                      >
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                        {item.badge && <Badge variant="outline" className="ml-auto">{item.badge}</Badge>}
                      </Link>
                    );
                  })}
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <div className="ml-1 text-sm text-muted-foreground truncate">
            {pathname === "/dashboard" ? "Dashboard" : pathname.replace("/", "").replaceAll("/", " / ")}
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

function UserMenu() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "User";
  const email = session?.user?.email ?? "";
  const image = (session?.user)?.image as string | undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <Avatar className="size-8">
            {image ? <AvatarImage src={image} alt={name} /> : <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>}
          </Avatar>
          <span className="hidden sm:block text-sm">{name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-muted-foreground truncate">{email}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
