"use client";

import { useActionState, useState } from "react";
import { updateProfile, type ProfileState } from "@/app/actions/profile";
import { CheckIcon } from "@/components/icons";

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, {});
  const [value, setValue] = useState(name);
  const savedName = state.saved ? state.name! : name;
  const changed = value.trim() !== savedName;

  return (
    <form action={action} className="card-pop flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-base font-bold">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={80}
          placeholder="Your full name"
          className="field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "name-error" : undefined}
        />
        {state.error && (
          <span id="name-error" role="alert" className="text-sm font-bold text-danger">
            {state.error}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span id="phone-lbl" className="text-base font-bold">
          Mobile number
        </span>
        <span
          aria-labelledby="phone-lbl"
          className="flex h-[52px] items-center rounded-[14px] bg-hairline px-3.5 text-[17px] font-bold tracking-[0.5px] text-ink"
        >
          +91 {phone.slice(0, 5)} {phone.slice(5)}
        </span>
        <span className="text-[13px] text-ink-muted">You sign in with this number, so it can&apos;t be changed here.</span>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="bp bp-teal bp-md grow" disabled={pending || !changed || !value.trim()}>
          <span>{pending ? "Saving…" : "Save"}</span>
        </button>
        {state.saved && !changed && (
          <span role="status" className="flex items-center gap-1 text-sm font-bold text-success">
            <CheckIcon size={16} /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
