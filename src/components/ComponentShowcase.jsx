import React, { useState } from 'react';
import {
  Button,
  Badge,
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
    <div className="min-h-screen bg-[var(--gs-bg)] text-[var(--gs-text)] p-8 font-['Syne']">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">NeonReactUI Showcase</h1>
          <p className="text-[var(--gs-soft)] font-['DM_Mono']">Complete component library adaptation</p>
        </div>

        {/* Buttons Section */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-6">Buttons & Icons</h2>
          <div className="flex gap-4 flex-wrap items-center">
            <Button variant="primary">Primary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button disabled>Disabled Button</Button>
            
            <div className="flex gap-4 ml-8">
              <Icon name="box" size={24} color="var(--gs-accent)" />
              <Icon name="users" size={24} color="var(--gs-teal)" />
              <Icon name="chart" size={24} color="var(--gs-warn)" />
            </div>
          </div>
        </section>

        {/* Inputs & Search */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-6">Form Elements</h2>
          <div className="grid grid-cols-2 gap-8">
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
          <div className="grid grid-cols-4 gap-4">
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

        {/* Loading & Skeletons */}
        <section className="card p-6 rounded-2xl bg-[var(--gs-surface)] border border-[var(--gs-border)]">
          <h2 className="text-xl font-bold mb-6">Loading States</h2>
          <div className="space-y-8">
            <div className="flex gap-8 items-center">
              <Spinner />
              <Spinner size={24} color="var(--gs-teal)" thickness={3} />
              <Spinner size={32} color="var(--gs-danger)" />
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonStat />
              <div className="space-y-2">
                <SkeletonBlock className="h-8 w-full" />
                <SkeletonBlock className="h-8 w-3/4" />
                <SkeletonBlock className="h-8 w-1/2" />
              </div>
            </div>
          </div>
        </section>

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
