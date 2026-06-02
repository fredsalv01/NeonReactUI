/**
 * Charts — unified chart panel
 * Library selector: Recharts | Nivo
 * Type selector: Area/Line | Bar | Pie
 * All charts are skinned to the NeonReactUI design tokens.
 */

import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { ResponsiveLine } from '@nivo/line'
import { ResponsiveBar }  from '@nivo/bar'
import { ResponsivePie }  from '@nivo/pie'

// ── Shared data ──────────────────────────────────────────────────
const MONTHLY = [
  { month: 'Jan', available: 98,  inUse: 28, maintenance: 16 },
  { month: 'Feb', available: 102, inUse: 31, maintenance:  9 },
  { month: 'Mar', available: 110, inUse: 26, maintenance:  6 },
  { month: 'Apr', available: 118, inUse: 34, maintenance: 12 },
  { month: 'May', available: 125, inUse: 29, maintenance:  8 },
  { month: 'Jun', available: 138, inUse: 34, maintenance: 12 },
]

const CATEGORY = [
  { name: 'Total Station', value: 48 },
  { name: 'GNSS',          value: 32 },
  { name: 'Level',         value: 27 },
  { name: 'Scanner',       value: 19 },
  { name: 'Drone',         value: 16 },
]

const STATUS_PIE = [
  { id: 'Available',      label: 'Available',      value: 96, color: '#00C9A7' },
  { id: 'In Use',         label: 'In Use',         value: 34, color: '#0EA5E9' },
  { id: 'Maintenance',    label: 'Maintenance',    value: 12, color: '#F59E0B' },
  { id: 'Decommissioned', label: 'Decommissioned', value:  6, color: '#EF4444' },
]

const NIVO_LINE_DATA = [
  { id: 'Available', color: '#00C9A7', data: MONTHLY.map(d => ({ x: d.month, y: d.available })) },
  { id: 'In Use',    color: '#0EA5E9', data: MONTHLY.map(d => ({ x: d.month, y: d.inUse })) },
]

// ── Design tokens ────────────────────────────────────────────────
const C = {
  accent:  '#00C9A7',
  teal:    '#0EA5E9',
  warn:    '#F59E0B',
  danger:  '#EF4444',
  purple:  '#A855F7',
  border:  '#232837',
  card:    '#181C26',
  text:    '#E2E8F0',
  soft:    '#94A3B8',
}
const BAR_PALETTE = [C.accent, C.teal, C.warn, C.danger, C.purple]

// ── Nivo shared theme ────────────────────────────────────────────
const NIVO_THEME = {
  background: 'transparent',
  text: { fill: C.soft, fontSize: 11, fontFamily: '"DM Mono", monospace' },
  axis: {
    domain: { line: { stroke: C.border } },
    ticks: {
      line: { stroke: C.border },
      text: { fill: C.soft, fontSize: 10, fontFamily: '"DM Mono", monospace' },
    },
  },
  grid: { line: { stroke: C.border, strokeDasharray: '4 4' } },
  legends: { text: { fill: C.soft, fontSize: 11 } },
  tooltip: {
    container: {
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      color: C.text,
      fontSize: 12,
      fontFamily: '"Syne", sans-serif',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      padding: '8px 12px',
    },
  },
}

// ── Recharts custom tooltip ──────────────────────────────────────
function RCTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gs-card border border-gs-border rounded-xl px-3 py-2.5
                    shadow-2xl text-xs font-['Syne'] min-w-[140px]">
      {label && (
        <div className="text-gs-soft mb-2 font-['DM_Mono'] text-[10px] uppercase tracking-wider">
          {label}
        </div>
      )}
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-gs-soft">{p.name}</span>
          <span className="ml-auto text-gs-text font-bold pl-4">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Recharts — Area ──────────────────────────────────────────────
