"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/**
 * CRM charts. Single-series forms (one hue per chart), validated against the white chart surface:
 * series #2f63a8, emphasis #c08a2e — both pass contrast, chroma and CVD checks (dataviz validator).
 * Every chart has a hover tooltip and an equivalent data table.
 */
const SERIES = "#2f63a8";
const EMPHASIS = "#c08a2e";
const GRID = "#e8ebf0";
const AXIS_TEXT = "#5c6675";

function TooltipBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-sm border border-line bg-white px-3 py-2 text-[12.5px] shadow-panel">
      <p className="text-slate">{title}</p>
      <p className="tabular mt-0.5 font-semibold text-navy">{value}</p>
    </div>
  );
}

function DataTable({ caption, headers, rows }: { caption: string; headers: [string, string]; rows: [string, number | string][] }) {
  return (
    <details className="mt-3 text-[12.5px] text-slate">
      <summary className="cursor-pointer select-none hover:text-navy">View as table</summary>
      <table className="mt-2 w-full border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="py-1.5 font-medium">
              {headers[0]}
            </th>
            <th scope="col" className="py-1.5 text-right font-medium">
              {headers[1]}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-line/60">
              <th scope="row" className="py-1.5 font-normal text-navy-700">
                {k}
              </th>
              <td className="tabular py-1.5 text-right text-navy">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export function WeeklyLeadsChart({ data }: { data: { weekStart: string; label: string; count: number }[] }) {
  const last = data.length - 1;
  return (
    <figure>
      <div className="h-[220px]" role="img" aria-label={`New leads per week for the last ${data.length} weeks. Latest week: ${data[last]?.count ?? 0}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap={4}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: GRID }}
              tick={{ fill: AXIS_TEXT, fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: AXIS_TEXT, fontSize: 11 }} width={44} />
            <Tooltip
              cursor={{ fill: "rgba(47,99,168,0.06)" }}
              content={({ active, payload }) =>
                active && payload?.[0] ? (
                  <TooltipBox
                    title={`Week of ${payload[0].payload.label}${payload[0].payload.weekStart === data[last]?.weekStart ? " (in progress)" : ""}`}
                    value={`${payload[0].value} new ${payload[0].value === 1 ? "lead" : "leads"}`}
                  />
                ) : null
              }
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={d.weekStart} fill={i === last ? EMPHASIS : SERIES} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 flex items-center gap-4 text-[12px] text-slate">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[2px]" style={{ background: SERIES }} /> Completed weeks
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[2px]" style={{ background: EMPHASIS }} /> This week, in progress
        </span>
      </figcaption>
      <DataTable caption="New leads per week" headers={["Week starting", "Leads"]} rows={data.map((d) => [d.label, d.count])} />
    </figure>
  );
}

export function HorizontalBars({ data, label, valueLabel }: { data: { label: string; count: number }[]; label: string; valueLabel: string }) {
  const height = Math.max(120, data.length * 34 + 16);
  return (
    <figure>
      <div style={{ height }} role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${d.count}`).join(", ")}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 0 }} barCategoryGap={6}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={150} tick={{ fill: "#243450", fontSize: 12.5 }} />
            <Tooltip
              cursor={{ fill: "rgba(47,99,168,0.06)" }}
              content={({ active, payload }) =>
                active && payload?.[0] ? <TooltipBox title={String(payload[0].payload.label)} value={`${payload[0].value} ${valueLabel}`} /> : null
              }
            />
            <Bar dataKey="count" fill={SERIES} radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false}>
              <LabelList dataKey="count" position="right" style={{ fill: "#243450", fontSize: 12, fontVariantNumeric: "tabular-nums" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DataTable caption={label} headers={["Category", valueLabel.charAt(0).toUpperCase() + valueLabel.slice(1)]} rows={data.map((d) => [d.label, d.count])} />
    </figure>
  );
}
