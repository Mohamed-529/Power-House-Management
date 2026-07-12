import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  LineChart, Line, CartesianGrid, AreaChart, Area
} from 'recharts';
import { Download } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { KpiCard } from '../components/ui/KpiCard';
import { monthlyRevenue } from '../store/mockData';
import { formatNumber } from '../utils/format';

const tooltipStyle = {
  contentStyle: { background: '#1C212B', border: '1px solid #2A3240', borderRadius: 8, fontSize: 12 },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

export default function Analytics() {
  const { vehicles, fuelLogs, maintenance, trips } = useAppStore();

  const activeVehicles = vehicles.filter((v) => v.status !== 'Retired').length;
  const onTripVehicles = vehicles.filter((v) => v.status === 'On Trip').length;
  const utilization = Math.round((onTripVehicles / Math.max(activeVehicles, 1)) * 100);

  const totalFuel = fuelLogs.reduce((s, f) => s + f.total, 0);
  const totalMaint = maintenance.reduce((s, m) => s + m.cost, 0);
  const operationalCost = totalFuel + totalMaint;

  const totalDistance = trips.filter((t) => t.status === 'Completed').reduce((s, t) => s + t.plannedDistance, 0);
  const totalLiters = fuelLogs.reduce((s, f) => s + f.liters, 0);
  const fuelEfficiency = totalLiters > 0 ? (totalDistance / totalLiters).toFixed(1) : '0';

  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const totalAcq = vehicles.reduce((s, v) => s + v.acquisitionCost, 0);
  const roi = totalAcq > 0 ? (((totalRevenue - operationalCost) / totalAcq) * 100).toFixed(1) : '0';

  // Vehicle cost data for bar chart
  const vehicleCostData = vehicles
    .map((v) => ({
      name: v.name,
      cost: maintenance.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0) +
        fuelLogs.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.total, 0),
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);

  const fuelEfficiencyData = vehicles.slice(0, 6).map((v) => {
    const liters = fuelLogs.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.liters, 0);
    const dist = trips.filter((t) => t.vehicleId === v.id && t.status === 'Completed').reduce((s, t) => s + t.plannedDistance, 0);
    return { name: v.name, efficiency: liters > 0 ? +(dist / liters).toFixed(1) : 0 };
  });

  // ── CSV export ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows: string[][] = [];

    // Summary KPIs
    rows.push(['Section', 'Metric', 'Value']);
    rows.push(['Summary', 'Fuel Efficiency (km/l)', fuelEfficiency]);
    rows.push(['Summary', 'Fleet Utilization (%)', String(utilization)]);
    rows.push(['Summary', 'Operational Cost (₹)', String(operationalCost)]);
    rows.push(['Summary', 'Vehicle ROI (%)', roi]);
    rows.push([]);

    // Vehicle costs
    rows.push(['Vehicle Costs', 'Vehicle', 'Total Cost (₹)']);
    vehicleCostData.forEach((v) => rows.push(['Vehicle Costs', v.name, String(v.cost)]));
    rows.push([]);

    // Fuel efficiency per vehicle
    rows.push(['Fuel Efficiency', 'Vehicle', 'km/l']);
    fuelEfficiencyData.forEach((v) => rows.push(['Fuel Efficiency', v.name, String(v.efficiency)]));
    rows.push([]);

    // Monthly revenue
    rows.push(['Monthly Revenue', 'Month', 'Revenue (₹)']);
    monthlyRevenue.forEach((m) => rows.push(['Monthly Revenue', m.month, String(m.revenue)]));

    const csv = rows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleetops-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Reports & Analytics</p>
        <button
          onClick={exportCSV}
          className="btn-ghost flex items-center gap-1.5 text-xs py-1.5 border border-border hover:border-gray-500"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Fuel Efficiency" value={`${fuelEfficiency} km/l`} accent="green" />
        <KpiCard label="Fleet Utilization" value={`${utilization}%`} accent="blue" />
        <KpiCard label="Operational Cost" value={formatNumber(operationalCost)} accent="orange" />
        <KpiCard label="Vehicle ROI" value={`${roi}%`} accent="blue" />
      </div>

      <p className="text-xs text-gray-500">ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost</p>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Revenue */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3240" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`₹${formatNumber(Number(v))}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="url(#revGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Costliest Vehicles */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Top Costliest Vehicles</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={vehicleCostData} layout="vertical" barSize={18}>
              <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`₹${formatNumber(Number(v))}`, 'Total Cost']} />
              <Bar dataKey="cost" fill="#EF4444" radius={[0, 4, 4, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fuel Efficiency per vehicle */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Fuel Efficiency (km/l)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fuelEfficiencyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3240" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`${Number(v)} km/l`, 'Efficiency']} />
              <Bar dataKey="efficiency" fill="#22C55E" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet utilization line */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Fleet Utilization Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyRevenue.map((m, i) => ({ ...m, util: 60 + i * 3 + Math.floor(Math.random() * 8) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3240" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`${Number(v)}%`, 'Utilization']} />
              <Line type="monotone" dataKey="util" stroke="#F59E0B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
