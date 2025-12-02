'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MailWarning, 
  ShieldCheck, 
  ChevronDown, 
  Search, 
  Bell, 
  UploadCloud,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Briefcase,
  Layers,
  Target,
  AlertTriangle,
  Zap,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';

// --- INITIAL MOCK DATA ---
const INITIAL_CSV_DATA = `Date,Client_ID,Tool_Source,Campaign_Name,Inbox_Provider,Tech_Stack,Job_Title_Level,Emails_Sent,Replies,Positive_Replies,Meetings_Booked,Bounces,Daily_Meeting_Goal
2025-10-01,Stark Industries,SmartLead,Ent. Outreach,Google Workspace,Salesforce,C-Suite,150,12,4,2,2,3
2025-10-01,Stark Industries,SmartLead,Ent. Outreach,Outlook 365,Salesforce,VP,180,15,5,1,4,3
2025-10-02,Stark Industries,EmailBison,Volume Blast,Google Workspace,HubSpot,Director,300,8,2,0,5,3
2025-10-05,Acme Corp,SmartLead,SaaS Founders,Google Workspace,Shopify,Founder,120,25,8,4,1,2
2025-10-05,Acme Corp,HubSpot_Manual,Referral Flow,Outlook 365,Shopify,Founder,15,8,6,3,0,2
2025-10-10,Stark Industries,SmartLead,Ent. Outreach,Outlook 365,Salesforce,VP,200,10,2,1,5,3
2025-10-12,Stark Industries,SmartLead,Ent. Outreach,Outlook 365,Salesforce,VP,220,11,3,1,8,3
2025-10-14,Stark Industries,SmartLead,Ent. Outreach,Outlook 365,Salesforce,VP,250,12,3,0,12,3
2025-10-15,Stark Industries,SmartLead,Ent. Outreach,Outlook 365,Salesforce,VP,300,5,0,0,48,3
2025-10-15,Stark Industries,SmartLead,Ent. Outreach,Google Workspace,Salesforce,C-Suite,150,14,5,2,2,3
2025-10-16,Stark Industries,SmartLead,Ent. Outreach,Outlook 365,Salesforce,VP,280,6,1,0,35,3
2025-10-18,GTMA (Agency Internal),SmartLead,Agency Partners,Google Workspace,Magento,Director,100,5,1,0,2,1
2025-10-18,GTMA (Agency Internal),EmailBison,Agency Partners,Outlook 365,Shopify,Director,150,18,6,3,3,1
2025-10-20,Acme Corp,SmartLead,SaaS Founders,Google Workspace,WooCommerce,Founder,110,8,2,1,2,2
2025-10-22,Acme Corp,SmartLead,SaaS Founders,Google Workspace,Shopify,Founder,130,28,9,5,1,2
`;

// --- UTILITIES ---
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const entry = {};
    headers.forEach((header, index) => {
      const val = values[index]?.trim();
      entry[header] = isNaN(Number(val)) ? val : Number(val);
    });
    return entry;
  });
};

const COLORS = {
  primary: '#6366f1', // Indigo 500
  secondary: '#8b5cf6', // Violet 500
  success: '#10b981', // Emerald 500
  warning: '#f59e0b', // Amber 500
  danger: '#ef4444', // Red 500
  dark: '#0f172a', // Slate 900
  card: '#1e293b', // Slate 800
  text: '#f8fafc', // Slate 50
  grid: '#334155', // Slate 700
  providers: {
    'Google Workspace': '#10b981', // Emerald
    'Outlook 365': '#ef4444',      // Red (for the crisis demo)
    'SMTP (Mailreef)': '#f59e0b'   // Amber
  }
};

const GOLDEN_WINDOW_DATA = [
  { day: 'Mon', hours: [1, 2, 2, 3, 2, 1, 1, 0] },
  { day: 'Tue', hours: [2, 3, 4, 4, 4, 3, 2, 1] }, 
  { day: 'Wed', hours: [2, 3, 4, 4, 3, 2, 1, 1] },
  { day: 'Thu', hours: [1, 2, 3, 3, 2, 2, 1, 1] },
  { day: 'Fri', hours: [1, 1, 2, 1, 0, 0, 0, 0] },
];
const HOURS_LABEL = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM'];

// --- COMPONENTS ---

