import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, ChevronRight, Trash2, ShieldOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchMyBlockedMembers, unblockUser, type BlockedMember } from "@/lib/blocks";
import { registerForPush, unregisterPush } from "@/lib/push";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [theme, setTheme] = useState("system");
  const [saving, setSaving] = useState(false);
  const [blockedMembers, setBlockedMembers] = useState<BlockedMember[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setEmailNotif(data.email_notifications_enabled);
          setPushNotif(data.push_notifications_enabled);
          setTheme(data.theme_preference ?? "system");
        }
      });
    fetchMyBlockedMembers(user.id).then(setBlockedMembers);
  }, [user]);

  const onUnblock = async (blockedId: string) => {
    if (!user) return;
    try {
      await unblockUser(user.id, blockedId);
      setBlockedMembers((prev) => prev.filter((b) => b.blocked_user_id !== blockedId));
      toast.success("Member unblocked");
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't unblock");
    }
  };

  const onDeleteAccount = async () => {
    setDeleting(true);
    try {
      // RPC (not a server route) so it works identically on web and in the
      // native WebView, where a relative /api/* URL wouldn't reach the server.
      const { error } = await (supabase as any).rpc("delete_own_account");
      if (error) { toast.error(error.message ?? "Could not delete account. Please try again."); return; }
      await signOut();
      toast.success("Your account has been deleted.");
      navigate({ to: "/" });
    } catch {
      toast.error("Could not delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const onTogglePush = async (v: boolean) => {
    setPushNotif(v);
    if (!user) return;
    // Persist immediately so the choice is authoritative for the push sender.
    await supabase.from("user_preferences").upsert(
      { user_id: user.id, push_notifications_enabled: v },
      { onConflict: "user_id" },
    );
    try {
      if (v) { await registerForPush(user.id); } else { await unregisterPush(user.id); }
    } catch { /* native-only; ignore on web */ }
    toast.success(v ? "Push notifications on" : "Push notifications off");
  };

  const onSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        email_notifications_enabled: emailNotif,
        push_notifications_enabled: pushNotif,
        theme_preference: theme,
      },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Preferences saved");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Account Preferences</h1>
        <p className="text-muted-foreground mt-1">Control how you receive notifications and manage your account.</p>
      </header>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <Row label="Email notifications" hint="Receive activity summaries by email.">
            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
          </Row>
          <Row label="Push notifications" hint="Get notified on your devices about new messages and announcements.">
            <Switch checked={pushNotif} onCheckedChange={onTogglePush} />
          </Row>
          <Link
            to="/settings/notifications"
            className="flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-primary/10 text-primary grid place-items-center">
                <Bell className="size-4" />
              </div>
              <div>
                <div className="text-sm font-medium">In-app notification preferences</div>
                <div className="text-xs text-muted-foreground">Choose which updates you want to receive.</div>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      {/* Appearance/theme card hidden: the selector didn't apply a theme
          anywhere, so it was a no-op. Re-enable once theme switching is wired up. */}

      <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save preferences"}</Button>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Blocked members</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {blockedMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You haven't blocked anyone. You can block a member from their profile.
            </p>
          ) : (
            blockedMembers.map((b) => (
              <div key={b.blocked_user_id} className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={b.avatar_url ?? undefined} />
                  <AvatarFallback>{(b.full_name ?? "?").slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-medium truncate">{b.full_name ?? "Member"}</span>
                <Button size="sm" variant="outline" onClick={() => onUnblock(b.blocked_user_id)}>
                  <ShieldOff className="size-4 mr-1.5" />Unblock
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle>About &amp; legal</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Link to="/terms" className="flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-accent transition-colors text-sm font-medium">
            Terms of Use <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          <Link to="/privacy" className="flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-accent transition-colors text-sm font-medium">
            Privacy Policy <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          <Link to="/account-deletion" className="flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-accent transition-colors text-sm font-medium">
            Account &amp; data deletion <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-destructive/40">
        <CardHeader><CardTitle className="text-destructive">Danger zone</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm"><Trash2 className="size-4 mr-1.5" />Delete account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes your account, profile, posts, messages, and all
                  associated data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteAccount}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting…" : "Delete my account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      {children}
    </div>
  );
}