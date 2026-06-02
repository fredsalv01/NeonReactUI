import React, { useState } from 'react';
import {
  Button,
  Badge,
  Modal,
  Drawer,
  Tabs,
  Tooltip,
  Switch,
  Alert,
  ChartPanel,
  DataTable,
  Select,
  DropZone,
  SortableList,
  StatCard,
  InputField,
  SearchBar,
  Pagination,
  PasswordStrength,
  Spinner,
  Icon,
  useToast,
  SkeletonBlock,
  SkeletonCard,
  SkeletonRow,
  SkeletonStat
} from './ui';

export function ComponentShowcase() {
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [password, setPassword] = useState('');
  const [modal, setModal] = useState(null);
  const [tableSearch,   setTableSearch]   = useState('');
  const [tableLoading,  setTableLoading]  = useState(false);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterStatus,   setFilterStatus]   = useState(null);
  const [filterLocation, setFilterLocation] = useState(null);
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [activeTab,      setActiveTab]      = useState('overview');
  const [switches, setSwitches] = useState({ active: true, maintenance: false, notifications: true, darkMode: true });
  const { toast } = useToast();

  const handleShowToast = (type) => {
    if (type === 'success') toast.success('Operation completed successfully!');
    if (type === 'error') toast.error('Failed to save changes');
    if (type === 'loading') {
      const id = toast.loading('Processing...');
      setTimeout(() => toast.dismiss(id), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gs-bg)] text-[var(--gs-text)] p-4 sm:p-8 font-['Syne']">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">NeonReactUI Showcase</h1>
          <p className="text-[var(--gs-soft)] font-['DM_Mono']">Complete component library adaptation</p>
        </div>

        {/* Buttons & Icons */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-6">Buttons, Icons & Tooltips</h2>
          <div className="flex gap-4 flex-wrap items-center">
            <Tooltip content="Creates a new record"><Button variant="primary">Primary</Button></Tooltip>
            <Tooltip content="Cancel current action" placement="top"><Button variant="ghost">Ghost</Button></Tooltip>
            <Tooltip content="Permanently remove" placement="bottom"><Button variant="danger">Danger</Button></Tooltip>
            <Tooltip content="Not available right now" placement="right"><Button disabled>Disabled</Button></Tooltip>

            <div className="flex gap-4 ml-8">
              <Tooltip content="Inventory" placement="top"><Icon name="box" size={24} color="var(--gs-accent)" /></Tooltip>
              <Tooltip content="Users" placement="top"><Icon name="users" size={24} color="var(--gs-teal)" /></Tooltip>
              <Tooltip content="Analytics" placement="top"><Icon name="chart" size={24} color="var(--gs-warn)" /></Tooltip>
            </div>
          </div>
          <p className="text-[11px] text-[var(--gs-muted)] font-['DM_Mono'] mt-5">Hover any element ↑ to see the tooltip</p>
        </section>

        {/* Switch */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-1">Switch</h2>
          <p className="text-[var(--gs-soft)] text-xs font-['DM_Mono'] mb-6">Three sizes · custom color · disabled state</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-5">
              <Switch checked={switches.active}        onChange={v => setSwitches(s => ({...s, active: v}))}        label="Equipment active"       description="Mark this unit as available for deployment" />
              <Switch checked={switches.maintenance}   onChange={v => setSwitches(s => ({...s, maintenance: v}))}   label="Maintenance mode"       description="Locks the unit from being assigned to projects" color="var(--gs-warn)" />
              <Switch checked={switches.notifications} onChange={v => setSwitches(s => ({...s, notifications: v}))} label="Calibration alerts"     description="Receive reminders before calibration expires" />
              <Switch checked={switches.darkMode}      onChange={v => setSwitches(s => ({...s, darkMode: v}))}      label="Dark mode" disabled />
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-[10px] text-[var(--gs-muted)] font-['DM_Mono'] uppercase tracking-widest mb-3">Sizes</p>
                <div className="flex items-center gap-6">
                  <Switch size="sm" checked={true}  onChange={() => {}} label="sm" />
                  <Switch size="md" checked={true}  onChange={() => {}} label="md" />
                  <Switch size="lg" checked={false} onChange={() => {}} label="lg" />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[var(--gs-muted)] font-['DM_Mono'] uppercase tracking-widest mb-3">Colors</p>
                <div className="flex flex-col gap-3">
                  <Switch size="md" checked={true} onChange={() => {}} color="var(--gs-accent)" label="Accent (default)" />
                  <Switch size="md" checked={true} onChange={() => {}} color="var(--gs-teal)"   label="Teal" />
                  <Switch size="md" checked={true} onChange={() => {}} color="var(--gs-danger)"  label="Danger" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alert / Banner */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-1">Alert</h2>
          <p className="text-[var(--gs-soft)] text-xs font-['DM_Mono'] mb-6">Inline persistent feedback · 4 variants · dismissible</p>
          <div className="space-y-3">
            <Alert variant="info" title="Firmware update available">
              Version 4.2.1 is ready for Leica TS16 units. Schedule the update during off-hours to avoid disruption.
            </Alert>
            <Alert variant="success" title="Sync completed">
              142 equipment records were successfully synced with the field database.
            </Alert>
            <Alert variant="warning" title="Calibration overdue" onDismiss={() => toast.info('Alert dismissed')}>
              3 instruments require recalibration before field deployment. Click to review.
            </Alert>
            <Alert variant="danger" title="Connection lost" onDismiss={() => toast.error('Acknowledged')}>
              Unable to reach the remote inventory server. Data shown may be stale.
            </Alert>
            <Alert variant="info">No title — just a short informational message with no action needed.</Alert>
          </div>
        </section>

        {/* Tabs */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-1">Tabs</h2>
          <p className="text-[var(--gs-soft)] text-xs font-['DM_Mono'] mb-6">Sliding neon underline indicator · icon + badge support</p>
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            tabs={[
              { value: 'overview',   label: 'Overview',   icon: 'box',    badge: null },
              { value: 'history',    label: 'History',    icon: 'chart',  badge: 14 },
              { value: 'documents',  label: 'Documents',  icon: 'file',   badge: 3 },
              { value: 'calibration',label: 'Calibration',icon: 'check',  badge: null },
            ]}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {[['Serial No.','GS-00142'],['Brand','Leica'],['Model','TS16'],['Category','Total Station'],['Location','Warehouse A'],['Status','Disponible']].map(([k,v]) => (
                  <div key={k} className="p-3 rounded-xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
                    <p className="text-[10px] font-['DM_Mono'] text-[var(--gs-muted)] uppercase tracking-wider mb-0.5">{k}</p>
                    <p className="text-[var(--gs-text)] font-semibold text-sm">{v}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'history' && (
              <div className="space-y-2">
                {[['2026-04-01','Returned from Site C — no damage reported'],['2026-03-12','Annual calibration completed at workshop'],['2026-01-08','Assigned to Project Delta · Trimble R10']].map(([date,ev]) => (
                  <div key={date} className="flex gap-3 p-3 rounded-xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
                    <span className="text-[11px] font-['DM_Mono'] text-[var(--gs-muted)] shrink-0 mt-0.5 w-24">{date}</span>
                    <span className="text-sm text-[var(--gs-soft)]">{ev}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'documents' && (
              <div className="space-y-2">
                {[['Calibration Certificate.pdf','PDF','2026-03-12'],['User Manual TS16.pdf','PDF','2024-08-01'],['Inspection Report Q1.xlsx','XLSX','2026-04-01']].map(([name,ext,date]) => (
                  <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
                    <span className="text-[9px] font-['DM_Mono'] font-bold px-1.5 py-0.5 rounded bg-[var(--gs-accent)]/10 text-[var(--gs-accent)] border border-[var(--gs-accent)]/20">{ext}</span>
                    <span className="flex-1 text-sm text-[var(--gs-text)] truncate">{name}</span>
                    <span className="text-[11px] font-['DM_Mono'] text-[var(--gs-muted)] shrink-0">{date}</span>
                    <Button variant="ghost" onClick={() => toast.success(`Downloading ${name}`)}>
                      <Icon name="download" size={13} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'calibration' && (
              <div className="space-y-3">
                <Alert variant="success" title="In compliance">Next calibration due September 2026 — 90 days remaining.</Alert>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[['Last calibration','2026-03-12'],['Next due','2026-09-12'],['Calibrated by','Tech. J. Flores'],['Certificate','CAL-2026-0312']].map(([k,v]) => (
                    <div key={k} className="p-3 rounded-xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
                      <p className="text-[10px] font-['DM_Mono'] text-[var(--gs-muted)] uppercase tracking-wider mb-0.5">{k}</p>
                      <p className="text-[var(--gs-text)] font-semibold text-sm">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Tabs>
        </section>

        {/* Drawer */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-1">Drawer</h2>
          <p className="text-[var(--gs-soft)] text-xs font-['DM_Mono'] mb-6">Slide-in panel · smooth enter/exit · focus trap · Escape to close</p>
          <div className="flex gap-3 flex-wrap">
            <Button variant="primary" onClick={() => setDrawerOpen(true)}>Open equipment detail</Button>
            <Button variant="ghost" onClick={() => setDrawerOpen(true)}>Right drawer (default)</Button>
          </div>
        </section>

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Leica TS16"
          subtitle="GS-00142 · Total Station"
          size="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Close</Button>
              <Button variant="primary" onClick={() => { setDrawerOpen(false); toast.success('Changes saved'); }}>Save changes</Button>
            </>
          }
        >
          <div className="space-y-5">
            <Alert variant="success" title="In compliance">Calibration valid until September 2026.</Alert>
            <Tabs
              value={activeTab}
              onChange={setActiveTab}
              tabs={[
                { value: 'overview',   label: 'Overview',   icon: 'box' },
                { value: 'history',    label: 'History',    icon: 'chart', badge: 14 },
                { value: 'calibration',label: 'Calibration',icon: 'check' },
              ]}
            >
              {activeTab === 'overview' && (
                <div className="grid grid-cols-2 gap-3">
                  {[['Brand','Leica'],['Model','TS16'],['Location','Warehouse A'],['Assigned to','—']].map(([k,v]) => (
                    <div key={k} className="p-3 rounded-xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
                      <p className="text-[10px] font-['DM_Mono'] text-[var(--gs-muted)] uppercase tracking-wider mb-0.5">{k}</p>
                      <p className="text-[var(--gs-text)] font-semibold text-sm">{v}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'history' && <p className="text-sm text-[var(--gs-soft)] pt-1">Last 14 activity records available in the full view.</p>}
              {activeTab === 'calibration' && <p className="text-sm text-[var(--gs-soft)] pt-1">Next calibration: September 12, 2026.</p>}
            </Tabs>
            <div className="space-y-3 pt-1">
              <p className="text-[11px] text-[var(--gs-muted)] font-['DM_Mono'] uppercase tracking-widest">Settings</p>
              <Switch checked={switches.active}      onChange={v => setSwitches(s => ({...s, active: v}))}      label="Mark as available"  description="Allow this unit to be assigned to new projects" />
              <Switch checked={switches.maintenance} onChange={v => setSwitches(s => ({...s, maintenance: v}))} label="Maintenance lock"    description="Prevent assignment until maintenance is complete" color="var(--gs-warn)" />
            </div>
          </div>
        </Drawer>

        {/* Inputs & Search */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-6">Form Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-6">
              <InputField label="Product Name *" error={query === 'error' ? 'Invalid name' : null}>
                <input 
                  type="text" 
                  className="w-full bg-[var(--gs-card)] border border-[var(--gs-border)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--gs-accent)]" 
                  placeholder="e.g., Leica TS16"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </InputField>
              
              <InputField label="Secure Password *">
                <input 
                  type="password" 
                  className="w-full bg-[var(--gs-card)] border border-[var(--gs-border)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--gs-accent)]" 
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputField>
              <PasswordStrength password={password} />
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-[var(--gs-soft)] uppercase tracking-wider mb-2 block">Search Component</label>
                <SearchBar 
                  value={query} 
                  onChange={setQuery} 
                  placeholder="Search by name or ID..." 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-6">Status Badges</h2>
          <div className="flex gap-4 flex-wrap">
            <Badge estado="Disponible" />
            <Badge estado="En uso" />
            <Badge estado="Mantenimiento" />
            <Badge estado="Baja" />
          </div>
        </section>

        {/* Metric Cards */}
        <section>
          <h2 className="text-xl font-bold mb-6">Dashboard KPIs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Total Inventory" 
              value="142" 
              icon="box" 
              color="var(--gs-accent)"
              sub="+3 this week"
            />
            <StatCard 
              label="In Use" 
              value="34" 
              icon="users" 
              color="var(--gs-teal)"
            />
            <StatCard 
              label="Maintenance" 
              value="12" 
              icon="alert" 
              color="var(--gs-danger)"
              sub="Action required"
            />
            <StatCard 
              label="System Health" 
              value="98%" 
              icon="check" 
              color="var(--gs-accent)"
            />
          </div>
        </section>

        {/* DataTable Section */}
        {(() => {
          const EQUIPMENT = [
            { id: 'GS-001', name: 'Leica TS16',     category: 'Total Station', status: 'Disponible',   location: 'Warehouse A', lastCalib: '2026-03-12' },
            { id: 'GS-002', name: 'Trimble R10',    category: 'GNSS',          status: 'En uso',        location: 'Field B',     lastCalib: '2026-01-08' },
            { id: 'GS-003', name: 'Sokkia SDL50',   category: 'Level',         status: 'Mantenimiento', location: 'Workshop',    lastCalib: '2025-11-20' },
            { id: 'GS-004', name: 'Faro Focus S',   category: 'Scanner',       status: 'Disponible',   location: 'Warehouse A', lastCalib: '2026-02-15' },
            { id: 'GS-005', name: 'DJI Phantom 4',  category: 'Drone',         status: 'Baja',          location: 'Storage',     lastCalib: '2024-09-05' },
            { id: 'GS-006', name: 'Leica NA2',      category: 'Level',         status: 'Disponible',   location: 'Warehouse B', lastCalib: '2026-04-01' },
            { id: 'GS-007', name: 'Trimble S7',     category: 'Total Station', status: 'En uso',        location: 'Site C',      lastCalib: '2026-02-28' },
          ];

          const CATEGORY_OPTS = [
            { value: 'Total Station', label: 'Total Station', meta: '2' },
            { value: 'GNSS',          label: 'GNSS',          meta: '1' },
            { value: 'Level',         label: 'Level',         meta: '2' },
            { value: 'Scanner',       label: 'Scanner',       meta: '1' },
            { value: 'Drone',         label: 'Drone',         meta: '1' },
          ];
          const STATUS_OPTS = [
            { value: 'Disponible',    label: 'Disponible'    },
            { value: 'En uso',        label: 'En uso'        },
            { value: 'Mantenimiento', label: 'Mantenimiento' },
            { value: 'Baja',          label: 'Baja'          },
          ];
          const LOCATION_OPTS = [
            { value: 'Warehouse A', label: 'Warehouse A' },
            { value: 'Warehouse B', label: 'Warehouse B' },
            { value: 'Field B',     label: 'Field B'     },
            { value: 'Workshop',    label: 'Workshop'    },
            { value: 'Storage',     label: 'Storage'     },
            { value: 'Site C',      label: 'Site C'      },
          ];

          const q = tableSearch.toLowerCase();
          const filtered = EQUIPMENT.filter(r => {
            const matchSearch   = !tableSearch || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
            const matchCategory = !filterCategory || r.category === filterCategory;
            const matchStatus   = !filterStatus   || r.status   === filterStatus;
            const matchLocation = !filterLocation || r.location === filterLocation;
            return matchSearch && matchCategory && matchStatus && matchLocation;
          });

          const activeCount = [filterCategory, filterStatus, filterLocation].filter(Boolean).length;
          const clearAll = () => { setFilterCategory(null); setFilterStatus(null); setFilterLocation(null); };

          const columns = [
            { key: 'id',        label: 'ID',         mono: true,  sortable: true },
            { key: 'name',      label: 'Equipment',               sortable: true },
            { key: 'category',  label: 'Category',                sortable: true, className: 'hidden sm:table-cell' },
            { key: 'status',    label: 'Status',     render: (v) => <Badge estado={v} /> },
            { key: 'location',  label: 'Location',                className: 'hidden md:table-cell' },
            { key: 'lastCalib', label: 'Last Calib', mono: true,  sortable: true, className: 'hidden lg:table-cell' },
          ];

          return (
            <section className="space-y-4">
              {/* Header */}
              <div>
                <h2 className="text-xl font-bold mb-1">Data Table</h2>
                <p className="text-[var(--gs-soft)] text-xs font-['DM_Mono']">Sortable · Selectable · Advanced filters</p>
              </div>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <SearchBar value={tableSearch} onChange={setTableSearch} placeholder="Search by name or ID…" className="w-full sm:w-72" />
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" onClick={() => { setTableLoading(true); setTimeout(() => setTableLoading(false), 1800); }}>
                    Simulate load
                  </Button>
                  <Button variant="primary" onClick={() => toast.success('Export triggered')}>
                    Export
                  </Button>
                </div>
              </div>

              {/* Advanced filters row */}
              <div className="flex flex-wrap gap-3 items-end">
                <Select
                  options={CATEGORY_OPTS}
                  value={filterCategory}
                  onChange={setFilterCategory}
                  placeholder="Category…"
                  label="Category"
                  className="w-full sm:w-44"
                />
                <Select
                  options={STATUS_OPTS}
                  value={filterStatus}
                  onChange={setFilterStatus}
                  placeholder="Status…"
                  label="Status"
                  className="w-full sm:w-44"
                />
                <Select
                  options={LOCATION_OPTS}
                  value={filterLocation}
                  onChange={setFilterLocation}
                  placeholder="Location…"
                  label="Location"
                  className="w-full sm:w-44"
                />

                {/* Clear filters */}
                {activeCount > 0 && (
                  <div className="pb-0.5">
                    <button
                      onClick={clearAll}
                      className="flex items-center gap-1.5 h-[42px] px-3.5 rounded-lg
                                 text-xs font-semibold font-['Syne']
                                 border border-gs-border text-gs-soft
                                 hover:border-gs-danger hover:text-gs-danger
                                 transition-all duration-200 cursor-pointer"
                    >
                      <Icon name="close" size={12} />
                      Clear
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px]
                                       bg-gs-accent/15 text-gs-accent border border-gs-accent/25">
                        {activeCount}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Result count */}
              {(tableSearch || activeCount > 0) && (
                <p className="text-[11px] font-['DM_Mono'] text-gs-muted">
                  {filtered.length} of {EQUIPMENT.length} results
                </p>
              )}

              <DataTable
                columns={columns}
                data={filtered}
                loading={tableLoading}
                selectable
                onRowClick={(row) => toast.info(`Opened: ${row.name}`)}
                emptyMessage="No equipment matches your filters."
                actions={(row) => (
                  <>
                    <Button variant="ghost" onClick={() => toast.success(`Editing ${row.id}`)}>
                      <Icon name="edit" size={13} />
                    </Button>
                    <Button variant="danger" onClick={() => toast.error(`Deleted ${row.id}`)}>
                      <Icon name="trash" size={13} />
                    </Button>
                  </>
                )}
              />
            </section>
          );
        })()}

        {/* Charts Section */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-1">Charts</h2>
          <p className="text-[var(--gs-soft)] text-xs font-['DM_Mono'] mb-6">Switch library and chart type with the selectors below</p>
          <ChartPanel />
        </section>

        {/* Spinner */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-1">Spinner</h2>
          <p className="text-[var(--gs-soft)] text-xs font-['DM_Mono'] mb-8">Five variants · neon glow · soft easing</p>
          <div className="space-y-8">
            {/* All variants */}
            <div className="flex flex-wrap gap-10 items-end">
              {[
                { variant: 'ring',  color: 'var(--gs-accent)', size: 36 },
                { variant: 'dots',  color: 'var(--gs-teal)',   size: 36 },
                { variant: 'bars',  color: 'var(--gs-warn)',   size: 36 },
                { variant: 'orbit', color: 'var(--gs-danger)', size: 36 },
                { variant: 'pulse', color: 'var(--gs-accent)', size: 36 },
              ].map(({ variant, color, size }) => (
                <div key={variant} className="flex flex-col items-center gap-3">
                  <Spinner variant={variant} size={size} color={color} />
                  <span className="text-[10px] font-['DM_Mono'] text-[var(--gs-muted)] uppercase tracking-widest">{variant}</span>
                </div>
              ))}
            </div>
            {/* With label + size range */}
            <div className="flex flex-wrap gap-8 items-center">
              <Spinner variant="ring"  size={16} color="var(--gs-accent)" />
              <Spinner variant="ring"  size={24} color="var(--gs-teal)" />
              <Spinner variant="orbit" size={32} color="var(--gs-warn)" label="Syncing..." />
              <Spinner variant="pulse" size={40} color="var(--gs-danger)" thickness={3} />
              <Spinner variant="dots"  size={28} color="var(--gs-soft)" label="Loading data" />
            </div>
          </div>
        </section>

        {/* Skeletons */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-6">Skeleton Loaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonStat />
            <div className="space-y-2">
              <SkeletonBlock className="h-8 w-full" />
              <SkeletonBlock className="h-8 w-3/4" />
              <SkeletonBlock className="h-8 w-1/2" />
            </div>
          </div>
        </section>

        {/* Drag & Drop */}
        {(() => {
          const [sortItems, setSortItems] = useState([
            { id: 1, name: 'Leica TS16',    category: 'Total Station', status: 'Disponible' },
            { id: 2, name: 'Trimble R10',   category: 'GNSS',          status: 'En uso'      },
            { id: 3, name: 'Faro Focus S',  category: 'Scanner',       status: 'Disponible' },
            { id: 4, name: 'DJI Phantom 4', category: 'Drone',         status: 'Baja'        },
            { id: 5, name: 'Sokkia SDL50',  category: 'Level',         status: 'Mantenimiento'},
          ]);
          return (
            <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
              <h2 className="text-xl font-bold mb-1">Drag & Drop</h2>
              <p className="text-[var(--gs-soft)] text-xs font-['DM_Mono'] mb-8">DropZone · SortableList · native HTML5 DnD</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* DropZone */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--gs-soft)] uppercase tracking-wider mb-4 font-['DM_Mono']">File Upload</h3>
                  <DropZone
                    accept=".jpg,.png,.pdf,.csv"
                    multiple
                    maxSizeMB={5}
                    onFiles={(files) => toast.success(`${files.length} file(s) ready`)}
                  />
                </div>
                {/* SortableList */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--gs-soft)] uppercase tracking-wider mb-4 font-['DM_Mono']">Reorder Equipment</h3>
                  <SortableList
                    items={sortItems}
                    keyExtractor={(item) => item.id}
                    onChange={setSortItems}
                    renderItem={(item) => (
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--gs-text)] font-semibold truncate">{item.name}</p>
                          <p className="text-[11px] font-['DM_Mono'] text-[var(--gs-muted)]">{item.category}</p>
                        </div>
                        <Badge estado={item.status} />
                      </div>
                    )}
                  />
                </div>
              </div>
            </section>
          );
        })()}

        {/* Modals Section */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-6">Modal</h2>
          <div className="flex gap-3 flex-wrap">
            <Button variant="ghost" onClick={() => setModal('default')}>Default</Button>
            <Button variant="primary" onClick={() => setModal('success')}>Success</Button>
            <Button variant="danger" onClick={() => setModal('danger')}>Danger</Button>
            <Button variant="ghost" onClick={() => setModal('info')}>Info</Button>
            <Button variant="ghost" onClick={() => setModal('form')}>With Form</Button>
          </div>
        </section>

        {/* Default Modal */}
        <Modal
          open={modal === 'default'}
          onClose={() => setModal(null)}
          title="Inventory Detail"
          subtitle="Leica TS16 · Serial #GS-00142"
          icon="box"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
              <Button variant="primary" onClick={() => { setModal(null); toast.success('Changes saved'); }}>Save changes</Button>
            </>
          }
        >
          <p>This instrument is currently marked as <strong className="text-[var(--gs-text)]">Available</strong>. Last calibration was performed on March 12, 2026 and the next one is scheduled for September 2026.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-['DM_Mono']">
            {[['Type', 'Total Station'],['Brand','Leica'],['Location','Warehouse B'],['Condition','Excellent']].map(([k,v]) => (
              <div key={k} className="p-3 rounded-xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
                <span className="text-[var(--gs-soft)]">{k}</span>
                <div className="text-[var(--gs-text)] font-semibold mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </Modal>

        {/* Success Modal */}
        <Modal
          open={modal === 'success'}
          onClose={() => setModal(null)}
          title="Operation Completed"
          subtitle="All changes have been saved successfully."
          variant="success"
          size="sm"
          footer={<Button variant="primary" onClick={() => setModal(null)}>Got it</Button>}
        >
          <p>Your inventory has been updated. The equipment status was changed to <strong className="text-[var(--gs-accent)]">Available</strong> and the record has been synced across all linked projects.</p>
        </Modal>

        {/* Danger / Confirm Modal */}
        <Modal
          open={modal === 'danger'}
          onClose={() => setModal(null)}
          title="Confirm Deletion"
          subtitle="This action cannot be undone."
          variant="danger"
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => { setModal(null); toast.error('Item deleted'); }}>Delete permanently</Button>
            </>
          }
        >
          <p>You are about to permanently delete <strong className="text-[var(--gs-text)]">Leica TS16 #GS-00142</strong>. All associated records, assignments, and history will be removed from the system.</p>
        </Modal>

        {/* Info Modal */}
        <Modal
          open={modal === 'info'}
          onClose={() => setModal(null)}
          title="System Update"
          subtitle="NeonReactUI v2.4.0 — Release notes"
          variant="info"
          size="lg"
          footer={<Button variant="ghost" onClick={() => setModal(null)}>Dismiss</Button>}
        >
          <div className="space-y-3">
            {[
              ['Modal component','Responsive portal modal with focus trap, Escape key, neon variants, and smooth slide-up animation.'],
              ['Badge updates','New neutral variant and improved contrast ratios across all badge states.'],
              ['Skeleton loader','Added SkeletonStat for dashboard KPI placeholders.'],
            ].map(([feat, desc]) => (
              <div key={feat} className="flex gap-3 p-3 rounded-xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
                <Icon name="check" size={14} color="var(--gs-teal)" className="mt-0.5 shrink-0" />
                <div>
                  <div className="text-[var(--gs-text)] text-xs font-bold">{feat}</div>
                  <div className="text-[var(--gs-soft)] text-[12px] mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Modal>

        {/* Form Modal */}
        <Modal
          open={modal === 'form'}
          onClose={() => setModal(null)}
          title="Add Equipment"
          subtitle="Fill in the details to register a new item."
          icon="plus"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
              <Button variant="primary" onClick={() => { setModal(null); toast.success('Equipment registered'); }}>Register</Button>
            </>
          }
        >
          <div className="space-y-4">
            <InputField label="Equipment Name *">
              <input type="text" placeholder="e.g., Leica TS16" className="w-full bg-[var(--gs-card)] border border-[var(--gs-border)] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--gs-accent)]" />
            </InputField>
            <InputField label="Serial Number *">
              <input type="text" placeholder="e.g., GS-00143" className="w-full bg-[var(--gs-card)] border border-[var(--gs-border)] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--gs-accent)]" />
            </InputField>
            <InputField label="Location">
              <input type="text" placeholder="e.g., Warehouse B" className="w-full bg-[var(--gs-card)] border border-[var(--gs-border)] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--gs-accent)]" />
            </InputField>
          </div>
        </Modal>

        {/* Pagination & Toasts */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-6">Navigation & Feedback</h2>
          <div className="grid grid-cols-1 gap-8">
            <div>
              <h3 className="text-sm text-[var(--gs-soft)] mb-4 uppercase">Toast Notifications</h3>
              <div className="flex gap-2 flex-wrap">
                <Button variant="ghost" onClick={() => handleShowToast('success')}>Success</Button>
                <Button variant="danger" onClick={() => handleShowToast('error')}>Error</Button>
                <Button variant="primary" onClick={() => handleShowToast('loading')}>Loading Promise</Button>
              </div>
            </div>
            <div>
              <h3 className="text-sm text-[var(--gs-soft)] mb-4 uppercase">Pagination</h3>
              <Pagination 
                page={currentPage}
                totalPages={10}
                total={98}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
