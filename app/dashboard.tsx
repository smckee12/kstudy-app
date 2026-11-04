"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { percentCorrect, reviewsPerDay, type Day } from "@/lib/dashboard";
import type { DashboardData } from "@/lib/data";

const CHART_DAYS = 14;
const NAVY = "#1f3a5f";

// True only in the browser. The server doesn't know my time zone (its
// clock is UTC), so anything sorted into days waits for the browser.
const subscribe = () => () => {};
function useIsBrowser() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

// The dashboard at the top of the home page: four numbers and a chart of
// reviews per day for the last two weeks.
export function Dashboard({ data }: { data: DashboardData }) {
  const isBrowser = useIsBrowser();
  const accuracy = percentCorrect(data.correctCount, data.reviewCount);

  const days = isBrowser
    ? reviewsPerDay(data.recent, {
        days: CHART_DAYS,
        now: new Date(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    : null;
  // "This week" = the last 7 days including today, the same days as the
  // right half of the chart.
  const thisWeek = days?.slice(-7).reduce((sum, d) => sum + d.reviews, 0);

  return (
    <section aria-labelledby="dashboard-heading" className="mt-8">
      <h2 id="dashboard-heading" className="text-xl font-bold text-navy">
        Your progress
      </h2>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Words" value={data.wordCount.toLocaleString()} />
        <StatTile
          label="Correct overall"
          value={accuracy === null ? "—" : `${accuracy}%`}
          note={
            data.reviewCount > 0
              ? `${data.correctCount.toLocaleString()} of ${data.reviewCount.toLocaleString()} answers`
              : "No answers yet"
          }
        />
        <StatTile
          label="Reviews this week"
          value={thisWeek === undefined ? "…" : thisWeek.toLocaleString()}
          note="Last 7 days"
        />
        <StatTile label="Reviews all time" value={data.reviewCount.toLocaleString()} />
      </dl>

      <div className="mt-4 rounded-xl bg-surface p-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Reviews per day <span className="font-normal text-gray-500">· last {CHART_DAYS} days</span>
        </h3>
        {data.reviewCount === 0 ? (
          <p className="mt-3 text-gray-600">
            No reviews yet.{" "}
            <Link href="/study" className="font-semibold text-navy underline">
              Study a lesson
            </Link>{" "}
            and your answers will show up here.
          </p>
        ) : days === null ? (
          <div className="mt-3 h-56" aria-hidden />
        ) : (
          <>
            <div className="mt-3 h-56" role="img" aria-label={chartSummary(days)}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={days} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
                  <CartesianGrid vertical={false} stroke="#e2e4e8" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db" }}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    // Label every 3rd day, counting back from today, so today
                    // always has a label, the spacing is even, and the
                    // labels still fit side by side on a phone.
                    ticks={days.filter((_, i) => (days.length - 1 - i) % 3 === 0).map((d) => d.label)}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <Tooltip content={DayTooltip} cursor={{ fill: "#1f3a5f", fillOpacity: 0.06 }} />
                  <Bar dataKey="reviews" fill={NAVY} maxBarSize={24} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer text-gray-600">Show as a table</summary>
              <table className="mt-2 w-full text-left">
                <thead className="text-gray-500">
                  <tr>
                    <th className="py-1 font-semibold">Day</th>
                    <th className="py-1 font-semibold">Reviews</th>
                    <th className="py-1 font-semibold">Got it</th>
                  </tr>
                </thead>
                <tbody>
                  {[...days].reverse().map((d) => (
                    <tr key={d.date} className="border-t border-gray-200">
                      <td className="py-1">{d.label}</td>
                      <td className="py-1">{d.reviews}</td>
                      <td className="py-1">
                        {d.reviews > 0 ? `${d.correct} (${percentCorrect(d.correct, d.reviews)}%)` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </>
        )}
      </div>
    </section>
  );
}

function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl bg-surface p-4">
      <dt className="text-sm text-gray-600">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold text-navy">{value}</dd>
      {note && <dd className="mt-0.5 text-xs text-gray-500">{note}</dd>}
    </div>
  );
}

// What shows when I hover (or tap) a day's bar.
function DayTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  const day = payload?.[0]?.payload as Day | undefined;
  if (!active || !day) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="font-semibold text-gray-900">{day.label}</p>
      <p className="text-gray-700">
        {day.reviews} {day.reviews === 1 ? "review" : "reviews"}
      </p>
      {day.reviews > 0 && (
        <p className="text-gray-500">
          {day.correct} got it ({percentCorrect(day.correct, day.reviews)}%)
        </p>
      )}
    </div>
  );
}

// A one-sentence description of the chart for screen readers.
function chartSummary(days: Day[]) {
  const total = days.reduce((sum, d) => sum + d.reviews, 0);
  const active = days.filter((d) => d.reviews > 0).length;
  return `Bar chart: ${total} reviews over the last ${days.length} days, on ${active} of those days.`;
}
