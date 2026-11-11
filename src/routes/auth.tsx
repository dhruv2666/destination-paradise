import { brandLogo } from "@/lib/brand";
import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchPublicSettings, qk } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Owner sign in — Destination Paradise Mauritius Car Rental" },
      { name: "description", content: "Sign in to manage Destination Paradise Mauritius Car Rental rental bookings." },
      { property: "og:title", content: "Owner sign in — Destination Paradise Mauritius Car Rental" },
      { property: "og:description", content: "Sign in to manage Destination Paradise Mauritius Car Rental rental bookings." },
    ],
  }),
  component: AuthPage,
});

type InstallPrompt = Event & { prompt: () => Promise<void> };
type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && "ontouchend" in document)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

const STEPS: Record<Platform, string[]> = {
  ios: ["Tap the Share icon.", "Tap “Add to Home Screen”."],
  android: ["Tap ⋮ at the top of Chrome.", "Tap “Install app”, then Add."],
  desktop: [
    "Click the install icon at the right of the address bar.",
    "Or click ⋮ → “Save and share” → “Install page as app”.",
  ],
};

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [install, setInstall] = useState<InstallPrompt | null>(null);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [showSteps, setShowSteps] = useState(false);
  const [installed, setInstalled] = useState(false);
  const settings = useQuery({ queryKey: qk.publicSettings, queryFn: fetchPublicSettings });
  const s = settings.data;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => data.user && navigate({ to: "/admin" }));
    setPlatform(detectPlatform());
    setInstalled(
      window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true,
    );
    const h = (e: Event) => { e.preventDefault(); setInstall(e as InstallPrompt); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) return void toast.error(error.message);
    navigate({ to: "/admin" });
  }

  async function download() {
    if (install) {
      await install.prompt();
      setInstall(null);
      return;
    }
    setShowSteps((v) => !v);
  }

  return (
    <div className="flex min-h-screen flex-col bg-hero p-4">
      <Link to="/" className="flex w-full items-center gap-2 font-display text-base font-bold text-foreground" aria-label="Back to the car list">
        <img src={brandLogo(s?.logo_url)} alt="Destination Paradise Mauritius Car Rental logo" width={144} height={49} loading="eager" fetchPriority="high" decoding="async" className="h-12 w-36 shrink-0 rounded-md object-contain" />
        {s?.company_name ?? "Destination Paradise Mauritius Car Rental"}
      </Link>
      <div className="flex flex-1 items-center justify-center py-6">
        <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-card">
          <h1 className="text-2xl font-bold">{mode === "in" ? "Owner sign in" : "Create account"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "in" ? "Manage bookings, cars and documents." : "An existing owner must approve your account before you get access."}
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5"><Label htmlFor="em">Email</Label><Input id="em" className="h-11" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="pw">Password</Label><Input id="pw" className="h-11" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{mode === "in" ? "Sign in" : "Create account"}</Button>
            <button type="button" className="w-full text-sm text-primary underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
              {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
            {mode === "in" && <p className="text-center text-xs text-muted-foreground">Forgot your password? Ask an owner to set a new one for you.</p>}
          </form>
          <div className="mt-6 border-t border-border pt-4">
            {installed ? (
              <p className="text-center text-sm text-muted-foreground">This app is already installed on this device.</p>
            ) : (
              <>
                <Button variant="outline" className="w-full" onClick={download}><Download />Download app</Button>
                {showSteps && (
                  <ol className="mt-3 space-y-1.5 rounded-lg border border-border bg-muted/40 p-3">
                    {STEPS[platform].map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                    {platform === "ios" && /crios/i.test(navigator.userAgent) && (
                      <li className="pt-1 text-xs font-medium text-foreground">
                        This needs Safari — open the page there first.
                      </li>
                    )}
                  </ol>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}