const Card = ({ title, subtitle, children, className = "", actionItem }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-6 shadow-sm flex flex-col ${className}`}>
    <div className="mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
      <div>
        <h3 className="text-slate-100 font-semibold text-lg flex items-center gap-2">
          {title}
        </h3>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {actionItem}
    </div>
    <div className="flex-1 min-h-0 relative">
      {children}
    </div>
  </div>
);

const KPICard = ({ title, value, subtext, trend, trendValue, icon: Icon, alert }) => (
  <div className={`bg-slate-800 border ${alert ? 'border-rose-500/50 bg-rose-500/5' : 'border-slate-700'} rounded-xl p-6 hover:border-indigo-500/50 transition-colors relative overflow-hidden`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${alert ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700/50 text-indigo-400'}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {trendValue}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <h4 className="text-slate-400 text-sm font-medium">{title}</h4>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtext && <p className="text-slate-500 text-xs">{subtext}</p>}
    </div>
    {alert && (
      <div className="absolute top-0 right-0 p-2">
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
        </span>
      </div>
    )}
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, isOpen, notification, onClick }) => (
  <div onClick={onClick} className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all ${
    active 
      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
  }`}>
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 flex-shrink-0" />
      {/* Show text if sidebar is open OR if on mobile (since sidebar is full width on mobile) */}
      <span className={`font-medium text-sm whitespace-nowrap ${!isOpen && 'lg:hidden'}`}>{label}</span>
    </div>
    {(isOpen || !isOpen) && notification && (
      <span className={`bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ${!isOpen && 'lg:hidden'}`}>
        {notification}
      </span>
    )}
  </div>
);

// --- MAIN APP COMPONENT ---

