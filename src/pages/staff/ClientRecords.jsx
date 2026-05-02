import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, Settings,
    Search, Filter, UserPlus, FileEdit, Trash2, Loader2,
    ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import PageTransition from "../../components/layout/PageTransition.jsx";
import StaffSidebar from "../../components/layout/StaffSidebar.jsx";
import StaffHeader from "../../components/layout/StaffHeader.jsx";
import '../../styles/staff-portal.css';
import './ClientRecords.css';

export default function ClientRecords() {
    const location = useLocation();
    const navigate = useNavigate();

    // --- STAFF IDENTITY ---
    const [staffName, setStaffName] = useState("Staff");
    const [staffLoading, setStaffLoading] = useState(true);

    // --- RECORDS DATA ---
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- FILTERS & PAGINATION ---
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // --- DATA FETCHING ---
    useEffect(() => {
        async function fetchInitialData() {
            try {
                // 1. Fetch Staff Identity
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('first_name, last_name')
                        .eq('id', user.id)
                        .single();
                    setStaffName(profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || "Staff Member" : "Staff Member");
                }
                setStaffLoading(false);

                // 2. Fetch Clients & Appointments
                const { data: profiles, error: profileErr } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'client')
                    .order('created_at', { ascending: false });

                if (profileErr) throw profileErr;

                if (!profiles || profiles.length === 0) {
                    setClients([]);
                    setLoading(false);
                    return;
                }

                // Get all user IDs
                const userIds = profiles.map(p => p.id);

                // Fetch appointments for these users
                const { data: appointments, error: aptErr } = await supabase
                    .from('appointments')
                    .select('user_id, appointment_date, status')
                    .in('user_id', userIds);

                if (aptErr) throw aptErr;

                // 3. Process the data
                const processedClients = profiles.map(profile => {
                    const userApts = (appointments || []).filter(a => a.user_id === profile.id);

                    let dateVisited = "No visits";
                    let visitOutcome = "No visits";

                    if (userApts.length > 0) {
                        // Sort appointments by date descending to get the most recent
                        userApts.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
                        const mostRecentApt = userApts[0];

                        dateVisited = new Date(mostRecentApt.appointment_date).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric'
                        });

                        visitOutcome = mostRecentApt.status || 'Unknown';
                    }

                    return {
                        id: profile.id,
                        displayId: `PAT-${profile.id.slice(0, 6).toUpperCase()}`,
                        name: profile.first_name || profile.last_name
                            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                            : 'Unknown Patient',
                        email: profile.email,
                        dateVisited,
                        visitOutcome
                    };
                });

                setClients(processedClients);
            } catch (err) {
                console.error("Error fetching records:", err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchInitialData();
    }, []);

    // --- FILTER & PAGINATION LOGIC ---
    const filteredClients = useMemo(() => {
        if (!searchQuery.trim()) return clients;
        const query = searchQuery.toLowerCase();
        return clients.filter(c =>
            c.name?.toLowerCase().includes(query) ||
            c.email?.toLowerCase().includes(query) ||
            c.displayId?.toLowerCase().includes(query)
        );
    }, [clients, searchQuery]);

    const totalPages = Math.ceil(filteredClients.length / recordsPerPage);
    const currentRecords = filteredClients.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    // Reset page if search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // --- ACTIONS ---
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const handleActionClick = () => {
        alert("Action restricted. Modifying or deleting patient records requires administrative privileges.");
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
        { name: 'Client Check-in', icon: UserCheck, path: '/staff/check-in' },
        { name: 'Client Queue', icon: Users, path: '/staff/queue' },
        { name: 'Appointments', icon: CalendarDays, path: '/staff/appointments' },
        { name: 'Payment Record', icon: CreditCard, path: '/staff/payments' },
        { name: 'Client Record', icon: FileText, path: '/staff/records' },
        { name: 'New Client', icon: UserPlus, path: '/staff/new-client' },
    ];

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <StaffSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    <StaffHeader
                        title="Client Records"
                        onMenuClick={() => setSidebarOpen(true)}
                    />

                <main className="staff-main">

                    {/* HEADER */}
                    <div className="staff-header">
                        <div className="staff-header-info">
                            <h1 className="staff-page-title">Client Records</h1>
                            <p className="staff-page-subtitle">Patient health database archive</p>
                        </div>
                        <Link to="/staff/new-client" className="staff-btn-primary">
                            <UserPlus size={16} /> Add New Patient
                        </Link>
                    </div>

                    {/* SEARCH & FILTER BAR */}
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="staff-search-icon" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by name, ID, or email address..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="staff-search-input" 
                            />
                        </div>
                        <button className="staff-btn-filter-rounded" disabled>
                            <Filter size={18} /> Filter By Type
                        </button>
                    </div>

                    {/* RECORDS TABLE */}
                    <div className="staff-table-wrapper">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <Loader2 size={32} className="animate-spin mb-4" />
                                <p className="text-sm font-medium">Loading patient records...</p>
                            </div>
                        ) : filteredClients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
                                <AlertCircle size={48} className="text-slate-200 mb-4" />
                                <p className="text-lg font-bold text-slate-500">No records found</p>
                                <p className="text-sm mt-1 max-w-sm">
                                    {searchQuery ? "No patients match your search criteria." : "There are currently no clients registered in the system."}
                                </p>
                            </div>
                        ) : (
                            <>
                                <table className="staff-table">
                                    <thead>
                                        <tr className="staff-table-head-row">
                                            <th className="staff-th">Patient ID</th>
                                            <th className="staff-th">Full Name</th>
                                            <th className="staff-th">Date Visited</th>
                                            <th className="staff-th">Visit Outcome</th>
                                            <th className="staff-th text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="staff-table-body">
                                        {currentRecords.map((patient) => {
                                            const outcomeStyles = {
                                                COMPLETED:       'bg-emerald-100 text-emerald-700',
                                                CANCELLED:       'bg-red-100 text-red-600',
                                                PENDING:         'bg-orange-100 text-orange-600',
                                                CONFIRMED:       'bg-blue-100 text-blue-600',
                                                ON_CASHIER:      'bg-purple-100 text-purple-600',
                                                ON_DOCTOR:       'bg-indigo-100 text-indigo-600',
                                                IN_PROGRESS:     'bg-yellow-100 text-yellow-700',
                                            };
                                            const outcomeLabel = {
                                                COMPLETED:   'Completed',
                                                CANCELLED:   'Cancelled',
                                                PENDING:     'Pending',
                                                CONFIRMED:   'Confirmed',
                                                ON_CASHIER:  'At Cashier',
                                                ON_DOCTOR:   'With Doctor',
                                                IN_PROGRESS: 'In Progress',
                                            };
                                            const badgeClass = outcomeStyles[patient.visitOutcome] || 'bg-slate-100 text-slate-500';
                                            const label = outcomeLabel[patient.visitOutcome] || patient.visitOutcome;

                                            return (
                                                <tr key={patient.displayId} className="staff-table-row">
                                                    <td className="staff-td">
                                                        <span className="records-patient-id">{patient.displayId}</span>
                                                    </td>
                                                    <td className="staff-td">
                                                        <p className="records-patient-name">{patient.name}</p>
                                                        <p className="records-patient-email">{patient.email}</p>
                                                    </td>
                                                    <td className="staff-td">
                                                        <span className="text-slate-500 italic text-sm font-medium">
                                                            {patient.dateVisited}
                                                        </span>
                                                    </td>
                                                    <td className="staff-td">
                                                        <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide ${badgeClass}`}>
                                                            {label}
                                                        </span>
                                                    </td>
                                                    <td className="staff-td text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={handleActionClick} className="records-action-edit" title="Edit Patient">
                                                                <FileEdit size={16} />
                                                            </button>
                                                            <button onClick={handleActionClick} className="records-action-delete" title="Delete Patient">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                
                                <div className="staff-table-footer">
                                    <p className="records-footer-text">
                                        Showing {Math.min(filteredClients.length, (currentPage - 1) * recordsPerPage + 1)} to {Math.min(filteredClients.length, currentPage * recordsPerPage)} of {filteredClients.length} records
                                    </p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="staff-pagination-btn disabled:opacity-50"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage >= totalPages}
                                            className="staff-pagination-btn disabled:opacity-50"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
                </div>
            </div>
        </PageTransition>
    );
}