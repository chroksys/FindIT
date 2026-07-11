import React from 'react';
import { ChartBar, Users, Eye, Heart, ArrowUpRight, ArrowDownRight, UserPlus } from '@phosphor-icons/react';

export const Analytics = () => {
  return (
    <div className="container section" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xlarge)' }}>
      
      <div className="animate-fade-in-up">
        <h1 className="text-hero" style={{ fontSize: '32px', marginBottom: 'var(--spacing-micro)' }}>Host Analytics</h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Track the performance of your events across the platform.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--spacing-large)' }}>
        <StatCard title="Total Views" value="12,450" change="+14.5%" isPositive={true} icon={<Eye size={24} />} delay="0.1s" />
        <StatCard title="Ticket Sales (Est)" value="UGX 4.2M" change="+5.2%" isPositive={true} icon={<ChartBar size={24} />} delay="0.2s" />
        <StatCard title="Event Saves" value="842" change="-2.1%" isPositive={false} icon={<Heart size={24} />} delay="0.3s" />
        <StatCard title="Followers" value="150" change="+12.0%" isPositive={true} icon={<UserPlus size={24} />} delay="0.4s" />
        <StatCard title="Profile Visits" value="3,120" change="+8.4%" isPositive={true} icon={<Users size={24} />} delay="0.5s" />
      </div>

      {/* Mock Chart Area */}
      <div className="card-padding animate-fade-in-up" style={{ animationDelay: '0.5s', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-large)' }}>
          <h3 className="text-card-title">Audience Engagement over Time</h3>
          <select className="btn-secondary" style={{ padding: '8px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>This Year</option>
          </select>
        </div>

        {/* CSS Chart Mockup */}
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', gap: '10%', padding: 'var(--spacing-large) 0', borderBottom: '1px solid var(--border-color)' }}>
          {[40, 70, 45, 90, 60, 100, 85].map((height, i) => (
            <div key={i} style={{ 
              flex: 1, 
              height: `${height}%`, 
              backgroundColor: 'var(--color-pin-orange)', 
              borderRadius: '4px 4px 0 0',
              opacity: 0.8,
              transition: 'height 1s ease-out'
            }}></div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-small)', color: 'var(--text-secondary)', fontSize: '12px' }}>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ title, value, change, isPositive, icon, delay }: { title: string, value: string, change: string, isPositive: boolean, icon: React.ReactNode, delay: string }) => (
  <div className="card-padding animate-fade-in-up" style={{ animationDelay: delay, backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
      <span className="text-body" style={{ fontWeight: 600 }}>{title}</span>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isPositive ? 'var(--color-success)' : 'var(--color-error)', fontSize: '13px', fontWeight: 600 }}>
        {isPositive ? <ArrowUpRight size={14} weight="bold" /> : <ArrowDownRight size={14} weight="bold" />}
        {change} from last month
      </div>
    </div>
  </div>
);
