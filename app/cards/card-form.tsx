"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { CardState, CardValues, RequiredField } from "@/app/actions/cards";
import type { Lesson } from "@/lib/types";

type Props = {
  action: (prev: CardState, formData: FormData) => Promise<CardState>;
  lessons: Pick<Lesson, "id" | "number" | "topic_korean" | "topic_english">[];
  // The card's current values on the edit page; empty on the add page.
  initial?: Partial<CardValues>;
  submitLabel: string;
  cancelHref: string;
};

// A red border on a field that needs fixing, gray otherwise.
function inputClass(error?: string) {
  return `rounded-lg border bg-white px-3 py-2 text-base font-normal ${
    error ? "border-accent" : "border-gray-300"
  }`;
}

// The shared form for adding and editing a word.
export function CardForm({ action, lessons, initial, submitLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  // After a failed save, show what was typed instead of the starting values.
  const values = state.values ?? initial ?? {};
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Lesson
        <select
          name="lesson_id"
          defaultValue={values.lesson_id ?? ""}
          key={values.lesson_id}
          aria-invalid={Boolean(errors.lesson_id)}
          aria-describedby={errors.lesson_id ? "lesson_id-error" : undefined}
          className={inputClass(errors.lesson_id)}
        >
          <option value="">Choose a lesson…</option>
          {lessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              Lesson {lesson.number} · {lesson.topic_korean}
              {lesson.topic_english ? ` (${lesson.topic_english})` : ""}
            </option>
          ))}
        </select>
        <FieldError name="lesson_id" error={errors.lesson_id} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="korean"
          label="Korean"
          value={values.korean}
          error={errors.korean}
          lang="ko"
          placeholder="먹다"
        />
        <Field
          name="english"
          label="English"
          value={values.english}
          error={errors.english}
          placeholder="to eat"
        />
        <Field
          name="pronunciation"
          label="Pronunciation"
          optional
          value={values.pronunciation}
          lang="ko"
          placeholder="[먹따]"
        />
        <Field
          name="polite_form"
          label="Polite form"
          optional
          value={values.polite_form}
          lang="ko"
          placeholder="먹어요"
        />
      </div>

      <Field
        name="example_sentence"
        label="Example sentence"
        optional
        multiline
        value={values.example_sentence}
        lang="ko"
        placeholder="저는 밥을 먹어요."
      />
      <Field name="notes" label="Notes" optional multiline value={values.notes} />

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-accent">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-navy px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

type FieldProps = {
  name: keyof CardValues;
  label: string;
  value?: string;
  error?: string;
  optional?: boolean;
  multiline?: boolean;
  lang?: string;
  placeholder?: string;
};

function Field({ name, label, value, error, optional, multiline, lang, placeholder }: FieldProps) {
  const props = {
    name,
    lang,
    placeholder,
    defaultValue: value ?? "",
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${name}-error` : undefined,
    className: inputClass(error),
  };
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      <span>
        {label}
        {optional && <span className="ml-1 font-normal text-gray-500">(optional)</span>}
      </span>
      {multiline ? <textarea rows={2} {...props} /> : <input type="text" {...props} />}
      <FieldError name={name as RequiredField} error={error} />
    </label>
  );
}

// The friendly message under a field, e.g. "Please add the Korean word."
function FieldError({ name, error }: { name: RequiredField; error?: string }) {
  if (!error) return null;
  return (
    <span id={`${name}-error`} role="alert" className="text-sm font-normal text-accent">
      {error}
    </span>
  );
}
