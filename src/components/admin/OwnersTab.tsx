import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check, KeyRound, Loader2, Trash2, UserMinus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deletePendingSignup, setUserPassword } from "@/lib/owners.functions";
import { friendlyError } from "@/lib/data";
import { canRemoveOwner } from "@/lib/owner-rules";
import { Button } from "@/components/ui/button";

type Member = { user_id: string; email: string; created_at: string; is_owner: boolean };

export function OwnersTab() {
  const qc = useQueryClient();
  const setPw = useServerFn(setUserPassword);
  const deleteSignup = useServerFn(deletePendingSignup);
  const [busy, setBusy] = useState(false);
  const team = useQuery({ queryKey: ["team"], queryFn: async () => {
    const { data, error } = await supabase.rpc("team_list");
    if (error) throw error;
    return data as Member[];
  }});
  const owners = team.data?.filter((m) => m.is_owner) ?? [];
  const pending = team.data?.filter((m) => !m.is_owner) ?? [];

  async function run(fn: () => Promise<void>, msg: string) {
    setBusy(true);
    try { await fn(); toast.success(msg); await qc.invalidateQueries({ queryKey: ["team"] }); }
    catch (e) { toast.error(friendlyError(e)); }
    finally { setBusy(false); }
  }
  const approve = (m: Member) => run(async () => { const { error } = await supabase.rpc("owners_approve", { target: m.user_id }); if (error) throw error; }, `${m.email} approved.`);
  const removePending = (m: Member) => {
    if (!window.confirm(`Permanently delete the pending sign-up for ${m.email}? They will need to sign up again to request access.`)) return;
    void run(async () => { await deleteSignup({ data: { userId: m.user_id } }); }, "Pending sign-up deleted.");
  };
  const revoke = (m: Member) => {
    if (!window.confirm(`Revoke owner access for ${m.email}?`)) return;
    run(async () => { const { error } = await supabase.rpc("owners_revoke", { target: m.user_id }); if (error) throw error; await qc.invalidateQueries({ queryKey: ["is-admin"] }); }, `${m.email} moved back to pending.`);
  };
  const password = (m: Member) => {
    const pw = window.prompt(`New password for ${m.email} (at least 8 characters):`);
    if (pw === null) return;
    if (pw.length < 8) return void toast.error("Password must be at least 8 characters.");
    run(async () => { await setPw({ data: { userId: m.user_id, password: pw } }); }, `Password updated for ${m.email}.`);
  };

  const row = (m: Member, actions: React.ReactNode) => <li key={m.user_id} className="flex flex-wrap items-center justify-between gap-3 py-4">
    <span className="min-w-0 break-all">{m.email}</span><div className="flex flex-wrap gap-2">{actions}</div>
  </li>;

  return <section className="space-y-8">
    {team.isLoading && <Loader2 className="animate-spin" />}
    {team.error && <p className="text-destructive">{friendlyError(team.error)}</p>}
    <div>
      <h2 className="text-xl font-semibold">Pending sign-ups</h2>
      {team.data && !pending.length && <p className="mt-2 text-sm text-muted-foreground">No one is waiting for approval.</p>}
      <ul className="divide-y divide-border">{pending.map((m) => row(m, <>
        <Button size="sm" disabled={busy} onClick={() => approve(m)}><Check />Approve</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => password(m)}><KeyRound />Set password</Button>
        <Button size="sm" variant="destructive" disabled={busy} onClick={() => removePending(m)}><Trash2 />Delete</Button>
      </>))}</ul>
    </div>
    <div>
      <h2 className="text-xl font-semibold">Approved owners</h2>
      <ul className="divide-y divide-border">{owners.map((m) => row(m, <>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => password(m)}><KeyRound />Set password</Button>
        <Button size="sm" variant="ghost" disabled={busy || !canRemoveOwner(owners.length)} title={!canRemoveOwner(owners.length) ? "The last owner cannot be revoked" : "Revoke"} onClick={() => revoke(m)}><UserMinus />Revoke</Button>
      </>))}</ul>
    </div>
  </section>;
}
