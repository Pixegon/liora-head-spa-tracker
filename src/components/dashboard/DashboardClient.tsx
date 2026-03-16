"use client";

import { useState, useTransition } from "react";
import type { Service, SubService, Category } from "@/lib/types";
import {
  createService,
  updateService,
  deleteService,
  duplicateService,
  toggleService,
  moveServiceInGroup,
  createSubService,
  updateSubService,
  deleteSubService,
  moveSubService,
  createCategory,
  updateCategory,
  deleteCategory,
  moveCategory,
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
  "h-6 w-6 rounded flex items-center justify-center text-spa-muted " +
  "hover:text-spa-text hover:bg-spa-surface transition-colors disabled:opacity-30 text-xs";

function toMinutes(s: number) {
  return Math.round((s / 60) * 10) / 10;
}

// ── Sub-service components ─────────────────────────────────────────────

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
    <div className="flex items-center gap-2 py-3 px-4 hover:bg-spa-surface group transition-colors">
      <div className="flex flex-col gap-0.5 shrink-0">
        <button className={btnArrow} disabled={isFirst || isPending} onClick={() => onMove("up")}>↑</button>
        <button className={btnArrow} disabled={isLast || isPending} onClick={() => onMove("down")}>↓</button>
      </div>
      <span className="flex-1 text-sm text-spa-text leading-snug">{sub.name}</span>
      <span className="text-sm text-spa-muted tabular-nums shrink-0 w-14 text-right">
        {toMinutes(sub.durationSeconds)} min
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button className={btnGhost} disabled={isPending} onClick={onEdit}>Edit</button>
        <button className={btnDanger} disabled={isPending} onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

interface SubFormProps {
  defaultName?: string;
  defaultMinutes?: number;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (fd: FormData) => void;
  onCancel: () => void;
}

function SubForm({ defaultName = "", defaultMinutes, submitLabel, isPending, onSubmit, onCancel }: SubFormProps) {
  return (
    <form
      className="flex items-center gap-2 py-2 px-4"
      onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}
    >
      <input name="name" placeholder="Step name" defaultValue={defaultName} required autoFocus className={`${inputCls} flex-1 min-w-0`} />
      <input name="minutes" type="number" placeholder="Min" defaultValue={defaultMinutes} min="0.5" step="0.5" required className={`${inputCls} w-20 shrink-0`} />
      <span className="text-sm text-spa-muted shrink-0">min</span>
      <button type="submit" className={btnPrimary} disabled={isPending}>{submitLabel}</button>
      <button type="button" className={btnOutline} onClick={onCancel} disabled={isPending}>Cancel</button>
    </form>
  );
}

// ── Category form ──────────────────────────────────────────────────────

interface CategoryFormProps {
  defaultName?: string;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (fd: FormData) => void;
  onCancel: () => void;
}

function CategoryForm({ defaultName = "", submitLabel, isPending, onSubmit, onCancel }: CategoryFormProps) {
  return (
    <form
      className="flex items-center gap-2 py-2 px-4"
      onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}
    >
      <input name="name" placeholder="Category name" defaultValue={defaultName} required autoFocus className={`${inputCls} flex-1 min-w-0`} />
      <button type="submit" className={btnPrimary} disabled={isPending}>{submitLabel}</button>
      <button type="button" className={btnOutline} onClick={onCancel} disabled={isPending}>Cancel</button>
    </form>
  );
}

// ── PIN form ───────────────────────────────────────────────────────────

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
        onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, "")); setSaved(false); }}
        placeholder="New 4-digit PIN"
        className={`${inputCls} w-36 text-center tracking-widest font-mono`}
      />
      <button onClick={handleSave} disabled={newPin.length !== 4 || isPending} className={btnPrimary}>
        {saved ? "Saved!" : "Save PIN"}
      </button>
    </div>
  );
}

// ── Navigation ─────────────────────────────────────────────────────────