function RechartsArea() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={MONTHLY} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="rc-ga" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={C.accent} stopOpacity={0.28} />
            <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="rc-gt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={C.teal}   stopOpacity={0.22} />
            <stop offset="95%" stopColor={C.teal}   stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke={C.border} />
        <XAxis
          dataKey="month"
          tick={{ fill: C.soft, fontSize: 10, fontFamily: '"DM Mono"' }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fill: C.soft, fontSize: 10, fontFamily: '"DM Mono"' }}
          axisLine={false} tickLine={false}
        />
        <Tooltip content={<RCTooltip />} />
        <Legend
          iconType="circle" iconSize={8}
          wrapperStyle={{ fontSize: 11, color: C.soft, fontFamily: '"DM Mono"', paddingTop: 16 }}
        />
        <Area
          type="monotoneX" dataKey="available" name="Available"
          stroke={C.accent} strokeWidth={2}
          fill="url(#rc-ga)" dot={false}
          activeDot={{ r: 4, fill: C.accent, strokeWidth: 0 }}
        />
        <Area
          type="monotoneX" dataKey="inUse" name="In Use"
          stroke={C.teal} strokeWidth={2}
          fill="url(#rc-gt)" dot={false}
          activeDot={{ r: 4, fill: C.teal, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Recharts — Bar ───────────────────────────────────────────────
function RechartsBar() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={CATEGORY} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barSize={30}>
        <CartesianGrid strokeDasharray="4 4" stroke={C.border} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: C.soft, fontSize: 10, fontFamily: '"DM Mono"' }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fill: C.soft, fontSize: 10, fontFamily: '"DM Mono"' }}
          axisLine={false} tickLine={false}
        />
        <Tooltip content={<RCTooltip />} cursor={{ fill: '#ffffff06' }} />
        <Bar dataKey="value" name="Units" radius={[6, 6, 0, 0]}>
          {CATEGORY.map((_, i) => (
            <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Recharts — Pie ───────────────────────────────────────────────
function RechartsPie() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={STATUS_PIE}
          cx="50%" cy="50%"
          innerRadius={75} outerRadius={115}
          paddingAngle={3}
          dataKey="value" nameKey="label"
          strokeWidth={0}
        >
          {STATUS_PIE.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<RCTooltip />} />
        <Legend
          iconType="circle" iconSize={8}
          wrapperStyle={{ fontSize: 11, color: C.soft, fontFamily: '"DM Mono"', paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Nivo — Line ──────────────────────────────────────────────────
function NivoLine() {
  return (
    <div style={{ height: 300 }}>
      <ResponsiveLine
        data={NIVO_LINE_DATA}
        theme={NIVO_THEME}
        margin={{ top: 20, right: 24, bottom: 48, left: 44 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
        curve="monotoneX"
        colors={d => d.color}
        lineWidth={2}
        enablePoints={false}
        enableArea
        areaOpacity={0.12}
        enableGridX={false}
        axisBottom={{ tickSize: 0, tickPadding: 10 }}
        axisLeft={{ tickSize: 0, tickPadding: 10, tickValues: 5 }}
        useMesh
        legends={[{
          anchor: 'bottom',
          direction: 'row',
          translateY: 44,
          itemWidth: 90,
          itemHeight: 12,
          itemTextColor: C.soft,
          symbolSize: 8,
          symbolShape: 'circle',
        }]}
      />
    </div>
  )
}

// ── Nivo — Bar ───────────────────────────────────────────────────
function NivoBar() {
  return (
    <div style={{ height: 300 }}>
      <ResponsiveBar
        data={CATEGORY}
        keys={['value']}
        indexBy="name"
        theme={NIVO_THEME}
        margin={{ top: 20, right: 24, bottom: 56, left: 44 }}
        padding={0.35}
        borderRadius={6}
        colors={({ index }) => BAR_PALETTE[index % BAR_PALETTE.length]}
        axisBottom={{ tickSize: 0, tickPadding: 10, tickRotation: -15 }}
        axisLeft={{ tickSize: 0, tickPadding: 10, tickValues: 5 }}
        enableGridX={false}
        enableLabel={false}
        isInteractive
      />
    </div>
  )
}

// ── Nivo — Pie ───────────────────────────────────────────────────
function NivoPie() {
  return (
    <div style={{ height: 300 }}>
      <ResponsivePie
        data={STATUS_PIE}
        theme={NIVO_THEME}
        margin={{ top: 20, right: 130, bottom: 20, left: 130 }}
        innerRadius={0.62}
        padAngle={2}
        cornerRadius={4}
        colors={d => d.data.color}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLinkLabelsTextColor={C.soft}
        arcLinkLabelsThickness={1.5}
        enableArcLabels={false}
        legends={[{
          anchor: 'right',
          direction: 'column',
          translateX: 110,
          itemWidth: 100,
          itemHeight: 22,
          itemTextColor: C.soft,
          symbolSize: 10,
          symbolShape: 'circle',
        }]}
      />
    </div>
  )
}

// ── Config maps ──────────────────────────────────────────────────
const LIBS  = ['recharts', 'nivo']
const TYPES = ['area', 'bar', 'pie']

const LIB_LABEL  = { recharts: 'Recharts', nivo: 'Nivo' }
const TYPE_LABEL = { area: 'Area / Line', bar: 'Bar', pie: 'Pie / Donut' }
const TYPE_META  = {
  area: 'Inventory trend · last 6 months',
  bar:  'Equipment units by category',
  pie:  'Current status distribution',
}

const CHART_MAP = {
  recharts: { area: RechartsArea, bar: RechartsBar, pie: RechartsPie },
  nivo:     { area: NivoLine,     bar: NivoBar,     pie: NivoPie     },
}

// ── Selector button ──────────────────────────────────────────────
function SelBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer border',
        active
          ? 'bg-gs-accent/10 text-gs-accent border-gs-accent/25'
          : 'text-gs-soft border-transparent hover:text-gs-text hover:bg-white/5',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

// ── Main export ──────────────────────────────────────────────────
export function ChartPanel() {
  const [lib,  setLib]  = useState('recharts')
  const [type, setType] = useState('area')

  const Chart = CHART_MAP[lib][type]

  return (
    <div className="space-y-6">
      {/* Selectors row */}
      <div className="flex flex-wrap gap-6 items-end">
        <div>
          <p className="text-[10px] text-gs-muted font-['DM_Mono'] uppercase tracking-widest mb-2">
            Library
          </p>
          <div className="flex gap-1 p-1 rounded-xl bg-gs-bg border border-gs-border">
            {LIBS.map(l => (
              <SelBtn key={l} active={lib === l} onClick={() => setLib(l)}>
                {LIB_LABEL[l]}
              </SelBtn>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-gs-muted font-['DM_Mono'] uppercase tracking-widest mb-2">
            Chart type
          </p>
          <div className="flex gap-1 p-1 rounded-xl bg-gs-bg border border-gs-border">
            {TYPES.map(t => (
              <SelBtn key={t} active={type === t} onClick={() => setType(t)}>
                {TYPE_LABEL[t]}
              </SelBtn>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-gs-muted font-['DM_Mono'] pb-2">
          {TYPE_META[type]}
        </p>
      </div>

      {/* Chart */}
      <Chart />
    </div>
  )
}

export default ChartPanel
