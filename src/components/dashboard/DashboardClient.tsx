"use client";

import { useState, useTransition } from "react";
import type { Service, SubService } from "@/lib/types";
import {
  createService,
  updateService,
  deleteService,
  toggleService,
  moveService,
  createSubService,
  updateSubService,
  deleteSubService,
  moveSubService,
  updatePin,
} from "@/lib/actions";

// ── Shared styles ─────────────────────────────────────────────────────

const inputCls =
  "border border-spa-border rounded-lg px-3 py-2 text-spa-text text-sm bg-white " +
  "focus:outline-none focus:border-spa-accent transition-colors placeholder:text-spa-muted";

const btnPrimary =
  "h-9 px-4 rounded-lg bg-spa-accent text-white text-sm font-medium " +
  "hover:opacity-90 transition-opacity disabled:opacity-40 whitespace-nowrap";

const btnOutline =
  "h-9 px-4 rounded-lg border border-spa-border text-spa-text text-sm font-medium " +
  "hover:border-spa-muted transition-colors disabled:opacity-40 whitespace-nowrap";

const btnGhost =
  "h-8 px-2.5 rounded-md text-spa-muted text-sm hover:text-spa-text " +
  "transition-colors disabled:opacity-40";

const btnDanger =
  "h-8 px-2.5 rounded-md text-red-400 text-sm hover:text-red-600 " +
  "transition-colors disabled:opacity-40";

const btnArrow =
  "h-7 w-7 rounded flex items-center justify-center text-spa-muted " +
  "hover:text-spa-text hover:bg-spa-surface transition-colors disabled:opacity-30 text-base";

// ── Helpers ───────────────────────────────────────────────────────────

function toMinutes(seconds: number): number {
  return Math.round((seconds / 60) * 10) / 10;
}

// ── SubRow ────────────────────────────────────────────────────────────

interface SubRowProps {
  sub: SubService;
  isFirst: boolean;
  isLast: boolean;
  isPending: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
}

