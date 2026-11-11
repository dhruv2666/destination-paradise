import { brandLogo } from "@/lib/brand";
import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, CalendarDays, Car, Home, Inbox, ListChecks, Loader2, LogOut, MoreHorizontal, Plus, RefreshCw, Settings, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { fetchAllCars, fetchBookings, fetchSettings, qk } from "@/lib/data";
import { BookingCard } from "@/components/admin/BookingCard";
import { BookingDialog } from "@/components/admin/BookingDialog";
import { CalendarTab } from "@/components/admin/CalendarTab";
import { BookingsTab } from "@/components/admin/BookingsTab";
import { CarsTab } from "@/components/admin/CarsTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { OwnersTab } from "@/components/admin/OwnersTab";
import { HomeTab } from "@/components/admin/HomeTab";
import { ExchangeTab } from "@/components/admin/ExchangeTab";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Owners — Destination Paradise Mauritius Car Rental" },
      { name: "description", content: "Manage Destination Paradise Mauritius Car Rental bookings, calendar, cars and documents." },
      { property: "og:title", content: "Owners — Destination Paradise Mauritius Car Rental" },
      { property: "og:description", content: "Manage Destination Paradise Mauritius Car Rental bookings, calendar, cars and documents." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [newOpen, setNewOpen] = useState(false);
  const [tab, setTab] = useState("home");
  const [moreOpen, setMoreOpen] = useState(false);
  const role = useQuery({ queryKey: ["is-admin"], queryFn: async () => (await supabase.rpc("claim_admin")).data === true });
  const settings = useQuery({ queryKey: qk.settings, queryFn: fetchSettings, enabled: role.data === true });
  const cars = useQuery({ queryKey: qk.allCars, queryFn: fetchAllCars, enabled: role.data === true });
  const bookings = useQuery({ queryKey: qk.bookings, queryFn: fetchBookings, enabled: role.data === true });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (role.isLoading) return <Center><Loader2 className="animate-spin" /></Center>;
  if (role.data !== true)
    return (
      <Center>
        <p className="mb-4">Waiting for approval — an owner needs to approve your account before you can see the dashboard.</p>
        <Button onClick={signOut}>Sign out</Button>
      </Center>
    );
  if (!settings.data || !cars.data || !bookings.data) return <Center><Loader2 className="animate-spin" /></Center>;

  const s = settings.data;
  const pending = bookings.data.filter((b) => b.status === "pending");

  const go = (t: string) => { setTab(t); setMoreOpen(false); window.scrollTo({ top: 0 }); };
  const main: [string, string, typeof Home][] = [
    ["home", "Home", Home],
    ["requests", "Requests", Inbox],
    ["calendar", "Calendar", CalendarDays],
    ["bookings", "Bookings", ListChecks],
  ];
  const more: [string, string, typeof Home][] = [["cars", "Cars", Car], ["settings", "Settings", Settings], ["owners", "Team", Users], ["exchange", "EUR → MUR", ArrowLeftRight]];
  const inMore = more.some(([v]) => v === tab);

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-3 py-3 pr-4">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Back to the car list">
            <img src={brandLogo(s.logo_url)} alt="Destination Paradise Mauritius Car Rental logo" width={144} height={49} loading="eager" fetchPriority="high" decoding="async" className="h-12 w-36 shrink-0 object-contain object-left" />
            <span className="hidden font-display text-base font-bold sm:inline">{s.company_name}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="coral" size="tap" onClick={() => setNewOpen(true)}><Plus /> New booking</Button>
            <Button variant="ghost" size="icon" className="h-11 w-11" onClick={signOut} aria-label="Sign out"><LogOut /></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5">
        {tab === "home" && <HomeTab bookings={bookings.data} cars={cars.data} go={go} />}
        {tab === "requests" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-base font-bold">
                Requests
                <span className="ml-1 text-sm font-normal text-muted-foreground">({pending.length})</span>
              </p>
              <Button variant="outline" size="sm" onClick={() => bookings.refetch()} disabled={bookings.isFetching} aria-label="Refresh requests">
                <RefreshCw className={cn("h-4 w-4", bookings.isFetching && "animate-spin")} />
                {bookings.isFetching ? "Refreshing" : "Refresh"}
              </Button>
            </div>
            {pending.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">No pending requests.</p>
            ) : (
              pending.map((b) => <BookingCard key={b.id} booking={b} settings={s} cars={cars.data} />)
            )}
          </div>
        )}
        {tab === "calendar" && <CalendarTab bookings={bookings.data} />}
        {tab === "bookings" && <BookingsTab bookings={bookings.data} cars={cars.data} settings={s} />}
        {tab === "cars" && <CarsTab cars={cars.data} currency={s.currency} />}
        {tab === "settings" && <SettingsTab settings={s} />}
        {tab === "owners" && <OwnersTab />}
        {tab === "exchange" && <ExchangeTab />}
      </main>

      {moreOpen && <button aria-label="Close menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setMoreOpen(false)} />}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        {moreOpen && (
          <div className="absolute bottom-full right-2 mb-2 w-44 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            {more.map(([v, l, Icon]) => (
              <Button variant="ghost" key={v} onClick={() => go(v)} className={cn("h-auto w-full justify-start rounded-none px-4 py-3 text-left text-sm", tab === v && "bg-accent text-primary font-semibold")}><Icon className="h-4 w-4 shrink-0" />{l}</Button>
            ))}
          </div>
        )}
        <div className="mx-auto grid max-w-5xl grid-cols-5">
          {main.map(([v, l, Icon]) => (
            <Button variant="ghost" key={v} onClick={() => go(v)} className={cn("relative h-16 flex-col gap-1 rounded-none py-2 text-xs", tab === v ? "border-t-2 border-primary bg-accent/60 text-primary" : "text-muted-foreground")}>
              <Icon className="h-5 w-5" />
              {l}
              {v === "requests" && pending.length > 0 && (
                <span className="absolute right-[22%] top-1 rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">{pending.length}</span>
              )}
            </Button>
          ))}
          <Button variant="ghost" onClick={() => setMoreOpen((o) => !o)} className={cn("h-16 flex-col gap-1 rounded-none py-2 text-xs", inMore || moreOpen ? "border-t-2 border-primary bg-accent/60 text-primary" : "text-muted-foreground")}>
            <MoreHorizontal className="h-5 w-5" />
            More
          </Button>
        </div>
      </nav>

      <BookingDialog open={newOpen} onOpenChange={setNewOpen} cars={cars.data} settings={s} />
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">{children}</div>;
}
