import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { canDeleteSignup } from "@/lib/owner-rules";

export const deletePendingSignup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !allowed) throw new Error("Only approved owners can delete sign-ups");
    const { data: targetOwner, error: targetError } = await context.supabase.rpc("has_role", { _user_id: data.userId, _role: "admin" });
    if (targetError || !canDeleteSignup(targetOwner === true)) throw new Error("Approved owners cannot be deleted");
    const { error: lockError } = await context.supabase.rpc("prepare_pending_signup_deletion", { target: data.userId });
    if (lockError) throw new Error(lockError.message);
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
      if (error) throw new Error("Could not delete this sign-up. Please try again.");
    } finally {
      await context.supabase.rpc("cancel_pending_signup_deletion", { target: data.userId });
    }
    return { ok: true };
  });

export const setUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ userId: z.string().uuid(), password: z.string().min(8).max(72) }))
  .handler(async ({ data, context }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !allowed) throw new Error("Only approved owners can set passwords");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
