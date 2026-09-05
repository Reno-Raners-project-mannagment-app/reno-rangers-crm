"use client";

import { useActionState } from "react";
import { createProjectAction } from "@/lib/actions/projects";
import { WORK_TYPES } from "@/lib/constants";

type PmOption = { id: string; name: string };

export default function ProjectForm({ pms, consultants }: { pms: PmOption[]; consultants: PmOption[] }) {
  const [state, formAction, pending] = useActionState(createProjectAction, undefined);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <Section title="Клієнт">
        <Field label="Ім'я / назва компанії клієнта *">
          <input name="clientName" required className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Телефон клієнта">
            <input name="clientPhone" className={inputCls} />
          </Field>
          <Field label="Email клієнта">
            <input name="clientEmail" type="email" className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="Проєкт">
        <Field label="Назва проєкту *">
          <input name="name" required className={inputCls} />
        </Field>
        <Field label="Адреса виконання робіт *">
          <input name="address" required className={inputCls} />
        </Field>
        <Field label="Посилання на Google Maps">
          <input name="googleMapsUrl" className={inputCls} placeholder="https://maps.google.com/..." />
        </Field>
        <Field label="Вид робіт *">
          <select name="workType" required className={inputCls} defaultValue="">
            <option value="" disabled>
              Оберіть вид робіт
            </option>
            {WORK_TYPES.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Project Manager">
            <select name="pmId" className={inputCls} defaultValue="">
              <option value="">—</option>
              {pms.map((pm) => (
                <option key={pm.id} value={pm.id}>{pm.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Консультант / продавець">
            <select name="consultantId" className={inputCls} defaultValue="">
              <option value="">—</option>
              {consultants.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Дати та сума">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Дата підписання оферти">
            <input name="offerDate" type="date" className={inputCls} />
          </Field>
          <Field label="Гарантійний термін (місяців)">
            <input name="warrantyMonths" type="number" defaultValue={12} className={inputCls} />
          </Field>
          <Field label="Запланована дата початку">
            <input name="plannedStartDate" type="date" className={inputCls} />
          </Field>
          <Field label="Прогнозована дата завершення">
            <input name="plannedEndDate" type="date" className={inputCls} />
          </Field>
          <Field label="Загальна сума договору (€)">
            <input name="contractAmount" type="number" step="0.01" className={inputCls} />
          </Field>
          <Field label="Ставка ПДВ (%)">
            <input name="vatRate" type="number" defaultValue={21} className={inputCls} />
          </Field>
        </div>
      </Section>

      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <button type="submit" disabled={pending} className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
        {pending ? "Створення..." : "Створити проєкт"}
      </button>
    </form>
  );
}

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      {children}
    </label>
  );
}
