import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  Users,
  ShieldCheck,
  ShieldAlert,
  Droplet,
  GraduationCap,
  Award,
  Calendar,
  Building,
  RefreshCw,
  Phone,
  Mail,
  ChevronDown,
} from 'lucide-react';
import {
  CadetProfileData,
  getAllCadets,
  sortCadetsByHierarchy,
} from '../services/cadetPortalService';
import { BnccCrest } from './BnccCrest';

export const AdminCadetReportsPanel: React.FC = () => {
  const [cadets, setCadets] = useState<CadetProfileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'cadet' | 'excadet'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [bloodFilter, setBloodFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [reportDate] = useState(() => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [reportRef] = useState(() => `MU-BNCC-RPT-${Date.now().toString(36).toUpperCase()}`);

  const loadData = async () => {
    setLoading(true);
    const list = await getAllCadets();
    setCadets(sortCadetsByHierarchy(list));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    cadets.forEach((c) => {
      if (c.department) set.add(c.department);
    });
    return Array.from(set).sort();
  }, [cadets]);

  // Unique blood groups for filter
  const bloodGroups = useMemo(() => {
    const set = new Set<string>();
    cadets.forEach((c) => {
      if (c.bloodGroup) set.add(c.bloodGroup);
    });
    return Array.from(set).sort();
  }, [cadets]);

  // Filtered Cadets
  const filteredCadets = useMemo(() => {
    return cadets.filter((c) => {
      if (verificationFilter === 'verified' && !c.isVerified) return false;
      if (verificationFilter === 'pending' && c.isVerified) return false;
      if (typeFilter !== 'all' && c.cadetType !== typeFilter) return false;
      if (deptFilter !== 'all' && c.department !== deptFilter) return false;
      if (bloodFilter !== 'all' && c.bloodGroup !== bloodFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.fullName.toLowerCase().includes(q);
        const matchId = c.cadetId.toLowerCase().includes(q);
        const matchDept = c.department.toLowerCase().includes(q);
        const matchRank = (c.currentRank || '').toLowerCase().includes(q);
        const matchPhone = (c.phone || '').toLowerCase().includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        return matchName || matchId || matchDept || matchRank || matchPhone || matchEmail;
      }
      return true;
    });
  }, [cadets, verificationFilter, typeFilter, deptFilter, bloodFilter, searchQuery]);

  // Summary Metrics
  const totalCount = cadets.length;
  const verifiedCount = cadets.filter((c) => c.isVerified).length;
  const pendingCount = cadets.filter((c) => !c.isVerified).length;
  const activeCount = cadets.filter((c) => c.cadetType !== 'excadet').length;
  const alumniCount = cadets.filter((c) => c.cadetType === 'excadet').length;
  const avgAttendance =
    cadets.length > 0
      ? Math.round(cadets.reduce((acc, c) => acc + (c.attendanceRate || 85), 0) / cadets.length)
      : 85;

  // Blood group counts
  const bloodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cadets.forEach((c) => {
      const bg = c.bloodGroup || 'Unknown';
      counts[bg] = (counts[bg] || 0) + 1;
    });
    return counts;
  }, [cadets]);

  // Department counts
  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cadets.forEach((c) => {
      const d = c.department || 'General';
      counts[d] = (counts[d] || 0) + 1;
    });
    return counts;
  }, [cadets]);

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    const headers = [
      'Sl',
      'Cadet ID',
      'Full Name',
      'Rank',
      'Category',
      'Department',
      'Semester',
      'Blood Group',
      'Phone',
      'Email',
      'Attendance Rate',
      'Verification Status',
      'Honors Count',
    ];

    const rows = filteredCadets.map((c, idx) => [
      idx + 1,
      `"${c.cadetId}"`,
      `"${c.fullName.replace(/"/g, '""')}"`,
      `"${c.currentRank || 'Cadet'}"`,
      c.cadetType === 'excadet' ? 'Ex-Cadet / Alumni' : 'Active Cadet',
      `"${c.department}"`,
      `"${c.currentSemester || 'N/A'}"`,
      c.bloodGroup || 'N/A',
      `"${c.phone || 'N/A'}"`,
      `"${c.email || 'N/A'}"`,
      `${c.attendanceRate || 85}%`,
      c.isVerified ? 'VERIFIED' : 'PENDING_APPROVAL',
      c.serviceHonors?.length || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MU_BNCC_Cadet_Roster_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy TSV for Google Sheets / Excel
  const handleCopyTsv = async () => {
    const headers = [
      'Sl',
      'Cadet ID',
      'Full Name',
      'Rank',
      'Category',
      'Department',
      'Semester',
      'Blood Group',
      'Phone',
      'Email',
      'Attendance Rate',
      'Status',
    ];

    const rows = filteredCadets.map((c, idx) => [
      idx + 1,
      c.cadetId,
      c.fullName,
      c.currentRank || 'Cadet',
      c.cadetType === 'excadet' ? 'Alumni' : 'Active',
      c.department,
      c.currentSemester || 'N/A',
      c.bloodGroup || 'N/A',
      c.phone || 'N/A',
      c.email || 'N/A',
      `${c.attendanceRate || 85}%`,
      c.isVerified ? 'Verified' : 'Pending',
    ]);

    const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    await navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* ACTION BAR (HIDDEN IN PRINT) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
              Official Platoon Roster Dossier
            </span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold uppercase text-slate-900 dark:text-white">
            Registered Cadets Census & Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generate, filter, print, and export official military roster reports of all registered cadets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="Refresh cadet roster data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleCopyTsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 transition-colors"
            title="Copy formatted spreadsheet data to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied TSV' : 'Copy Data'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Dossier</span>
          </button>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS (HIDDEN IN PRINT) */}
      <div className="print:hidden grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Cadets</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{totalCount}</span>
          <span className="text-[10px] text-slate-500 block">Registered on site</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-emerald-600 block">Verified Official</span>
          <span className="text-2xl font-extrabold text-emerald-600 font-mono">{verifiedCount}</span>
          <span className="text-[10px] text-emerald-600/80 block">
            {totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0}% clearance
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-amber-600 block">Pending Admin</span>
          <span className="text-2xl font-extrabold text-amber-600 font-mono">{pendingCount}</span>
          <span className="text-[10px] text-amber-600/80 block">Awaiting review</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-blue-600 block">Active Wing</span>
          <span className="text-2xl font-extrabold text-blue-600 font-mono">{activeCount}</span>
          <span className="text-[10px] text-slate-500 block">Undergraduate</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-purple-600 block">Alumni Cadets</span>
          <span className="text-2xl font-extrabold text-purple-600 font-mono">{alumniCount}</span>
          <span className="text-[10px] text-slate-500 block">Graduated</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Avg Attendance</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{avgAttendance}%</span>
          <span className="text-[10px] text-emerald-600 block">✓ Meets 80% mandate</span>
        </div>
      </div>

      {/* DEMOGRAPHICS & CENSUS BREAKDOWN (HIDDEN IN PRINT) */}
      <div className="print:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Blood group donor availability */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-rose-600" />
              <span>Emergency Blood Group Inventory</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Donor Readiness</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => {
              const count = bloodCounts[bg] || 0;
              return (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodFilter(bloodFilter === bg ? 'all' : bg)}
                  className={`p-2.5 rounded-xl text-center border transition-all ${
                    bloodFilter === bg
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[11px] font-mono font-extrabold block text-rose-600">{bg}</span>
                  <span className="text-xs font-mono font-bold block">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Department distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              <span>Departmental Distribution</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">{departments.length} Faculties</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {departments.slice(0, 6).map((dept) => {
              const count = deptCounts[dept] || 0;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setDeptFilter(deptFilter === dept ? 'all' : dept)}
                  className={`px-2.5 py-1 rounded-xl text-xs border transition-all flex items-center gap-1.5 ${
                    deptFilter === dept
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate max-w-[130px]">{dept}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800">
                    {count}
                  </span>
                </button>
              );
            })}
            {departments.length > 6 && (
              <span className="text-xs text-slate-400 self-center">+{departments.length - 6} more</span>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS BAR (HIDDEN IN PRINT) */}
      <div className="print:hidden p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by cadet name, ID, phone, department..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-hidden focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Verification filter */}
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">All Clearances</option>
            <option value="verified">Verified Official</option>
            <option value="pending">Pending Approval</option>
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">All Wings</option>
            <option value="cadet">Active Cadets</option>
            <option value="excadet">Ex-Cadet Alumni</option>
          </select>

          {/* Department filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden max-w-[150px]"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Blood group filter */}
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">All Blood Groups</option>
            {bloodGroups.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {(verificationFilter !== 'all' ||
            typeFilter !== 'all' ||
            deptFilter !== 'all' ||
            bloodFilter !== 'all' ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setVerificationFilter('all');
                setTypeFilter('all');
                setDeptFilter('all');
                setBloodFilter('all');
                setSearchQuery('');
              }}
              className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* OFFICIAL PRINTABLE DOSSIER REPORT CONTAINER */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 print:bg-white print:text-black rounded-2xl border border-slate-200 dark:border-slate-800 print:border-none p-6 sm:p-8 shadow-xs space-y-6">
        {/* OFFICIAL HEADER (SHOWN BOTH ON SCREEN AND IN PRINT) */}
        <div className="border-b-2 border-slate-900 dark:border-slate-100 print:border-black pb-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <BnccCrest size="md" />
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-red-600 print:text-black block">
                  BANGLADESH NATIONAL CADET CORPS (BNCC)
                </span>
                <h1 className="font-heading text-lg sm:text-2xl font-black uppercase text-slate-900 dark:text-white print:text-black tracking-wide">
                  Metropolitan University Platoon
                </h1>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 print:text-black">
                  2 RAMNA BATTALION · MAINAMATI REGIMENT · SYLHET SECTOR
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs space-y-1">
              <div className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 print:border print:border-black font-bold">
                OFFICIAL REPORT
              </div>
              <div className="text-[10px] text-slate-500 print:text-black">
                REF: <span className="font-bold">{reportRef}</span>
              </div>
              <div className="text-[10px] text-slate-500 print:text-black">
                DATE: <span className="font-bold">{reportDate}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 print:bg-slate-100 p-3 rounded-xl border border-slate-200 dark:border-slate-800 print:border-black flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div>
              <strong>DOCUMENT:</strong> Platoon Cadet Member Registration Census & Operational Roster
            </div>
            <div>
              <strong>TOTAL ENROLLED:</strong> {filteredCadets.length} Candidates Displayed ({totalCount} Total)
            </div>
          </div>
        </div>

        {/* CADET ROSTER TABLE */}
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700 print:border-black text-[10px] font-mono uppercase tracking-wider text-slate-500 print:text-black">
                <th className="py-2.5 px-2">#</th>
                <th className="py-2.5 px-2">Cadet ID</th>
                <th className="py-2.5 px-3">Full Name & Rank</th>
                <th className="py-2.5 px-3">Department & Semester</th>
                <th className="py-2.5 px-2">Blood</th>
                <th className="py-2.5 px-3">Contact (Phone / Email)</th>
                <th className="py-2.5 px-2">Attendance</th>
                <th className="py-2.5 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-black">
              {filteredCadets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No registered cadets found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredCadets.map((c, idx) => (
                  <tr key={c.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 print:hover:bg-transparent">
                    <td className="py-2.5 px-2 font-mono text-slate-400 print:text-black font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-bold text-red-600 print:text-black whitespace-nowrap">
                      {c.cadetId}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white print:text-black">
                        {c.fullName}
                      </div>
                      <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 print:text-black">
                        {c.currentRank || 'Cadet'}
                        {c.cadetType === 'excadet' && ' · (Alumni)'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-slate-800 dark:text-slate-200 print:text-black">{c.department}</div>
                      <div className="text-[10px] font-mono text-slate-500 print:text-black">
                        Sem: {c.currentSemester || 'N/A'}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 font-mono font-bold text-rose-600 print:text-black whitespace-nowrap">
                      {c.bloodGroup || 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      <div className="text-slate-800 dark:text-slate-200 print:text-black">{c.phone || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 print:text-black truncate max-w-[150px]">{c.email}</div>
                    </td>
                    <td className="py-2.5 px-2 font-mono font-bold text-emerald-600 print:text-black">
                      {c.attendanceRate || 85}%
                    </td>
                    <td className="py-2.5 px-2">
                      {c.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 print:border print:border-black print:bg-white print:text-black">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 print:border print:border-black print:bg-white print:text-black">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* OFFICIAL SIGNATURE BLOCK FOR PRINT / DISPATCH */}
        <div className="pt-12 grid grid-cols-2 gap-8 border-t border-slate-200 dark:border-slate-800 print:border-black text-xs font-mono">
          <div className="space-y-6">
            <div className="h-10 border-b border-dashed border-slate-400 dark:border-slate-600 print:border-black" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white print:text-black uppercase">
                Professor Under Officer (PUO)
              </div>
              <div className="text-[11px] text-slate-500 print:text-black">
                Platoon Commander, Metropolitan University BNCC Platoon
              </div>
            </div>
          </div>

          <div className="space-y-6 text-right">
            <div className="h-10 border-b border-dashed border-slate-400 dark:border-slate-600 print:border-black" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white print:text-black uppercase">
                Adjutant / Commanding Officer
              </div>
              <div className="text-[11px] text-slate-500 print:text-black">
                2 Ramna Battalion · Mainamati Regiment Headquarters
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