export default function AgencyDashboard() {
  const [data, setData] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  
  // Desktop Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Mobile Sidebar State
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load Initial Data
  useEffect(() => {
    const parsed = parseCSV(INITIAL_CSV_DATA);
    setData(parsed);
    const uniqueClients = [...new Set(parsed.map(item => item.Client_ID))];
    setClients(uniqueClients);
    if (uniqueClients.includes('Stark Industries')) {
      setSelectedClient('Stark Industries');
    } else if (uniqueClients.length > 0) {
      setSelectedClient(uniqueClients[0]);
    }
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);
      setData(parsed);
      const uniqueClients = [...new Set(parsed.map(item => item.Client_ID))];
      setClients(uniqueClients);
    };
    reader.readAsText(file);
  };

  // --- DATA PROCESSING LOGIC ---
  const filteredData = useMemo(() => {
    return data.filter(d => d.Client_ID === selectedClient);
  }, [data, selectedClient]);

  const metrics = useMemo(() => {
    if (!filteredData.length) return { sent: 0, replies: 0, positive: 0, meetings: 0, bounces: 0, goal: 0 };
    return filteredData.reduce((acc, curr) => ({
      sent: acc.sent + (curr.Emails_Sent || 0),
      replies: acc.replies + (curr.Replies || 0),
      positive: acc.positive + (curr.Positive_Replies || 0),
      meetings: acc.meetings + (curr.Meetings_Booked || 0),
      bounces: acc.bounces + (curr.Bounces || 0),
      goal: acc.goal + (curr.Daily_Meeting_Goal || 0)
    }), { sent: 0, replies: 0, positive: 0, meetings: 0, bounces: 0, goal: 0 });
  }, [filteredData]);

  const healthTrend = useMemo(() => {
    const dailyData = {};
    filteredData.forEach(row => {
      if (!dailyData[row.Date]) dailyData[row.Date] = { date: row.Date };
      const provider = row.Inbox_Provider || 'Unknown';
      
      if (!dailyData[row.Date][provider]) {
        dailyData[row.Date][provider] = { sent: 0, bounces: 0 };
      }
      dailyData[row.Date][provider].sent += row.Emails_Sent;
      dailyData[row.Date][provider].bounces += row.Bounces;
    });

    return Object.values(dailyData).map(day => {
      const entry = { date: day.date };
      Object.keys(day).forEach(key => {
        if (key !== 'date') {
          const stats = day[key];
          entry[key] = stats.sent > 0 ? ((stats.bounces / stats.sent) * 100).toFixed(1) : 0;
        }
      });
      return entry;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData]);

  const techStackData = useMemo(() => {
    const stacks = {};
    filteredData.forEach(row => {
      const stack = row.Tech_Stack || 'Unknown';
      if (!stacks[stack]) stacks[stack] = { name: stack, sent: 0, positive: 0 };
      stacks[stack].sent += row.Emails_Sent;
      stacks[stack].positive += row.Positive_Replies;
    });
    return Object.values(stacks)
      .map(s => ({
        ...s,
        rate: s.sent > 0 ? ((s.positive / s.sent) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [filteredData]);

  const goalData = useMemo(() => {
    const timeline = {};
    filteredData.forEach(row => {
      if (!timeline[row.Date]) timeline[row.Date] = { date: row.Date, actual: 0, goal: 0 };
      timeline[row.Date].actual += row.Meetings_Booked;
      timeline[row.Date].goal += row.Daily_Meeting_Goal;
    });
    return Object.values(timeline).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData]);

  const sourceData = useMemo(() => {
    const sources = {};
    filteredData.forEach(row => {
      const source = row.Tool_Source || 'Unknown';
      if (!sources[source]) sources[source] = { name: source, value: 0 };
      sources[source].value += row.Emails_Sent;
    });
    return Object.values(sources);
  }, [filteredData]);

  const hasHighBounceRate = useMemo(() => {
    if (!filteredData.length) return false;
    const totalSent = filteredData.reduce((acc, curr) => acc + curr.Emails_Sent, 0);
    const totalBounces = filteredData.reduce((acc, curr) => acc + curr.Bounces, 0);
    return (totalBounces / totalSent) > 0.05;
  }, [filteredData]);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR - Responsive drawer on mobile, relative on desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 bg-slate-950 border-r border-slate-800 transition-all duration-300
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 relative rounded overflow-hidden flex-shrink-0">
               <img src="/logo.png" alt="GTMA" className="object-contain w-full h-full bg-slate-900" />
               <div className="absolute inset-0 bg-indigo-600 flex items-center justify-center -z-10">
                 <span className="font-bold text-white text-xs">G</span>
               </div>
             </div>
             {/* Show title if sidebar is open (desktop) or always on mobile (since mobile is full width) */}
             <span className={`font-bold text-lg tracking-tight ${!isSidebarOpen && 'lg:hidden'}`}>GTMA <span className="text-indigo-500">OS</span></span>
           </div>
           
           {/* Close button for mobile */}
           <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
             <X className="w-6 h-6" />
           </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <SidebarItem icon={LayoutDashboard} label="Command Center" active isOpen={isSidebarOpen} onClick={() => setIsMobileOpen(false)} />
          <SidebarItem icon={Users} label="Prospects" isOpen={isSidebarOpen} onClick={() => setIsMobileOpen(false)} />
          <SidebarItem icon={Briefcase} label="Campaigns" isOpen={isSidebarOpen} onClick={() => setIsMobileOpen(false)} />
          
          <div className="pt-4 pb-2">
            {(isSidebarOpen || isMobileOpen) && <p className={`px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'lg:hidden'}`}>Intelligence</p>}
            <SidebarItem icon={ShieldCheck} label="Enrichment Validator" isOpen={isSidebarOpen} onClick={() => setIsMobileOpen(false)} />
            <SidebarItem icon={Layers} label="Tech Stack Analysis" isOpen={isSidebarOpen} notification="New" onClick={() => setIsMobileOpen(false)} />
            <SidebarItem icon={Clock} label="Golden Window" isOpen={isSidebarOpen} notification="AI" onClick={() => setIsMobileOpen(false)} />
          </div>

          <div className="pt-4 pb-2">
            {(isSidebarOpen || isMobileOpen) && <p className={`px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'lg:hidden'}`}>RevOps Monitor</p>}
            <SidebarItem icon={MailWarning} label="Inbox Health" isOpen={isSidebarOpen} notification={hasHighBounceRate ? "!" : null} onClick={() => setIsMobileOpen(false)} />
            <SidebarItem icon={Database} label="Data Warehouse" isOpen={isSidebarOpen} onClick={() => setIsMobileOpen(false)} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-900 p-2 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              JD
            </div>
            {/* Show user info if open or on mobile */}
            <div className={`overflow-hidden ${!isSidebarOpen && 'lg:hidden'}`}>
                <p className="text-sm font-medium text-slate-200">John Doe</p>
                <p className="text-xs text-slate-500 truncate">john@gtma.agency</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        
        {/* TOP BAR */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
             {/* Mobile Menu Toggle */}
             <button onClick={() => setIsMobileOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
               <Menu className="w-6 h-6" />
             </button>

             {/* Multi-Tenancy Switcher */}
             <div className="relative group hidden sm:block">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer transition-all">
                  <div className={`w-2 h-2 rounded-full ${hasHighBounceRate ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                  <span className="text-sm font-medium text-slate-200">{selectedClient || 'Select Client'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </div>
                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                   <div className="p-2 space-y-1">
                     <p className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase">Your Agency</p>
                     <button onClick={() => setSelectedClient('GTMA (Agency Internal)')} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-700 text-slate-300">GTMA (Agency Internal)</button>
                     <div className="h-px bg-slate-700 my-1"></div>
                     <p className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase">Clients</p>
                     {clients.filter(c => c !== 'GTMA (Agency Internal)').map(c => (
                       <button 
                        key={c} 
                        onClick={() => setSelectedClient(c)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-700 ${selectedClient === c ? 'text-indigo-400 bg-slate-700/50' : 'text-slate-300'}`}
                       >
                         {c}
                       </button>
                     ))}
                   </div>
                </div>
             </div>

             <div className="h-6 w-px bg-slate-800 mx-2 hidden sm:block"></div>

             <h2 className="text-lg md:text-xl font-semibold text-white tracking-tight flex items-center gap-2 truncate">
               <span className="hidden sm:inline">Agency</span> Command Center
               {hasHighBounceRate && <span className="bg-rose-500/10 text-rose-400 text-xs px-2 py-0.5 rounded border border-rose-500/20 whitespace-nowrap">Critical Alert</span>}
             </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             {/* Global Date Filter Mockup */}
            <div className="hidden lg:flex items-center px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-800 text-slate-400 text-sm">
               <span>Oct 2025</span>
               <ChevronDown className="w-4 h-4 ml-2" />
            </div>

            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
               <Bell className="w-5 h-5" />
               {hasHighBounceRate && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900 animate-ping"></span>}
            </button>
            <label className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors shadow-lg shadow-indigo-500/20">
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Import CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-24">
          
          {/* TOP KPI GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <KPICard 
              title="Pipeline Generated" 
              value={`$${((metrics.positive * 25000) / 1000).toFixed(0)}k`} 
              subtext="Weighted Value"
              trend="up" 
              trendValue="12.5%" 
              icon={Database} 
            />
            <KPICard 
              title="Meetings Booked" 
              value={metrics.meetings} 
              subtext={`${((metrics.meetings / (metrics.goal || 1)) * 100).toFixed(0)}% of Goal`}
              trend="up" 
              trendValue="4.2%" 
              icon={Target} 
            />
             <KPICard 
              title="Win Rate (MQL)" 
              value={`${((metrics.positive / (metrics.sent || 1)) * 100).toFixed(1)}%`} 
              subtext="Positive Reply Rate"
              trend="up" 
              trendValue="2.1%" 
              icon={ArrowUpRight} 
            />
            <KPICard 
              title="Global Bounce Rate" 
              value={`${((metrics.bounces / (metrics.sent || 1)) * 100).toFixed(1)}%`}
              subtext="Across all Providers"
              trend="down" 
              trendValue="Critical" 
              icon={AlertTriangle} 
              alert={hasHighBounceRate}
            />
          </div>

          {/* MAIN CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-8">
            
            {/* 1. GOAL TRACKING (Goal vs Actual) */}
            <Card title="Revenue Forecast" subtitle="Meetings Booked vs. Daily Goals" className="lg:col-span-8 h-[350px] md:h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={goalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                       <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                   <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                   />
                   <YAxis stroke="#94a3b8" fontSize={12} />
                   <Tooltip 
                    contentStyle={{ backgroundColor: COLORS.card, borderColor: COLORS.grid, color: COLORS.text }}
                    itemStyle={{ color: COLORS.text }}
                   />
                   <Legend />
                   <Area type="monotone" dataKey="actual" name="Actual Meetings" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorActual)" strokeWidth={3} />
                   <Line type="step" dataKey="goal" name="Planned Goal" stroke={COLORS.success} strokeWidth={2} dot={false} strokeDasharray="5 5" />
                 </ComposedChart>
               </ResponsiveContainer>
            </Card>

            {/* 2. UNIFIED DATA SOURCE */}
            <Card title="Traffic Source" subtitle="Volume by Tool" className="lg:col-span-4 h-[350px] md:h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={sourceData}
                     cx="50%"
                     cy="50%"
                     innerRadius={80}
                     outerRadius={120}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {sourceData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={[COLORS.primary, COLORS.secondary, COLORS.warning][index % 3]} />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{ backgroundColor: COLORS.card, borderColor: COLORS.grid, color: COLORS.text }} />
                   <Legend verticalAlign="bottom" height={36}/>
                   {/* Center Text */}
                   <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-100 text-2xl font-bold">
                     {metrics.sent.toLocaleString()}
                   </text>
                   <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-500 text-xs">
                     Total Sent
                   </text>
                 </PieChart>
               </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-8">
            
            {/* 3. THE GOLDEN WINDOW (NEW FEATURE) */}
            <Card 
              title="The Golden Window" 
              subtitle="Yield Optimization (Best Time to Send)" 
              className="lg:col-span-8 min-h-[400px]"
              actionItem={<div className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 whitespace-nowrap">AI Recommended: Tue 11AM - 2PM</div>}
            >
               <div className="flex-1 flex flex-col justify-center overflow-x-auto pb-2">
                 {/* Scroll wrapper for mobile */}
                 <div className="min-w-[600px] grid grid-cols-9 gap-2">
                    {/* Header Row (Hours) */}
                    <div className="text-xs font-bold text-slate-500 text-right pr-2 self-end mb-2">Day/Time</div>
                    {HOURS_LABEL.map(h => (
                      <div key={h} className="text-xs font-medium text-slate-500 text-center mb-2">{h}</div>
                    ))}

                    {/* Data Rows */}
                    {GOLDEN_WINDOW_DATA.map((row, rIdx) => (
                      <React.Fragment key={row.day}>
                        <div className="text-sm font-medium text-slate-400 text-right pr-2 py-2 flex items-center justify-end">{row.day}</div>
                        {row.hours.map((score, hIdx) => {
                          // Opacity logic for heatmap visualization
                          const intensity = score === 0 ? 'bg-slate-800' : 
                                           score === 1 ? 'bg-emerald-900/40' : 
                                           score === 2 ? 'bg-emerald-600/60' : 
                                           score === 3 ? 'bg-emerald-500/80' : 
                                           'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'; // Glowing effect for max score
                          return (
                            <div key={hIdx} className={`rounded-md h-10 w-full ${intensity} transition-all duration-300 hover:scale-105 cursor-pointer relative group`}>
                               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <span className="text-[10px] font-bold text-black bg-white/90 px-1 rounded shadow-sm">
                                   {score === 4 ? 'HOT' : score}x
                                 </span>
                               </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                 </div>
                 <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-900/40"></div> Low Yield</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-600/60"></div> Medium</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]"></div> High Yield (Golden)</div>
                 </div>
               </div>
            </Card>

            {/* 4. TECH STACK INTELLIGENCE */}
            <Card title="Tech Stack Intel" subtitle="Win Rate by Target Tech" className="lg:col-span-4 h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={techStackData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
                   <XAxis type="number" stroke="#94a3b8" fontSize={12} unit="%" />
                   <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                   <Tooltip 
                     cursor={{fill: COLORS.grid, opacity: 0.4}}
                     contentStyle={{ backgroundColor: COLORS.card, borderColor: COLORS.grid, color: COLORS.text }}
                     formatter={(value) => [`${value}%`, 'Win Rate']}
                   />
                   <Bar dataKey="rate" name="Positive Reply Rate" radius={[0, 4, 4, 0]}>
                      {techStackData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Number(entry.rate) > 5 ? COLORS.success : COLORS.primary} />
                      ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 5. INBOX HEALTH MONITOR (The "Ops" Flex) */}
            <Card 
              title="Inbox Health Monitor" 
              subtitle="Bounce Rate by Provider (Threshold: 5%)" 
              className="lg:col-span-12 h-[350px]"
              actionItem={
                hasHighBounceRate && (
                  <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 whitespace-nowrap">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-rose-400 hidden sm:inline">CRITICAL: OUTLOOK SPIKE</span>
                    <span className="text-xs font-bold text-rose-400 sm:hidden">ALERT</span>
                  </div>
                )
              }
            >
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={healthTrend} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                   <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                   />
                   <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                   <Tooltip contentStyle={{ backgroundColor: COLORS.card, borderColor: COLORS.grid, color: COLORS.text }} />
                   <Legend />
                   <Line type="monotone" dataKey="Google Workspace" stroke={COLORS.providers['Google Workspace']} strokeWidth={2} dot={false} />
                   <Line type="monotone" dataKey="Outlook 365" stroke={COLORS.providers['Outlook 365']} strokeWidth={2} dot={true} />
                   <Line type="monotone" dataKey={() => 5} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} name="Danger Zone (5%)" dot={false} />
                 </LineChart>
               </ResponsiveContainer>
            </Card>

          </div>

          <div className="mt-8 flex items-center justify-center space-x-2 text-slate-600 text-xs">
            <Database className="w-3 h-3" />
            <span className="hidden sm:inline">Data Warehouse: BigQuery (Connected via Unified Schema)</span>
            <span className="sm:hidden">BigQuery Connected</span>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <span>Sync Frequency: Real-time</span>
          </div>

        </div>
      </main>
    </div>
  );
}