type Screen =
  | { type: "services" }
  | { type: "service-edit"; serviceId: string }
  | { type: "categories" }
  | { type: "settings" };

const TAB_LABELS: Record<string, string> = {
  services: "Services",
  categories: "Categories",
  settings: "Settings",
};

function NavTabs({ active, onNavigate }: { active: string; onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex border-b border-spa-border mb-8">
      {(["services", "categories", "settings"] as const).map((t) => (
        <button
          key={t}
          onClick={() => onNavigate({ type: t })}
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            active === t
              ? "border-spa-accent text-spa-accent"
              : "border-transparent text-spa-muted hover:text-spa-text"
          }`}
        >
          {TAB_LABELS[t]}
        </button>
      ))}
    </div>
  );
}

// ── Services screen ────────────────────────────────────────────────────

interface ServicesScreenProps {
  services: (Service & { enabled: boolean })[];
  categories: Category[];
  isPending: boolean;
  run: (fn: () => Promise<void>) => void;
  onEdit: (id: string) => void;
}

function ServicesScreen({ services, categories, isPending, run, onEdit }: ServicesScreenProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [isPendingCreate, startCreate] = useTransition();

  const hasCats = categories.length > 0;
  const uncategorized = services.filter((s) => !s.categoryId);

  const toggleCollapse = (key: string) =>
    setCollapsed((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  function renderRow(
    service: Service & { enabled: boolean },
    group: (Service & { enabled: boolean })[],
    categoryId: string | null,
  ) {
    const idx = group.findIndex((s) => s.id === service.id);
    return (
      <div
        key={service.id}
        className={`flex items-center gap-3 px-4 py-3 border-b border-spa-border last:border-0 hover:bg-spa-surface transition-colors group ${
          !service.enabled ? "opacity-50" : ""
        }`}
      >
        {/* Reorder arrows */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button className={btnArrow} disabled={idx === 0 || isPending} onClick={() => run(() => moveServiceInGroup(service.id, "up", categoryId))}>↑</button>
          <button className={btnArrow} disabled={idx === group.length - 1 || isPending} onClick={() => run(() => moveServiceInGroup(service.id, "down", categoryId))}>↓</button>
        </div>

        {/* Name — click to edit */}
        <button
          className="flex-1 min-w-0 text-left"
          onClick={() => onEdit(service.id)}
        >
          <span className="font-medium text-spa-text group-hover:text-spa-accent transition-colors">
            {service.name}
          </span>
          {service.tagline && (
            <span className="text-spa-muted text-sm ml-2 hidden sm:inline">{service.tagline}</span>
          )}
        </button>

        {/* Step count */}
        <span className="text-xs text-spa-muted tabular-nums shrink-0">
          {service.subServices.length} {service.subServices.length === 1 ? "step" : "steps"}
        </span>

        {/* Enabled badge */}
        <span className={`text-xs shrink-0 hidden sm:inline ${service.enabled ? "text-spa-accent" : "text-spa-muted"}`}>
          {service.enabled ? "● Visible" : "○ Hidden"}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button className={btnGhost} disabled={isPending} onClick={() => onEdit(service.id)}>Edit</button>
          <button className={btnGhost} disabled={isPending} onClick={() => run(() => toggleService(service.id))}>
            {service.enabled ? "Hide" : "Show"}
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
    );
  }

  function renderSection(
    title: string | null,
    key: string,
    sectionServices: (Service & { enabled: boolean })[],
    categoryId: string | null,
  ) {
    const isCollapsed = collapsed.has(key);
    return (
      <div key={key}>
        {title && (
          <button
            className="flex items-center gap-2 w-full text-left px-4 py-2.5 bg-spa-surface border-b border-spa-border hover:brightness-95 transition-all"
            onClick={() => toggleCollapse(key)}
          >
            <span className="text-xs font-semibold text-spa-muted uppercase tracking-widest flex-1">
              {title}
            </span>
            <span className="text-xs text-spa-muted">{sectionServices.length}</span>
            <span className="text-xs text-spa-muted ml-1">{isCollapsed ? "▶" : "▼"}</span>
          </button>
        )}
        {!isCollapsed && sectionServices.map((s) => renderRow(s, sectionServices, categoryId))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* List */}
      <div className="rounded-2xl border border-spa-border overflow-hidden bg-white">
        {services.length === 0 && (
          <p className="text-sm text-spa-muted px-4 py-8 text-center italic">
            No services yet. Add one below.
          </p>
        )}

        {!hasCats && services.map((s) => renderRow(s, services, null))}

        {hasCats && (
          <>
            {categories.map((cat) =>
              renderSection(
                cat.name,
                cat.id,
                services.filter((s) => s.categoryId === cat.id),
                cat.id,
              )
            )}
            {renderSection("Uncategorized", "__uncategorized__", uncategorized, null)}
          </>
        )}
      </div>

      {/* Create */}
      {showCreate ? (
        <div className="rounded-2xl border-2 border-spa-accent bg-spa-accentLight p-5 space-y-3">
          <p className="text-sm font-semibold text-spa-text">New Service</p>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startCreate(async () => {
                const id = await createService(fd);
                setShowCreate(false);
                if (id) onEdit(id);
              });
            }}
          >
            <div className="flex gap-3 flex-col sm:flex-row">
              <div className="flex-1">
                <label className="block text-xs font-medium text-spa-muted mb-1.5 uppercase tracking-wide">Name</label>
                <input name="name" placeholder="e.g. Liora Signature" required autoFocus className={`${inputCls} w-full`} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-spa-muted mb-1.5 uppercase tracking-wide">Tagline</label>
                <input name="tagline" placeholder="e.g. 60 min · Full ritual" className={`${inputCls} w-full`} />
              </div>
              {categories.length > 0 && (
                <div className="flex-1">
                  <label className="block text-xs font-medium text-spa-muted mb-1.5 uppercase tracking-wide">Category</label>
                  <select name="categoryId" defaultValue="" className={`${inputCls} w-full`}>
                    <option value="">Uncategorized</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className={btnOutline} onClick={() => setShowCreate(false)} disabled={isPendingCreate}>Cancel</button>
              <button type="submit" className={btnPrimary} disabled={isPendingCreate}>Add Service</button>
            </div>
          </form>
        </div>
      ) : (
        <button className={btnPrimary} onClick={() => setShowCreate(true)}>+ New Service</button>
      )}
    </div>
  );
}

// ── Service edit screen ────────────────────────────────────────────────

interface ServiceEditScreenProps {
  service: Service & { enabled: boolean };
  categories: Category[];
  isPending: boolean;
  run: (fn: () => Promise<void>) => void;
  onBack: () => void;
  onDeleted: () => void;
}

function ServiceEditScreen({ service, categories, isPending, run, onBack, onDeleted }: ServiceEditScreenProps) {
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [showAddStep, setShowAddStep] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-spa-muted text-sm hover:text-spa-text transition-colors"
        >
          ← Services
        </button>
        <div className="flex items-center gap-2">
          <button
            className={btnGhost}
            disabled={isPending}
            onClick={() => run(() => duplicateService(service.id))}
          >
            Duplicate
          </button>
          <button
            className={btnDanger}
            disabled={isPending}
            onClick={() => {
              if (!confirm(`Delete "${service.name}" and all its steps?`)) return;
              run(async () => { await deleteService(service.id); onDeleted(); });
            }}
          >
            Delete Service
          </button>
        </div>
      </div>

      {/* Metadata form — key forces re-mount when server returns updated data */}
      <div
        key={`${service.name}|${service.tagline}|${service.categoryId}|${service.enabled}`}
        className="rounded-2xl border border-spa-border bg-white p-5 space-y-4"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => updateService(service.id, new FormData(e.currentTarget)));
          }}
        >
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1">
              <label className="block text-xs font-medium text-spa-muted mb-1.5 uppercase tracking-wide">Name</label>
              <input name="name" defaultValue={service.name} required className={`${inputCls} w-full`} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-spa-muted mb-1.5 uppercase tracking-wide">Tagline</label>
              <input name="tagline" defaultValue={service.tagline} className={`${inputCls} w-full`} />
            </div>
            {categories.length > 0 && (
              <div className="flex-1">
                <label className="block text-xs font-medium text-spa-muted mb-1.5 uppercase tracking-wide">Category</label>
                <select name="categoryId" defaultValue={service.categoryId ?? ""} className={`${inputCls} w-full`}>
                  <option value="">Uncategorized</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <span className={`text-sm ${service.enabled ? "text-spa-accent" : "text-spa-muted"}`}>
                {service.enabled ? "● Visible" : "○ Hidden"}
              </span>
              <button type="button" className={btnGhost} disabled={isPending} onClick={() => run(() => toggleService(service.id))}>
                {service.enabled ? "Hide" : "Show"}
              </button>
            </div>
            <button type="submit" className={btnPrimary} disabled={isPending}>
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Steps */}
      <div>
        <h3 className="text-xs font-semibold text-spa-muted uppercase tracking-widest mb-3">Steps</h3>
        <div className="rounded-2xl border border-spa-border bg-white overflow-hidden">
          {service.subServices.length === 0 && !showAddStep && (
            <p className="text-sm text-spa-muted px-4 py-4 italic">No steps yet.</p>
          )}

          <div className="divide-y divide-spa-border">
            {service.subServices.map((sub, subIdx) =>
              editingSubId === sub.id ? (
                <div key={sub.id}>
                  <SubForm
                    defaultName={sub.name}
                    defaultMinutes={toMinutes(sub.durationSeconds)}
                    submitLabel="Save"
                    isPending={isPending}
                    onCancel={() => setEditingSubId(null)}
                    onSubmit={(fd) => run(async () => { await updateSubService(sub.id, fd); setEditingSubId(null); })}
                  />
                </div>
              ) : (
                <SubRow
                  key={sub.id}
                  sub={sub}
                  isFirst={subIdx === 0}
                  isLast={subIdx === service.subServices.length - 1}
                  isPending={isPending}
                  onEdit={() => { setShowAddStep(false); setEditingSubId(sub.id); }}
                  onDelete={() => { if (!confirm(`Delete step "${sub.name}"?`)) return; run(() => deleteSubService(sub.id)); }}
                  onMove={(dir) => run(() => moveSubService(sub.id, dir))}
                />
              )
            )}
          </div>

          <div className={service.subServices.length > 0 ? "border-t border-spa-border" : ""}>
            {showAddStep ? (
              <SubForm
                submitLabel="Add Step"
                isPending={isPending}
                onCancel={() => setShowAddStep(false)}
                onSubmit={(fd) => run(async () => { await createSubService(service.id, fd); setShowAddStep(false); })}
              />
            ) : (
              <button
                className="flex items-center gap-1.5 px-4 py-3 text-sm text-spa-accent font-medium hover:opacity-70 transition-opacity disabled:opacity-40 w-full"
                disabled={isPending}
                onClick={() => { setEditingSubId(null); setShowAddStep(true); }}
              >
                + Add Step
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Categories screen ──────────────────────────────────────────────────

interface CategoriesScreenProps {
  categories: Category[];
  services: (Service & { enabled: boolean })[];
  isPending: boolean;
  run: (fn: () => Promise<void>) => void;
}

function CategoriesScreen({ categories, services, isPending, run }: CategoriesScreenProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-spa-border overflow-hidden bg-white">
        {categories.length === 0 && !showCreate && (
          <p className="text-sm text-spa-muted px-4 py-8 text-center italic">
            No categories yet. Add one to group your services.
          </p>
        )}

        <div className="divide-y divide-spa-border">
          {categories.map((cat, idx) =>
            editingId === cat.id ? (
              <div key={cat.id}>
                <CategoryForm
                  defaultName={cat.name}
                  submitLabel="Save"
                  isPending={isPending}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(fd) => run(async () => { await updateCategory(cat.id, fd); setEditingId(null); })}
                />
              </div>
            ) : (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-spa-surface transition-colors group"
              >
                {/* Reorder */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button className={btnArrow} disabled={idx === 0 || isPending} onClick={() => run(() => moveCategory(cat.id, "up"))}>↑</button>
                  <button className={btnArrow} disabled={idx === categories.length - 1 || isPending} onClick={() => run(() => moveCategory(cat.id, "down"))}>↓</button>
                </div>

                <span className="flex-1 font-medium text-spa-text">{cat.name}</span>

                <span className="text-xs text-spa-muted tabular-nums shrink-0">
                  {services.filter((s) => s.categoryId === cat.id).length} services
                </span>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button className={btnGhost} disabled={isPending} onClick={() => setEditingId(cat.id)}>Edit</button>
                  <button
                    className={btnDanger}
                    disabled={isPending}
                    onClick={() => {
                      const count = services.filter((s) => s.categoryId === cat.id).length;
                      const msg = count > 0
                        ? `Delete "${cat.name}"? ${count} service(s) will become uncategorized.`
                        : `Delete category "${cat.name}"?`;
                      if (!confirm(msg)) return;
                      run(() => deleteCategory(cat.id));
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {showCreate ? (
        <div className="rounded-2xl border-2 border-spa-accent bg-spa-accentLight p-4">
          <CategoryForm
            submitLabel="Add Category"
            isPending={isPending}
            onCancel={() => setShowCreate(false)}
            onSubmit={(fd) => run(async () => { await createCategory(fd); setShowCreate(false); })}
          />
        </div>
      ) : (
        <button className={btnPrimary} onClick={() => setShowCreate(true)}>+ New Category</button>
      )}
    </div>
  );
}

// ── Settings screen ────────────────────────────────────────────────────

function SettingsScreen() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-spa-border bg-white p-5">
        <h3 className="text-sm font-semibold text-spa-muted uppercase tracking-widest mb-4">
          Dashboard PIN
        </h3>
        <PinChangeForm />
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────

interface Props {
  services: (Service & { enabled: boolean })[];
  categories: Category[];
}

export default function DashboardClient({ services, categories }: Props) {
  const [screen, setScreen] = useState<Screen>({ type: "services" });
  const [isPending, startTransition] = useTransition();

  const run = (fn: () => Promise<void>) => startTransition(async () => { await fn(); });

  const activeTab = screen.type === "service-edit" ? "services" : screen.type;

  const currentService =
    screen.type === "service-edit"
      ? services.find((s) => s.id === screen.serviceId) ?? null
      : null;

  return (
    <div>
      <NavTabs active={activeTab} onNavigate={setScreen} />

      {/* Services list */}
      {screen.type === "services" && (
        <ServicesScreen
          services={services}
          categories={categories}
          isPending={isPending}
          run={run}
          onEdit={(id) => setScreen({ type: "service-edit", serviceId: id })}
        />
      )}

      {/* Service edit */}
      {screen.type === "service-edit" && currentService && (
        <ServiceEditScreen
          service={currentService}
          categories={categories}
          isPending={isPending}
          run={run}
          onBack={() => setScreen({ type: "services" })}
          onDeleted={() => setScreen({ type: "services" })}
        />
      )}
      {screen.type === "service-edit" && !currentService && (
        <div className="text-center py-16">
          <p className="text-spa-muted mb-3">Service not found.</p>
          <button className={btnOutline} onClick={() => setScreen({ type: "services" })}>
            ← Back to Services
          </button>
        </div>
      )}

      {/* Categories */}
      {screen.type === "categories" && (
        <CategoriesScreen
          categories={categories}
          services={services}
          isPending={isPending}
          run={run}
        />
      )}

      {/* Settings */}
      {screen.type === "settings" && <SettingsScreen />}
    </div>
  );
}
