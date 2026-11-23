'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  DetailedClient,
  CLIENTS_DETAILED,
  ResponsibleParty,
} from '@/data/clientsData';
import { ClientDetailView } from './ClientDetailView';
import {
  Search,
  Filter,
  Plus,
  Download,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  AlertCircle,
  Calendar,
  FileText,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  Eye,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  ShieldAlert,
  Building,
  HeartHandshake,
} from 'lucide-react';

type SortField =
  | 'id'
  | 'name'
  | 'status'
  | 'program'
  | 'careArrangement'
  | 'household'
  | 'city'
  | 'authorizedHours'
  | 'authExpiry'
  | 'administrator';

type SortDirection = 'asc' | 'desc';

interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}

export const ClientsPage: React.FC = () => {
  const { selectedId, navigate, deIdentify, showToast } = useApp();

  // Local list state allowing client additions and modifications
  const [clients, setClients] = useState<DetailedClient[]>(CLIENTS_DETAILED);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [payerFilter, setPayerFilter] = useState<string>('All');
  const [arrangementFilter, setArrangementFilter] = useState<string>('All');
  const [adminFilter, setAdminFilter] = useState<string>('All');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [householdFilter, setHouseholdFilter] = useState<string>('All');
  const [authStatusFilter, setAuthStatusFilter] = useState<string>('All');
  const [stageFilter, setStageFilter] = useState<string>('All');

  // Advanced filters popover state
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals & Panels
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [quickScheduleClient, setQuickScheduleClient] = useState<DetailedClient | null>(null);

  // Column Configuration
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'id', label: 'ID', visible: true },
    { id: 'name', label: 'Client Name', visible: true },
    { id: 'status', label: 'Status', visible: true },
    { id: 'program', label: 'Program / Payer', visible: true },
    { id: 'careArrangement', label: 'Arrangement', visible: true },
    { id: 'household', label: 'Household', visible: true },
    { id: 'respParty1', label: 'Responsible Party #1', visible: true },
    { id: 'respParty2', label: 'Responsible Party #2', visible: false },
    { id: 'phone', label: 'Phone', visible: false },
    { id: 'email', label: 'Email', visible: false },
    { id: 'city', label: 'City / Location', visible: true },
    { id: 'authorizedHours', label: 'Auth Hrs/Wk', visible: true },
    { id: 'authExpiry', label: 'Auth Expiry', visible: true },
    { id: 'administrator', label: 'Administrator', visible: true },
    { id: 'actions', label: 'Quick Actions', visible: true },
  ]);

  const toggleColumnVisibility = (colId: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === colId ? { ...c, visible: !c.visible } : c))
    );
  };

  const isColVisible = (id: string) => {
    const col = columns.find((c) => c.id === id);
    return col ? col.visible : true;
  };

  // If a client is selected, render the detailed view
  if (selectedId) {
    return (
      <ClientDetailView
        clientId={selectedId}
        onBack={() => navigate('clients', null)}
        onSelectClient={(id) => navigate('clients', id)}
      />
    );
  }

  // Active filter count for badge
  const activeFiltersCount = [
    statusFilter !== 'All',
    payerFilter !== 'All',
    arrangementFilter !== 'All',
    adminFilter !== 'All',
    regionFilter !== 'All',
    householdFilter !== 'All',
    authStatusFilter !== 'All',
    stageFilter !== 'All',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setStatusFilter('All');
    setPayerFilter('All');
    setArrangementFilter('All');
    setAdminFilter('All');
    setRegionFilter('All');
    setHouseholdFilter('All');
    setAuthStatusFilter('All');
    setStageFilter('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Filter & Search Logic
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Search term
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = client.name.toLowerCase().includes(query) || deIdentify(client.name).toLowerCase().includes(query);
        const matchesId = client.id.toLowerCase().includes(query);
        const matchesHousehold = client.household.toLowerCase().includes(query);
        const matchesPayer = client.program.toLowerCase().includes(query);
        const matchesCity = client.city.toLowerCase().includes(query);
        const matchesAdmin = client.administrator.toLowerCase().includes(query);
        const matchesPhone = client.phone.toLowerCase().includes(query);

        if (!matchesName && !matchesId && !matchesHousehold && !matchesPayer && !matchesCity && !matchesAdmin && !matchesPhone) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'All' && client.status !== statusFilter) return false;

      // Payer / Program
      if (payerFilter !== 'All' && !client.program.toLowerCase().includes(payerFilter.toLowerCase())) return false;

      // Arrangement
      if (arrangementFilter !== 'All' && client.careArrangement !== arrangementFilter) return false;

      // Admin
      if (adminFilter !== 'All' && client.administrator !== adminFilter) return false;

      // Region
      if (regionFilter !== 'All' && client.region !== regionFilter) return false;

      // Household (Single vs Multi)
      if (householdFilter !== 'All') {
        const isMulti = client.household.toLowerCase().includes('family') || client.householdId === 'HH-091';
        if (householdFilter === 'Multi-Client' && !isMulti) return false;
        if (householdFilter === 'Single-Client' && isMulti) return false;
      }

      // Auth Status
      if (authStatusFilter !== 'All') {
        if (authStatusFilter === 'Expiring in 30 days') {
          const auth = client.authorizations?.[0];
          const isExpiring = auth ? auth.daysUntilExpiry <= 30 && auth.daysUntilExpiry > 0 : false;
          if (!isExpiring && client.authStatus !== 'Expiring') return false;
        } else if (authStatusFilter === 'Expired') {
          if (client.authStatus !== 'Expired') return false;
        } else if (authStatusFilter === 'Active') {
          if (client.authStatus !== 'Active') return false;
        } else if (authStatusFilter === 'Pending') {
          if (client.authStatus !== 'Pending') return false;
        }
      }

      // Onboarding Stage
      if (stageFilter !== 'All' && client.onboardingStage !== stageFilter) return false;

      return true;
    });
  }, [
    clients,
    searchQuery,
    statusFilter,
    payerFilter,
    arrangementFilter,
    adminFilter,
    regionFilter,
    householdFilter,
    authStatusFilter,
    stageFilter,
    deIdentify,
  ]);

  // Sorting Logic
  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'id':
          valA = a.id;
          valB = b.id;
          break;
        case 'name':
          valA = a.name;
          valB = b.name;
          break;
        case 'status':
          valA = a.status;
          valB = b.status;
          break;
        case 'program':
          valA = a.program;
          valB = b.program;
          break;
        case 'careArrangement':
          valA = a.careArrangement;
          valB = b.careArrangement;
          break;
        case 'household':
          valA = a.household;
          valB = b.household;
          break;
        case 'city':
          valA = a.city;
          valB = b.city;
          break;
        case 'authorizedHours':
          valA = a.authorizedHours;
          valB = b.authorizedHours;
          break;
        case 'authExpiry':
          valA = a.authExpiry;
          valB = b.authExpiry;
          break;
        case 'administrator':
          valA = a.administrator;
          valB = b.administrator;
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredClients, sortField, sortDirection]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedClients.length / rowsPerPage) || 1;
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedClients.slice(start, start + rowsPerPage);
  }, [sortedClients, currentPage, rowsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Bulk Selection Handlers
  const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pageIds = paginatedClients.map((c) => c.id);
      setSelectedIds((prev) => new Set([...prev, ...pageIds]));
    } else {
      const pageIds = new Set(paginatedClients.map((c) => c.id));
      setSelectedIds((prev) => new Set([...prev].filter((id) => !pageIds.has(id))));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllPageSelected =
    paginatedClients.length > 0 &&
    paginatedClients.every((c) => selectedIds.has(c.id));

  // Export to CSV
  const handleExportCSV = (exportSelectedOnly = false) => {
    const targetClients = exportSelectedOnly
      ? clients.filter((c) => selectedIds.has(c.id))
      : sortedClients;

    if (targetClients.length === 0) {
      showToast('No clients to export.');
      return;
    }

    const headers = [
      'Client ID',
      'Name',
      'Status',
      'Program/Payer',
      'Care Arrangement',
      'Household',
      'Phone',
      'Email',
      'Address',
      'City',
      'State',
      'Zip',
      'Authorized Hrs/Wk',
      'Auth Expiry',
      'Administrator',
      'Case Manager',
      'Next RN Visit',
    ];

    const rows = targetClients.map((c) => [
      `"${c.id}"`,
      `"${c.name}"`,
      `"${c.status}"`,
      `"${c.program}"`,
      `"${c.careArrangement}"`,
      `"${c.household}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.address}"`,
      `"${c.city}"`,
      `"${c.state}"`,
      `"${c.zip}"`,
      `"${c.authorizedHours}"`,
      `"${c.authExpiry}"`,
      `"${c.administrator}"`,
      `"${c.caseManager}"`,
      `"${c.nextRnVisit}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `lilisare_clients_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${targetClients.length} clients to CSV.`);
  };

  // Bulk Actions
  const handleBulkAssignAdmin = (adminName: string) => {
    if (!adminName || selectedIds.size === 0) return;
    setClients((prev) =>
      prev.map((c) =>
        selectedIds.has(c.id) ? { ...c, administrator: adminName } : c
      )
    );
    showToast(`Assigned ${adminName} to ${selectedIds.size} client(s).`);
    setSelectedIds(new Set());
  };

  const handleBulkChangeStatus = (newStatus: DetailedClient['status']) => {
    if (!newStatus || selectedIds.size === 0) return;
    setClients((prev) =>
      prev.map((c) =>
        selectedIds.has(c.id) ? { ...c, status: newStatus } : c
      )
    );
    showToast(`Updated status to ${newStatus} for ${selectedIds.size} client(s).`);
    setSelectedIds(new Set());
  };

  // Add Client Form State
  const [newClientData, setNewClientData] = useState({
    name: '',
    program: 'Medicaid K-Plan',
    careArrangement: 'Agency' as const,
    household: '',
    phone: '',
    email: '',
    address: '',
    city: 'Portland',
    state: 'OR',
    zip: '97201',
    authorizedHours: 24,
    administrator: 'Lisa Connell',
  });

  const handleCreateNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.name.trim()) {
      showToast('Client name is required.');
      return;
    }

    const newId = `HH-${1010 + clients.length}`;
    const newRecord: DetailedClient = {
      ...CLIENTS_DETAILED[0], // base template
      id: newId,
      name: newClientData.name,
      status: 'Onboarding',
      program: newClientData.program,
      careArrangement: newClientData.careArrangement,
      household: newClientData.household || `${newClientData.name.split(' ').pop()} Household`,
      householdId: `HH-${Math.floor(Math.random() * 900 + 100)}`,
      phone: newClientData.phone || '(503) 555-0100',
      email: newClientData.email || 'client@example.com',
      address: newClientData.address || '100 Main St',
      city: newClientData.city || 'Portland',
      state: newClientData.state || 'OR',
      zip: newClientData.zip || '97201',
      authorizedHours: Number(newClientData.authorizedHours) || 20,
      administrator: newClientData.administrator,
      alertNote: 'New onboarding client. Intake packet in progress.',
      onboardingStage: 'Intake Packet',
      authStatus: 'Active',
      authExpiry: '2026-12-31',
      leadCreatedDate: new Date().toISOString().slice(0, 10),
      startDate: new Date().toISOString().slice(0, 10),
      responsibleParties: [
        {
          id: 'RP-NEW-1',
          name: `${newClientData.name} Emergency Contact`,
          relationship: 'Family Member',
          legalRole: 'Primary Contact',
          isEmergency: true,
          order: 1,
          phone: newClientData.phone || '(503) 555-0100',
          email: newClientData.email || 'contact@example.com',
          preferredContact: 'Phone & SMS',
          hasPortalAccess: true,
          notificationPrefs: 'Urgent notices, monthly statements',
        },
      ],
      careTeam: [
        {
          id: 'CT-NEW-1',
          name: newClientData.administrator,
          role: 'RN Clinical Supervisor',
          payType: 'Clinical Staff',
          phone: '(503) 555-0199',
          email: 'clinical@lilisare.demo',
        },
      ],
      authorizations: [
        {
          id: 'AUTH-NEW-1',
          authNumber: `AUTH-${Math.floor(Math.random() * 89999 + 10000)}`,
          payer: newClientData.program,
          waiver: 'Standard Waiver',
          serviceCode: 'T1019',
          serviceDesc: 'Personal Care Services',
          unitsApproved: (Number(newClientData.authorizedHours) || 20) * 4 * 12,
          unitsUsed: 0,
          unitsRemaining: (Number(newClientData.authorizedHours) || 20) * 4 * 12,
          startDate: new Date().toISOString().slice(0, 10),
          expiryDate: '2026-12-31',
          daysUntilExpiry: 340,
          caseManagerName: 'County Case Manager',
          caseManagerPhone: '(503) 555-0155',
          caseManagerEmail: 'casemanager@multco.us',
          status: 'Active',
        },
      ],
      upcomingVisits: [],
      careNotes: [],
      adminNotes: [],
      documents: [],
      medications: [],
      incidents: [],
      recentClaims: [],
      assignedForms: [],
      timeline: [],
    };

    setClients((prev) => [newRecord, ...prev]);
    setIsNewClientModalOpen(false);
    showToast(`Created new client ${newRecord.name} (${newRecord.id}).`);
    navigate('clients', newRecord.id);
  };

  // Schedule Quick Modal Submit
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickScheduleClient) return;
    showToast(`Scheduled visit for ${quickScheduleClient.name}. Added to clinical dispatch calendar.`);
    setQuickScheduleClient(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans text-stone-800">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3E6B2B]/10 text-[#2d5a27] flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#1c2a17]">
                Clients
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#3E6B2B]/10 text-[#2d5a27] border border-[#3E6B2B]/20">
                {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
                {filteredClients.length !== clients.length && ` (of ${clients.length})`}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Comprehensive client registry, payer authorizations, care arrangements, and AxisCare-aligned service profiles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Column Settings Toggle */}
          <button
            type="button"
            onClick={() => setIsColumnModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition shadow-xs"
            title="Configure table columns"
          >
            <SlidersHorizontal size={14} className="text-stone-500" />
            <span>Columns</span>
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={() => handleExportCSV(false)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition shadow-xs"
            title="Export clients to CSV"
          >
            <Download size={14} className="text-stone-500" />
            <span>Export</span>
          </button>

          {/* New Client Button */}
          <button
            type="button"
            onClick={() => setIsNewClientModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2d5a27] hover:bg-[#23471f] rounded-lg shadow-sm transition active:scale-98"
          >
            <Plus size={15} />
            <span>New Client</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-xl">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by client name, ID (HH-1003), household, payer, admin, or city…"
              className="w-full pl-10 pr-9 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]/25 focus:bg-white text-stone-900 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Advanced Filters Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition ${
                activeFiltersCount > 0
                  ? 'bg-[#3E6B2B]/10 border-[#3E6B2B]/40 text-[#2d5a27]'
                  : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Filter size={14} />
              <span>Advanced Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#2d5a27] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown
                size={14}
                className={`transition-transform ${isAdvancedFiltersOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* ACTIVE FILTER CHIPS */}
        {(activeFiltersCount > 0 || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-stone-100 text-xs">
            <span className="text-stone-400 font-medium">Active filters:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-xs border border-stone-200">
                Search: &ldquo;{searchQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-stone-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {statusFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#3E6B2B]/10 text-[#2d5a27] text-xs border border-[#3E6B2B]/20 font-medium">
                Status: {statusFilter}
                <button
                  type="button"
                  onClick={() => setStatusFilter('All')}
                  className="hover:text-stone-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {payerFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs border border-blue-200 font-medium">
                Payer: {payerFilter}
                <button
                  type="button"
                  onClick={() => setPayerFilter('All')}
                  className="hover:text-stone-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {arrangementFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs border border-purple-200 font-medium">
                Arrangement: {arrangementFilter}
                <button
                  type="button"
                  onClick={() => setArrangementFilter('All')}
                  className="hover:text-stone-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {adminFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs border border-amber-200 font-medium">
                Admin: {adminFilter}
                <button
                  type="button"
                  onClick={() => setAdminFilter('All')}
                  className="hover:text-stone-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {regionFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 text-xs border border-teal-200 font-medium">
                Region: {regionFilter}
                <button
                  type="button"
                  onClick={() => setRegionFilter('All')}
                  className="hover:text-stone-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {householdFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 text-xs border border-stone-200 font-medium">
                Household: {householdFilter}
                <button
                  type="button"
                  onClick={() => setHouseholdFilter('All')}
                  className="hover:text-stone-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {authStatusFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-50 text-orange-800 text-xs border border-orange-200 font-medium">
                Auth: {authStatusFilter}
                <button
                  type="button"
                  onClick={() => setAuthStatusFilter('All')}
                  className="hover:text-stone-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {stageFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 text-xs border border-indigo-200 font-medium">
                Stage: {stageFilter}
                <button
                  type="button"
                  onClick={() => setStageFilter('All')}
                  className="hover:text-stone-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-stone-500 hover:text-red-600 underline font-medium text-xs ml-auto"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ADVANCED FILTERS EXPANDED PANEL */}
        {isAdvancedFiltersOpen && (
          <div className="pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* 1. Status */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="On Hold">On Hold</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>

            {/* 2. Program / Payer */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Program / Payer
              </label>
              <select
                value={payerFilter}
                onChange={(e) => {
                  setPayerFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Payers</option>
                <option value="Medicaid K-Plan">Medicaid K-Plan</option>
                <option value="IHSS">IHSS Attendant Care</option>
                <option value="CFC">CFC (Community First Choice)</option>
                <option value="HCBS">HCBS Waiver</option>
                <option value="IRSS">IRSS Supported Living</option>
                <option value="PDN">Private Duty Nursing (PDN)</option>
                <option value="Private Pay">Private Pay</option>
                <option value="VA Aid & Attendance">VA Aid & Attendance</option>
              </select>
            </div>

            {/* 3. Care Arrangement */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Care Arrangement
              </label>
              <select
                value={arrangementFilter}
                onChange={(e) => {
                  setArrangementFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Arrangements</option>
                <option value="Agency">Agency (W-2 Caregivers)</option>
                <option value="Family Care">Family Care (Attendant)</option>
                <option value="Hybrid">Hybrid (Family + Agency)</option>
              </select>
            </div>

            {/* 4. Administrator */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Administrator
              </label>
              <select
                value={adminFilter}
                onChange={(e) => {
                  setAdminFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Administrators</option>
                <option value="Lisa Connell">Lisa Connell</option>
                <option value="Devon Brooks">Devon Brooks</option>
                <option value="Marcus Vance">Marcus Vance</option>
                <option value="Dana Whitfield">Dana Whitfield, RN</option>
                <option value="Maya R.">Maya R.</option>
                <option value="Sarah Jenkins">Sarah Jenkins</option>
              </select>
            </div>

            {/* 5. Region */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Region
              </label>
              <select
                value={regionFilter}
                onChange={(e) => {
                  setRegionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Regions</option>
                <option value="Multnomah County">Multnomah County</option>
                <option value="Washington County">Washington County</option>
                <option value="Clackamas County">Clackamas County</option>
                <option value="Denver Metro">Denver Metro</option>
                <option value="Boulder">Boulder</option>
                <option value="Colorado Springs">Colorado Springs</option>
              </select>
            </div>

            {/* 6. Household */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Household Structure
              </label>
              <select
                value={householdFilter}
                onChange={(e) => {
                  setHouseholdFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Households</option>
                <option value="Single-Client">Single Client</option>
                <option value="Multi-Client">Multi-Client Household</option>
              </select>
            </div>

            {/* 7. Authorization Status */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Authorization Status
              </label>
              <select
                value={authStatusFilter}
                onChange={(e) => {
                  setAuthStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Authorization States</option>
                <option value="Active">Active</option>
                <option value="Expiring in 30 days">Expiring within 30 days</option>
                <option value="Expired">Expired</option>
                <option value="Pending">Pending County Approval</option>
              </select>
            </div>

            {/* 8. Onboarding Stage */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Onboarding Stage
              </label>
              <select
                value={stageFilter}
                onChange={(e) => {
                  setStageFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Stages</option>
                <option value="Active Care">Active Care</option>
                <option value="Assessment">Initial Assessment</option>
                <option value="Intake Packet">Intake Packet</option>
                <option value="Auth Pending">Auth Pending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 3. BULK ACTIONS FLOATING BAR */}
      {selectedIds.size > 0 && (
        <div className="bg-[#1c2a17] text-white px-4 py-3 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#3E6B2B] text-white text-xs font-bold flex items-center justify-center">
              {selectedIds.size}
            </span>
            <span className="text-xs font-semibold">
              {selectedIds.size} client{selectedIds.size > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs">
            {/* Assign Admin */}
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg">
              <span className="text-stone-300 text-[11px]">Assign Admin:</span>
              <select
                onChange={(e) => handleBulkAssignAdmin(e.target.value)}
                defaultValue=""
                className="bg-stone-800 text-white text-xs rounded px-2 py-1 border border-stone-600 focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
              >
                <option value="" disabled>Choose staff…</option>
                <option value="Lisa Connell">Lisa Connell</option>
                <option value="Devon Brooks">Devon Brooks</option>
                <option value="Marcus Vance">Marcus Vance</option>
                <option value="Dana Whitfield">Dana Whitfield</option>
                <option value="Maya R.">Maya R.</option>
              </select>
            </div>

            {/* Change Status */}
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg">
              <span className="text-stone-300 text-[11px]">Set Status:</span>
              <select
                onChange={(e) => handleBulkChangeStatus(e.target.value as any)}
                defaultValue=""
                className="bg-stone-800 text-white text-xs rounded px-2 py-1 border border-stone-600 focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
              >
                <option value="" disabled>Choose status…</option>
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="On Hold">On Hold</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>

            {/* Export Selected */}
            <button
              type="button"
              onClick={() => handleExportCSV(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition"
            >
              <Download size={13} />
              <span>Export Selected</span>
            </button>

            {/* Clear Selection */}
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-stone-300 hover:text-white underline ml-2"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* 4. CLIENTS DATA TABLE */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* STICKY TABLE HEADER */}
            <thead className="bg-[#f7f9f6] text-stone-700 font-semibold border-b border-stone-200 sticky top-0 z-10 select-none">
              <tr>
                {/* Select All Checkbox */}
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={handleSelectAllOnPage}
                    className="w-4 h-4 rounded border-stone-300 text-[#2d5a27] focus:ring-[#3E6B2B]/30"
                  />
                </th>

                {/* ID Column */}
                {isColVisible('id') && (
                  <th
                    onClick={() => handleSort('id')}
                    className="py-3 px-3 cursor-pointer hover:bg-stone-100/80 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>ID</span>
                      {sortField === 'id' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={11} className="text-stone-400" />
                      )}
                    </div>
                  </th>
                )}

                {/* Name Column */}
                {isColVisible('name') && (
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-4 cursor-pointer hover:bg-stone-100/80 transition min-w-[200px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Client Name</span>
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={11} className="text-stone-400" />
                      )}
                    </div>
                  </th>
                )}

                {/* Status Column */}
                {isColVisible('status') && (
                  <th
                    onClick={() => handleSort('status')}
                    className="py-3 px-3 cursor-pointer hover:bg-stone-100/80 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={11} className="text-stone-400" />
                      )}
                    </div>
                  </th>
                )}

                {/* Program / Payer */}
                {isColVisible('program') && (
                  <th
                    onClick={() => handleSort('program')}
                    className="py-3 px-3 cursor-pointer hover:bg-stone-100/80 transition min-w-[140px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Program / Payer</span>
                      {sortField === 'program' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={11} className="text-stone-400" />
                      )}
                    </div>
                  </th>
                )}

                {/* Care Arrangement */}
                {isColVisible('careArrangement') && (
                  <th
                    onClick={() => handleSort('careArrangement')}
                    className="py-3 px-3 cursor-pointer hover:bg-stone-100/80 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Arrangement</span>
                      {sortField === 'careArrangement' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={11} className="text-stone-400" />
                      )}
                    </div>
                  </th>
                )}

                {/* Household */}
                {isColVisible('household') && (
                  <th
                    onClick={() => handleSort('household')}
                    className="py-3 px-3 cursor-pointer hover:bg-stone-100/80 transition min-w-[150px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Household</span>
                      {sortField === 'household' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={11} className="text-stone-400" />
                      )}
                    </div>
                  </th>
                )}

                {/* Responsible Party #1 */}
                {isColVisible('respParty1') && (
                  <th className="py-3 px-3 min-w-[180px]">
                    <span>Responsible Party #1</span>
                  </th>
                )}

                {/* Responsible Party #2 */}
                {isColVisible('respParty2') && (
                  <th className="py-3 px-3 min-w-[180px]">
                    <span>Responsible Party #2</span>
                  </th>
                )}

                {/* Phone */}
                {isColVisible('phone') && (
                  <th className="py-3 px-3">
                    <span>Phone</span>
                  </th>
                )}

                {/* Email */}
                {isColVisible('email') && (
                  <th className="py-3 px-3">
                    <span>Email</span>
                  </th>
                )}

                {/* City / Location */}
                {isColVisible('city') && (
                  <th
                    onClick={() => handleSort('city')}
                    className="py-3 px-3 cursor-pointer hover:bg-stone-100/80 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>City / Location</span>
                      {sortField === 'city' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={11} className="text-stone-400" />
                      )}
                    </div>
                  </th>
                )}

                {/* Authorized Hrs/Wk */}
                {isColVisible('authorizedHours') && (
                  <th
                    onClick={() => handleSort('authorizedHours')}
                    className="py-3 px-3 cursor-pointer hover:bg-stone-100/80 transition text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Auth Hrs/Wk</span>
                      {sortField === 'authorizedHours' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={11} className="text-stone-400" />
                      )}
                    </div>
                  </th>
                )}

                {/* Auth Expiry */}
                {isColVisible('authExpiry') && (
                  <th
                    onClick={() => handleSort('authExpiry')}
                    className="py-3 px-3 cursor-pointer hover:bg-stone-100/80 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Auth Expiry</span>
                      {sortField === 'authExpiry' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={11} className="text-stone-400" />
                      )}
                    </div>
                  </th>
                )}

                {/* Administrator */}
                {isColVisible('administrator') && (
                  <th
                    onClick={() => handleSort('administrator')}
                    className="py-3 px-3 cursor-pointer hover:bg-stone-100/80 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Administrator</span>
                      {sortField === 'administrator' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={11} className="text-stone-400" />
                      )}
                    </div>
                  </th>
                )}

                {/* Quick Actions */}
                {isColVisible('actions') && (
                  <th className="py-3 px-4 text-right">
                    <span>Actions</span>
                  </th>
                )}
              </tr>
            </thead>

            {/* TABLE BODY (ZEBRA ROWS) */}
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {paginatedClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.filter((c) => c.visible).length + 1}
                    className="py-12 text-center text-stone-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users size={32} className="text-stone-300" />
                      <p className="font-semibold text-sm">No clients found matching filters</p>
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-xs text-[#2d5a27] font-medium underline mt-1"
                      >
                        Reset all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client, idx) => {
                  const isSelected = selectedIds.has(client.id);
                  const isExpiringSoon =
                    client.authStatus === 'Expiring' ||
                    (client.authorizations?.[0]?.daysUntilExpiry !== undefined &&
                      client.authorizations[0].daysUntilExpiry <= 30 &&
                      client.authorizations[0].daysUntilExpiry > 0);
                  const isExpired = client.authStatus === 'Expired';
                  const hasDocReview = client.documents?.some(
                    (d) => d.status === 'Review needed' || d.status === 'Expired'
                  );

                  const rp1 = client.responsibleParties?.[0];
                  const rp2 = client.responsibleParties?.[1];

                  return (
                    <tr
                      key={client.id}
                      className={`transition-colors group ${
                        isSelected
                          ? 'bg-[#3E6B2B]/5'
                          : idx % 2 === 0
                          ? 'bg-white hover:bg-stone-50/80'
                          : 'bg-[#fafbfa] hover:bg-stone-50/80'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(client.id)}
                          className="w-4 h-4 rounded border-stone-300 text-[#2d5a27] focus:ring-[#3E6B2B]/30"
                        />
                      </td>

                      {/* ID */}
                      {isColVisible('id') && (
                        <td className="py-3 px-3 font-mono text-[11px] font-medium text-stone-500">
                          {client.id}
                        </td>
                      )}

                      {/* Client Name + Avatar */}
                      {isColVisible('name') && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#3E6B2B]/10 text-[#2d5a27] font-bold text-xs flex items-center justify-center shrink-0 border border-[#3E6B2B]/20">
                              {client.photoUrl ? (
                                <img
                                  src={client.photoUrl}
                                  alt={deIdentify(client.name)}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                client.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                              )}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => navigate('clients', client.id)}
                                className="font-semibold text-stone-900 hover:text-[#2d5a27] hover:underline text-left flex items-center gap-1.5"
                              >
                                <span>{deIdentify(client.name)}</span>
                              </button>
                              <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                                <span>{client.age} yrs</span>
                                <span>•</span>
                                <span>{client.gender}</span>
                                {client.isMinor && (
                                  <>
                                    <span>•</span>
                                    <span className="text-purple-700 font-semibold text-[10px] bg-purple-50 px-1 rounded">
                                      Pediatric
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Status Pill with Alert Dot */}
                      {isColVisible('status') && (
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                client.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : client.status === 'Onboarding'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : client.status === 'On Hold'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-stone-100 text-stone-700 border-stone-200'
                              }`}
                            >
                              {client.status}
                            </span>

                            {/* Red / Amber Alert Dot for Expiring Auth or Review Needed */}
                            {(isExpired || isExpiringSoon || hasDocReview) && (
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  isExpired
                                    ? 'bg-red-500 animate-pulse'
                                    : 'bg-amber-500'
                                }`}
                                title={
                                  isExpired
                                    ? 'Authorization expired!'
                                    : isExpiringSoon
                                    ? 'Authorization expiring in <= 30 days'
                                    : 'Documents requiring supervisory review'
                                }
                              />
                            )}
                          </div>
                        </td>
                      )}

                      {/* Program / Payer */}
                      {isColVisible('program') && (
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-[11px] font-medium border border-stone-200">
                            {client.program}
                          </span>
                        </td>
                      )}

                      {/* Care Arrangement */}
                      {isColVisible('careArrangement') && (
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                              client.careArrangement === 'Agency'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : client.careArrangement === 'Family Care'
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : 'bg-purple-50 text-purple-800 border-purple-200'
                            }`}
                          >
                            {client.careArrangement}
                          </span>
                        </td>
                      )}

                      {/* Household */}
                      {isColVisible('household') && (
                        <td className="py-3 px-3 text-stone-700 font-medium">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Building size={12} className="text-stone-400 shrink-0" />
                            <span className="truncate max-w-[140px]" title={client.household}>
                              {client.household}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Responsible Party #1 */}
                      {isColVisible('respParty1') && (
                        <td className="py-3 px-3">
                          {rp1 ? (
                            <div>
                              <div className="font-medium text-stone-900 text-[11px]">
                                {deIdentify(rp1.name)}{' '}
                                <span className="text-stone-400 font-normal">
                                  ({rp1.relationship})
                                </span>
                              </div>
                              <div className="text-[11px] text-stone-500 flex items-center gap-1">
                                <Phone size={10} className="text-stone-400" />
                                <span>{rp1.phone}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>
                      )}

                      {/* Responsible Party #2 */}
                      {isColVisible('respParty2') && (
                        <td className="py-3 px-3">
                          {rp2 ? (
                            <div>
                              <div className="font-medium text-stone-900 text-[11px]">
                                {deIdentify(rp2.name)}{' '}
                                <span className="text-stone-400 font-normal">
                                  ({rp2.relationship})
                                </span>
                              </div>
                              <div className="text-[11px] text-stone-500 flex items-center gap-1">
                                <Phone size={10} className="text-stone-400" />
                                <span>{rp2.phone}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>
                      )}

                      {/* Phone */}
                      {isColVisible('phone') && (
                        <td className="py-3 px-3 text-stone-600 font-mono text-[11px]">
                          {client.phone}
                        </td>
                      )}

                      {/* Email */}
                      {isColVisible('email') && (
                        <td className="py-3 px-3 text-stone-600 text-[11px] truncate max-w-[150px]">
                          {client.email}
                        </td>
                      )}

                      {/* City / Location */}
                      {isColVisible('city') && (
                        <td className="py-3 px-3 text-stone-700">
                          <div className="flex items-center gap-1 text-[11px]">
                            <MapPin size={11} className="text-stone-400 shrink-0" />
                            <span>
                              {client.city}, {client.state}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Auth Hours / Wk */}
                      {isColVisible('authorizedHours') && (
                        <td className="py-3 px-3 text-right font-medium text-stone-900">
                          {client.authorizedHours} hrs/wk
                        </td>
                      )}

                      {/* Auth Expiry */}
                      {isColVisible('authExpiry') && (
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-stone-700">
                              {client.authExpiry}
                            </span>
                            {isExpiringSoon && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold border border-amber-300">
                                Expiring
                              </span>
                            )}
                            {isExpired && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-800 font-bold border border-red-300">
                                Expired
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Administrator */}
                      {isColVisible('administrator') && (
                        <td className="py-3 px-3 text-stone-700 font-medium">
                          {client.administrator}
                        </td>
                      )}

                      {/* Quick Action Icons */}
                      {isColVisible('actions') && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Profile */}
                            <button
                              type="button"
                              onClick={() => navigate('clients', client.id)}
                              className="p-1.5 text-stone-500 hover:text-[#2d5a27] hover:bg-[#3E6B2B]/10 rounded-lg transition"
                              title="View client profile"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Care Plan */}
                            <button
                              type="button"
                              onClick={() => navigate('clients', client.id)}
                              className="p-1.5 text-stone-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                              title="Open Care Plan & ADLs"
                            >
                              <FileText size={15} />
                            </button>

                            {/* Schedule */}
                            <button
                              type="button"
                              onClick={() => setQuickScheduleClient(client)}
                              className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              title="Schedule visit or shift"
                            >
                              <Calendar size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. TABLE PAGINATION FOOTER */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-4">
            <span>
              Showing{' '}
              <span className="font-semibold text-stone-900">
                {filteredClients.length === 0
                  ? 0
                  : (currentPage - 1) * rowsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-stone-900">
                {Math.min(currentPage * rowsPerPage, filteredClients.length)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-stone-900">
                {filteredClients.length}
              </span>{' '}
              clients
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-stone-500">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-stone-300 rounded bg-white text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Previous page"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="px-3 py-1 text-xs font-medium text-stone-800">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. CLIENTS DISTRIBUTION SUMMARY CARDS */}
      <div className="grid md:grid-cols-2 gap-5 pt-2">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-[#1c2a17]">
              Clients by Program & Payer
            </h3>
            <span className="text-xs text-stone-500 font-medium">State Authorizations</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ['Medicaid K-Plan', '148 clients', '30%'],
              ['CFC (Choice)', '112 clients', '23%'],
              ['HCBS Waiver', '94 clients', '19%'],
              ['IRSS Living', '58 clients', '12%'],
              ['PDN Clinical', '42 clients', '9%'],
              ['IHSS Attendant', '21 clients', '4%'],
              ['Private Pay', '12 clients', '3%'],
            ].map(([prog, cl, pct], i) => (
              <div
                key={i}
                className="flex justify-between items-center p-2.5 bg-stone-50 rounded-lg border border-stone-200 hover:bg-[#3E6B2B]/5 transition"
              >
                <span className="font-semibold text-stone-800">{prog}</span>
                <span className="text-stone-600 font-medium">
                  {cl} <span className="text-stone-400 text-[10px]">({pct})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-[#1c2a17]">
              Care Arrangement Distribution
            </h3>
            <span className="text-xs text-stone-500 font-medium">AxisCare Service Delivery</span>
          </div>
          <div className="space-y-3.5 text-xs">
            {[
              ['Agency Directed (W-2)', 248, 51, 'bg-[#2d5a27]'],
              ['Family / Attendant Care', 165, 34, 'bg-sky-600'],
              ['Hybrid (Family + Agency)', 74, 15, 'bg-purple-600'],
            ].map(([line, count, pct, col], i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1 text-stone-800 font-medium">
                  <span>{line}</span>
                  <span>
                    <b className="text-stone-900">{count} clients</b>{' '}
                    <span className="text-stone-500">({pct}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${col} rounded-full`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL 1: COLUMN VISIBILITY MANAGER */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#2d5a27]" />
                <h3 className="font-bold text-sm text-stone-900">Customize Columns</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsColumnModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2.5">
              <p className="text-xs text-stone-500 mb-3">
                Select columns to display in the main client registry table.
              </p>
              {columns.map((col) => (
                <label
                  key={col.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 border border-stone-100 cursor-pointer"
                >
                  <span className="text-xs font-medium text-stone-800">{col.label}</span>
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => toggleColumnVisibility(col.id)}
                    className="w-4 h-4 rounded border-stone-300 text-[#2d5a27] focus:ring-[#3E6B2B]/30"
                  />
                </label>
              ))}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setColumns((prev) =>
                    prev.map((c) => ({
                      ...c,
                      visible: !['respParty2', 'phone', 'email'].includes(c.id),
                    }))
                  )
                }
                className="text-xs text-stone-600 hover:underline"
              >
                Reset to default
              </button>
              <button
                type="button"
                onClick={() => setIsColumnModalOpen(false)}
                className="px-4 py-2 bg-[#2d5a27] hover:bg-[#23471f] text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW CLIENT WIZARD / FORM */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-[#2d5a27]" />
                <h3 className="font-bold text-sm text-stone-900">Add New Client (Intake)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewClientModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateNewClient} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={newClientData.name}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Program / Payer *
                  </label>
                  <select
                    value={newClientData.program}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, program: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
                  >
                    <option value="Medicaid K-Plan">Medicaid K-Plan</option>
                    <option value="IHSS">IHSS Attendant Care</option>
                    <option value="CFC">CFC (Community First Choice)</option>
                    <option value="HCBS">HCBS Waiver</option>
                    <option value="IRSS">IRSS Supported Living</option>
                    <option value="Private Pay">Private Pay</option>
                    <option value="VA Aid & Attendance">VA Aid & Attendance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Care Arrangement
                  </label>
                  <select
                    value={newClientData.careArrangement}
                    onChange={(e) =>
                      setNewClientData({
                        ...newClientData,
                        careArrangement: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
                  >
                    <option value="Agency">Agency (W-2 Staff)</option>
                    <option value="Family Care">Family Care (Attendant)</option>
                    <option value="Hybrid">Hybrid (Family + Agency)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Household Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vance Household (HH-094)"
                    value={newClientData.household}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, household: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Primary Phone
                  </label>
                  <input
                    type="text"
                    placeholder="(503) 555-0199"
                    value={newClientData.phone}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={newClientData.email}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Physical Residential Address
                  </label>
                  <input
                    type="text"
                    placeholder="1234 SW Elm Street, Apt 4B"
                    value={newClientData.address}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Portland"
                    value={newClientData.city}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Authorized Hours / Week
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={newClientData.authorizedHours}
                    onChange={(e) =>
                      setNewClientData({
                        ...newClientData,
                        authorizedHours: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Assigned Administrator
                  </label>
                  <select
                    value={newClientData.administrator}
                    onChange={(e) =>
                      setNewClientData({
                        ...newClientData,
                        administrator: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
                  >
                    <option value="Lisa Connell">Lisa Connell</option>
                    <option value="Devon Brooks">Devon Brooks</option>
                    <option value="Marcus Vance">Marcus Vance</option>
                    <option value="Dana Whitfield">Dana Whitfield, RN</option>
                    <option value="Maya R.">Maya R.</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 text-[11px] leading-relaxed">
                Client onboarding creates a pending profile with auto-generated initial intake forms,
                emergency contact template, and places the record in the intake packet workflow.
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2d5a27] hover:bg-[#23471f] text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Create Client & Open Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK SCHEDULE MODAL */}
      {quickScheduleClient && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#2d5a27]" />
                <h3 className="font-bold text-sm text-stone-900">
                  Schedule for {deIdentify(quickScheduleClient.name)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickScheduleClient(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Visit / Shift Type
                </label>
                <select className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]">
                  <option>Caregiver Attendant Shift (T1019)</option>
                  <option>60-Day RN Supervisory Visit (G0162)</option>
                  <option>Care Plan Re-assessment</option>
                  <option>Emergency Coverage Shift</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    defaultValue="09:00"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Staff / Caregiver Assigned
                </label>
                <select className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]">
                  <option>Devon Brooks (Caregiver)</option>
                  <option>Dana Whitfield, RN (Supervisor)</option>
                  <option>Elena Rostova, CNA</option>
                  <option>Unassigned / Open Shift</option>
                </select>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-stone-600 text-[11px]">
                Address: {quickScheduleClient.address}, {quickScheduleClient.city}
                <br />
                Payer: {quickScheduleClient.program} • Auth Remaining: {quickScheduleClient.authorizedHours} hrs/wk
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setQuickScheduleClient(null)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2d5a27] hover:bg-[#23471f] text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