function SubRow({ sub, isFirst, isLast, isPending, onEdit, onDelete, onMove }: SubRowProps) {
  return (
    <div className="flex items-center gap-2 py-2.5 px-3 rounded-lg hover:bg-spa-surface group transition-colors">
      <span className="flex-1 text-sm text-spa-text leading-snug">{sub.name}</span>
      <span className="text-sm text-spa-muted tabular-nums shrink-0 w-14 text-right">
        {toMinutes(sub.durationSeconds)} min
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          className={btnArrow}
          disabled={isFirst || isPending}
          onClick={() => onMove("up")}
          title="Move up"
        >
          ↑
        </button>
        <button
          className={btnArrow}
          disabled={isLast || isPending}
          onClick={() => onMove("down")}
          title="Move down"
        >
          ↓
        </button>
        <button className={btnGhost} disabled={isPending} onClick={onEdit}>
          Edit
        </button>
        <button className={btnDanger} disabled={isPending} onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

// ── SubForm ───────────────────────────────────────────────────────────

interface SubFormProps {
  defaultName?: string;
  defaultMinutes?: number;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (fd: FormData) => void;
  onCancel: () => void;
}

function SubForm({
  defaultName = "",
  defaultMinutes,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: SubFormProps) {
  return (
    <form
      className="flex items-center gap-2 py-2 px-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
    >
      <input
        name="name"
        placeholder="Step name"
        defaultValue={defaultName}
        required
        autoFocus
        className={`${inputCls} flex-1 min-w-0`}
      />
      <input
        name="minutes"
        type="number"
        placeholder="Min"
        defaultValue={defaultMinutes}
        min="0.5"
        step="0.5"
        required
        className={`${inputCls} w-20 shrink-0`}
      />
      <span className="text-sm text-spa-muted shrink-0">min</span>
      <button type="submit" className={btnPrimary} disabled={isPending}>
        {submitLabel}
      </button>
      <button type="button" className={btnOutline} onClick={onCancel} disabled={isPending}>
        Cancel
      </button>
    </form>
  );
}

// ── ServiceForm ───────────────────────────────────────────────────────

interface ServiceFormProps {
  defaultName?: string;
  defaultTagline?: string;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (fd: FormData) => void;
  onCancel: () => void;
}

function ServiceForm({
  defaultName = "",
  defaultTagline = "",
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  return (
    <form
      className="rounded-2xl border-2 border-spa-accent bg-spa-accentLight p-5 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
    >
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="flex-1">
          <label className="block text-xs font-medium text-spa-muted mb-1.5 uppercase tracking-wide">
            Service Name
          </label>
          <input
            name="name"
            placeholder="e.g. Liora Signature"
            defaultValue={defaultName}
            required
            autoFocus
            className={`${inputCls} w-full`}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-spa-muted mb-1.5 uppercase tracking-wide">
            Tagline
          </label>
          <input
            name="tagline"
            placeholder="e.g. 60 min · Full ritual"
            defaultValue={defaultTagline}
            className={`${inputCls} w-full`}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className={btnOutline} onClick={onCancel} disabled={isPending}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary} disabled={isPending}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

// ── PinChangeForm ─────────────────────────────────────────────────────

function PinChangeForm() {
  const [newPin, setNewPin] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!/^\d{4}$/.test(newPin)) return;
    startTransition(async () => {
      await updatePin(newPin);
      setNewPin("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={newPin}
        onChange={(e) => {
          setNewPin(e.target.value.replace(/\D/g, ""));
          setSaved(false);
        }}
        placeholder="New 4-digit PIN"
        className={`${inputCls} w-36 text-center tracking-widest font-mono`}
      />
      <button
        onClick={handleSave}
        disabled={newPin.length !== 4 || isPending}
        className={btnPrimary}
      >
        {saved ? "Saved!" : "Save PIN"}
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────

interface Props {
  services: (Service & { enabled: boolean })[];
}

export default function DashboardClient({ services }: Props) {
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [addingSubTo, setAddingSubTo] = useState<string | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Wrap every server action call so we get a pending indicator
  const run = (fn: () => Promise<void>) => {
    startTransition(async () => {
      await fn();
    });
  };

  // Close all open forms (used when opening a conflicting form)
  const closeAll = () => {
    setEditingServiceId(null);
    setEditingSubId(null);
    setAddingSubTo(null);
    setShowAddService(false);
  };

  return (
    <div className="space-y-4">
      {services.map((service, idx) => (
        <div
          key={service.id}
          className={`rounded-2xl border bg-white overflow-hidden transition-opacity ${
            service.enabled ? "border-spa-border" : "border-spa-border opacity-50"
          }`}
        >
          {/* ── Service header ── */}
          {editingServiceId === service.id ? (
            <div className="p-4">
              <ServiceForm
                defaultName={service.name}
                defaultTagline={service.tagline}
                submitLabel="Save"
                isPending={isPending}
                onCancel={() => setEditingServiceId(null)}
                onSubmit={(fd) =>
                  run(async () => {
                    await updateService(service.id, fd);
                    setEditingServiceId(null);
                  })
                }
              />
            </div>
          ) : (
            <div className="flex items-start justify-between px-5 py-4">
              <div className="min-w-0 mr-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-spa-text leading-tight">
                    {service.name}
                  </h2>
                  {!service.enabled && (
                    <span className="text-xs font-medium text-spa-muted bg-spa-surface border border-spa-border rounded px-1.5 py-0.5">
                      Hidden
                    </span>
                  )}
                </div>
                {service.tagline && (
                  <p className="text-sm text-spa-muted mt-0.5">{service.tagline}</p>
                )}
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  className={btnArrow}
                  disabled={idx === 0 || isPending}
                  onClick={() => run(() => moveService(service.id, "up"))}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  className={btnArrow}
                  disabled={idx === services.length - 1 || isPending}
                  onClick={() => run(() => moveService(service.id, "down"))}
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  className={btnGhost}
                  disabled={isPending}
                  onClick={() => run(() => toggleService(service.id))}
                >
                  {service.enabled ? "Hide" : "Show"}
                </button>
                <button
                  className={btnGhost}
                  disabled={isPending}
                  onClick={() => {
                    closeAll();
                    setEditingServiceId(service.id);
                  }}
                >
                  Edit
                </button>
                <button
                  className={btnDanger}
                  disabled={isPending}
                  onClick={() => {
                    if (!confirm(`Delete "${service.name}" and all its steps?`)) return;
                    run(() => deleteService(service.id));
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* ── Divider ── */}
          <div className="border-t border-spa-border mx-4" />

          {/* ── Sub-services ── */}
          <div className="px-2 py-2">
            {service.subServices.length === 0 && (
              <p className="text-sm text-spa-muted px-3 py-2 italic">No steps yet.</p>
            )}

            {service.subServices.map((sub, subIdx) =>
              editingSubId === sub.id ? (
                <SubForm
                  key={sub.id}
                  defaultName={sub.name}
                  defaultMinutes={toMinutes(sub.durationSeconds)}
                  submitLabel="Save"
                  isPending={isPending}
                  onCancel={() => setEditingSubId(null)}
                  onSubmit={(fd) =>
                    run(async () => {
                      await updateSubService(sub.id, fd);
                      setEditingSubId(null);
                    })
                  }
                />
              ) : (
                <SubRow
                  key={sub.id}
                  sub={sub}
                  isFirst={subIdx === 0}
                  isLast={subIdx === service.subServices.length - 1}
                  isPending={isPending}
                  onEdit={() => {
                    closeAll();
                    setEditingSubId(sub.id);
                  }}
                  onDelete={() => {
                    if (!confirm(`Delete step "${sub.name}"?`)) return;
                    run(() => deleteSubService(sub.id));
                  }}
                  onMove={(dir) => run(() => moveSubService(sub.id, dir))}
                />
              )
            )}

            {/* Add sub-service form */}
            {addingSubTo === service.id ? (
              <SubForm
                submitLabel="Add Step"
                isPending={isPending}
                onCancel={() => setAddingSubTo(null)}
                onSubmit={(fd) =>
                  run(async () => {
                    await createSubService(service.id, fd);
                    setAddingSubTo(null);
                  })
                }
              />
            ) : (
              <button
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-spa-accent font-medium hover:opacity-70 transition-opacity disabled:opacity-40"
                disabled={isPending}
                onClick={() => {
                  closeAll();
                  setAddingSubTo(service.id);
                }}
              >
                + Add Step
              </button>
            )}
          </div>
        </div>
      ))}

      {/* ── Add service ── */}
      {showAddService ? (
        <ServiceForm
          submitLabel="Add Service"
          isPending={isPending}
          onCancel={() => setShowAddService(false)}
          onSubmit={(fd) =>
            run(async () => {
              await createService(fd);
              setShowAddService(false);
            })
          }
        />
      ) : (
        <button
          className={`${btnPrimary} mt-2`}
          disabled={isPending}
          onClick={() => {
            closeAll();
            setShowAddService(true);
          }}
        >
          + Add Service
        </button>
      )}

      {/* ── PIN ── */}
      <div className="mt-12 pt-8 border-t border-spa-border">
        <h2 className="text-sm font-medium text-spa-muted uppercase tracking-widest mb-4">
          Dashboard PIN
        </h2>
        <PinChangeForm />
      </div>
    </div>
  );
}
