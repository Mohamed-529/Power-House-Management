import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Truck, CheckCircle, Wrench, Navigation, Clock, Users, TrendingUp } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { KpiCard } from '../components/ui/KpiCard';
import { Badge } from '../components/ui/Badge';

export default function Dashboard() {
  const vehicles = useAppStore((s) => s.vehicles);
  const trips = useAppStore((s) => s.trips);
  const drivers = useAppStore((s) => s.drivers);

  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');

  const activeVehicles = vehicles.filter((v) => v.status !== 'Retired').length;
  const availableVehicles = vehicles.filter((v) => v.status === 'Available').length;
  const inMaintenance = vehicles.filter((v) => v.status === 'In Shop').length;
  const activeTrips = trips.filter((t) => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter((t) => t.status === 'Draft').length;
  const driversOnDuty = drivers.filter((d) => d.status === 'On Trip' || d.status === 'Available').length;
  const utilization = Math.round((vehicles.filter((v) => v.status === 'On Trip').length / Math.max(activeVehicles, 1)) * 100);

  const vehicleStatusData = [
    { name: 'Available', count: availableVehicles, color: '#22C55E' },
    { name: 'On Trip', count: vehicles.filter((v) => v.status === 'On Trip').length, color: '#2563EB' },
    { name: 'In Shop', count: inMaintenance, color: '#F59E0B' },
    { name: 'Retired', count: vehicles.filter((v) => v.status === 'Retired').length, color: '#EF4444' },
  ];

  const filteredTrips = trips.filter((t) => {
    const veh = vehicles.find((v) => v.id === t.vehicleId);
    if (typeFilter !== 'All' && veh?.type !== typeFilter) return false;
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (regionFilter !== 'All' && veh?.region !== regionFilter) return false;
    return true;
  });

  const recentTrips = filteredTrips.slice(0, 6);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Filters</span>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input w-auto text-xs py-1.5">
          <option value="All">Vehicle Type: All</option>
          {['Van', 'Truck', 'Mini', 'Bus'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto text-xs py-1.5">
          <option value="All">Status: All</option>
          {['Dispatched', 'Completed', 'Draft', 'Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="input w-auto text-xs py-1.5">
          <option value="All">Region: All</option>
          {['North', 'South', 'East', 'West'].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <KpiCard label="Active Vehicles" value={activeVehicles} accent="blue" icon={<Truck size={15} />} />
        <KpiCard label="Available" value={availableVehicles} accent="green" icon={<CheckCircle size={15} />} />
        <KpiCard label="In Maintenance" value={inMaintenance} accent="orange" icon={<Wrench size={15} />} />
        <KpiCard label="Active Trips" value={activeTrips} accent="blue" icon={<Navigation size={15} />} />
        <KpiCard label="Pending Trips" value={pendingTrips} accent="orange" icon={<Clock size={15} />} />
        <KpiCard label="Drivers On Duty" value={driversOnDuty} accent="green" icon={<Users size={15} />} />
        <KpiCard label="Fleet Utilization" value={`${utilization}%`} accent="blue" icon={<TrendingUp size={15} />} />
      </div>

      {/* Recent Trips + Vehicle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Trips table */}
        <div className="lg:col-span-2 card">
          <h2 className="text-sm font-semibold text-white mb-4">Recent Trips</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-border">
                <th className="text-left pb-2 font-medium">Trip</th>
                <th className="text-left pb-2 font-medium">Vehicle</th>
                <th className="text-left pb-2 font-medium">Driver</th>
                <th className="text-left pb-2 font-medium">Status</th>
                <th className="text-left pb-2 font-medium">ETA</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((t) => (
                <tr key={t.id} className="border-b border-border/50 table-row-hover">
                  <td className="py-2.5 text-gray-300 font-mono text-xs">{t.id}</td>
                  <td className="py-2.5 text-gray-300">{t.vehicleName || '—'}</td>
                  <td className="py-2.5 text-gray-300">{t.driverName || '—'}</td>
                  <td className="py-2.5"><Badge label={t.status} /></td>
                  <td className="py-2.5 text-gray-400 text-xs">{t.eta || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vehicle Status Chart */}
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4">Vehicle Status</h2>
          <div className="space-y-3">
            {vehicleStatusData.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{item.name}</span>
                  <span className="text-white font-medium">{item.count}</span>
                </div>
                <div className="h-2 bg-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.count / Math.max(vehicles.length, 1)) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Distribution</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={vehicleStatusData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#1C212B', border: '1px solid #2A3240', borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {vehicleStatusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
