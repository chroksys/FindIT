import React, { useState, useEffect, useMemo } from 'react';
import { ChartBar, Users, Eye, ArrowUpRight, ArrowDownRight, CalendarBlank } from '@phosphor-icons/react';
import { useUserContext } from '../context/UserContext';
import { useEventContext } from '../context/EventContext';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Analytics = () => {
  const { profile } = useUserContext();
  const { events } = useEventContext();
  const [pageViews, setPageViews] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Get only events hosted by this user
  const hostEvents = useMemo(() => events.filter(e => e.organizer?.id === profile?.id), [events, profile?.id]);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;
      setIsLoading(true);
      try {
        // Fetch live follower count directly from follows table (always accurate)
        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('host_id', profile.id);
        setFollowersCount(count || 0);

        // Fetch page views for all host's events
        const eventIds = hostEvents.map(e => e.id);
        if (eventIds.length > 0) {
          const { data: viewsData } = await supabase
            .from('page_views')
            .select('created_at')
            .in('event_id', eventIds);
          
          if (viewsData) setPageViews(viewsData);
        }
      } catch (err) {
        console.error('Error fetching analytics data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Real-time subscription: update follower count live as users follow/unfollow
    if (!profile?.id) return;
    const channel = supabase
      .channel(`follows-host-${profile.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'follows', filter: `host_id=eq.${profile.id}` },
        () => setFollowersCount(prev => prev + 1)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'follows', filter: `host_id=eq.${profile.id}` },
        () => setFollowersCount(prev => Math.max(0, prev - 1))
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, hostEvents]);

  const totalEvents = hostEvents.length;
  const totalRsvps = hostEvents.reduce((acc, event) => acc + (event.rsvps?.filter(r => r.status === 'going').length || 0), 0);
  const totalViews = pageViews.length;

  // Group data by day for the last 30 days
  const chartData = useMemo(() => {
    const data: any[] = [];
    const today = new Date();
    
    // Create map of last 30 days
    const viewsByDay: Record<string, number> = {};
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      viewsByDay[dateStr] = 0;
      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dateStr,
        views: 0
      });
    }

    // Populate views
    pageViews.forEach(v => {
      const dateStr = v.created_at.split('T')[0];
      if (viewsByDay[dateStr] !== undefined) {
        const item = data.find(d => d.fullDate === dateStr);
        if (item) item.views++;
      }
    });
    
    return data;
  }, [pageViews]);

  return (
    <div className="container section page-with-nav" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 'var(--spacing-xlarge)',
      paddingTop: 'calc(max(env(safe-area-inset-top, 0px), 24px) + 16px)' 
    }}>
      
      <div className="animate-fade-in-up">
        <h1 className="text-hero" style={{ fontSize: '32px', marginBottom: 'var(--spacing-micro)' }}>Host Analytics</h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Track the performance of your events across the platform.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-large)', marginBottom: 'var(--spacing-xlarge)' }}>
        <StatCard title="Active Events" value={totalEvents.toString()} change="" isPositive={true} icon={<CalendarBlank size={24} />} delay="0.1s" />
        <StatCard title="Total Tickets Sold" value={totalRsvps.toString()} change="" isPositive={true} icon={<ChartBar size={24} />} delay="0.2s" />
        <StatCard title="Page Views" value={totalViews.toString()} change="" isPositive={true} icon={<Eye size={24} />} delay="0.3s" />
        <StatCard title="Total Followers" value={followersCount.toString()} change="" isPositive={true} icon={<Users size={24} />} delay="0.4s" />
      </div>

      {/* Chart Area */}
      <div className="card-padding animate-fade-in-up" style={{ animationDelay: '0.5s', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-large)' }}>
          <h3 className="text-card-title">Event Page Views (Last 30 Days)</h3>
        </div>

        <div style={{ flexGrow: 1, width: '100%', height: '300px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
              Loading analytics...
            </div>
          ) : pageViews.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--color-primary)' }}
                />
                <Line type="monotone" dataKey="views" name="Page Views" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
              No page views recorded yet. Share your events to get traffic!
            </div>
          )}
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
      {change && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isPositive ? 'var(--color-success)' : 'var(--color-error)', fontSize: '13px', fontWeight: 600 }}>
          {isPositive ? <ArrowUpRight size={14} weight="bold" /> : <ArrowDownRight size={14} weight="bold" />}
          {change}
        </div>
      )}
    </div>
  </div>
);
