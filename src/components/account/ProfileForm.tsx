"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateProfile } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfileForm({ name }: { name: string }) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const result = await updateProfile({ name: value });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error ?? "Could not update your profile.");
      return;
    }

    toast.success("Profile updated");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="profile-name">Full name</Label>
        <Input
          id="profile-name"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="name"
        />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
