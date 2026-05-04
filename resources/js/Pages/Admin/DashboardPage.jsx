// FILE: resources/js/Pages/Admin/DashboardPage.jsx
// Fully responsive admin dashboard for desktop, tablet, and mobile

import React, { useState, useEffect } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { logger } from '@/Utils/logger';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';
import Modal from '@/Components/Modal';
import toast from 'react-hot-toast';
import { Search, X, ChevronLeft, ChevronRight, ExternalLink, Info, Clock, Mail, Eye, FileText, Users } from 'lucide-react';

// Responsive Stat Card Component
const StatCard = ({ title, value, icon: Icon, href, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-accent-yellow/10 text-accent-yellow',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-accent-yellow/10 text-accent-yellow',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <Link 
            href={href}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:shadow-md hover:border-accent-yellow/20 transition-all duration-200 group"
        >
            <div className={`p-3 sm:p-4 rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform flex-shrink-0`}>
                <Icon size={24} className="sm:w-7 sm:h-7" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1">{value}</p>
            </div>
            <ExternalLink size={18} className="text-gray-400 group-hover:text-accent-yellow transition-colors flex-shrink-0" />
        </Link>
    );
};

const ITEMS_PER_LOG_PAGE_MODAL = 10;

export default function DashboardPage() {
    const { unreadMessagesCount, activePostsCount, teachersCount } = usePage().props;
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [allActivityLogs, setAllActivityLogs] = useState([]);
    const [filteredActivityLogsInModal, setFilteredActivityLogsInModal] = useState([]);
    const [activitySearchTermModal, setActivitySearchTermModal] = useState('');
    const [activityDateRangeModal, setActivityDateRangeModal] = useState('all');
    const [currentActivityPageModal, setCurrentActivityPageModal] = useState(1);
    const [totalActivityPagesModal, setTotalActivityPagesModal] = useState(1);
    const [loadingLogsModal, setLoadingLogsModal] = useState(false);
    const [dashboardActivityLogs, setDashboardActivityLogs] = useState([]);
    const [loadingDashboardLogs, setLoadingDashboardLogs] = useState(false);

    const fetchActivityLogs = async (page = 1, perPage = ITEMS_PER_LOG_PAGE_MODAL, forModal = false) => {
        if (forModal) setLoadingLogsModal(true);
        else setLoadingDashboardLogs(true);
        try {
            const response = await axios.get(route('admin.api.activitylogs.index', { page, per_page: perPage }));
            if (forModal) {
                setAllActivityLogs(response.data.data);
                setFilteredActivityLogsInModal(response.data.data);
                setTotalActivityPagesModal(response.data.last_page);
                setCurrentActivityPageModal(response.data.current_page);
            } else {
                setDashboardActivityLogs(response.data.data.slice(0, 5));
            }
        } catch (error) { 
            logger.error("Activity logs error:", error);
            toast.error('Gagal memuat log aktivitas. Coba refresh halaman.');
            // Set empty data on error
            if (forModal) {
                setAllActivityLogs([]);
                setFilteredActivityLogsInModal([]);
            } else {
                setDashboardActivityLogs([]);
            }
        }
        finally {
            if (forModal) setLoadingLogsModal(false);
            else setLoadingDashboardLogs(false);
        }
    };

    useEffect(() => { fetchActivityLogs(1, 5, false); }, []);

    const openActivityModal = () => {
        fetchActivityLogs(1, ITEMS_PER_LOG_PAGE_MODAL, true);
        setShowActivityModal(true);
    };

    const closeActivityModal = () => {
        setShowActivityModal(false);
        setActivitySearchTermModal('');
        setActivityDateRangeModal('all');
    };

    useEffect(() => {
        if (!showActivityModal) return;
        let logs = [...allActivityLogs];
        if (activitySearchTermModal) {
            const search = activitySearchTermModal.toLowerCase();
            logs = logs.filter(log =>
                (log.causer?.username?.toLowerCase() || log.causer?.name?.toLowerCase() || '').includes(search) ||
                log.action?.toLowerCase().includes(search) ||
                log.description?.toLowerCase().includes(search)
            );
        }
        const now = new Date();
        if (activityDateRangeModal !== 'all') {
            let startDate;
            if (activityDateRangeModal === '24h') startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            else if (activityDateRangeModal === '7d') startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            else if (activityDateRangeModal === '30d') startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            if (startDate) logs = logs.filter(log => new Date(log.created_at) >= startDate);
        }
        setFilteredActivityLogsInModal(logs);
        setTotalActivityPagesModal(Math.ceil(logs.length / ITEMS_PER_LOG_PAGE_MODAL));
        setCurrentActivityPageModal(1);
    }, [activitySearchTermModal, activityDateRangeModal, showActivityModal, allActivityLogs]);

    const currentLogItemsInModal = filteredActivityLogsInModal.slice(
        (currentActivityPageModal - 1) * ITEMS_PER_LOG_PAGE_MODAL,
        currentActivityPageModal * ITEMS_PER_LOG_PAGE_MODAL
    );

    return (
        <AdminLayout headerTitle="Dashboard Utama">
            <Head title="Admin Dashboard" />
            
            <div className="max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-4 pb-4 sm:pb-6">
                {/* Quick Stats - Responsive Grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <StatCard 
                        title="Pesan Baru" 
                        value={unreadMessagesCount || 0} 
                        icon={Mail} 
                        href={route('admin.contact-messages.index')}
                        color="blue"
                    />
                    <StatCard 
                        title="Berita Aktif" 
                        value={activePostsCount || 0} 
                        icon={FileText} 
                        href={route('admin.posts.index')}
                        color="green"
                    />
                    <StatCard 
                        title="Total Guru/Staff" 
                        value={teachersCount || 0} 
                        icon={Users} 
                        href={route('admin.teachers.index')}
                        color="purple"
                    />
                </div>

                {/* Recent Activity Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Aktivitas Terbaru</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Log aktivitas sistem</p>
                        </div>
                        <button
                            onClick={openActivityModal}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-darker transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto justify-center"
                        >
                            <Eye size={16} />
                            Lihat Semua
                        </button>
                    </div>

                    {loadingDashboardLogs ? (
                        <div className="p-8 sm:p-10 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                            <p className="text-sm text-gray-500 mt-2">Memuat aktivitas...</p>
                        </div>
                    ) : dashboardActivityLogs.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Waktu</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {dashboardActivityLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-semibold text-primary">{(log.causer?.username || log.causer?.name || 'S')[0].toUpperCase()}</span>
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                                        {log.causer?.username || log.causer?.name || 'Sistem'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                                                <span className="text-xs sm:text-sm text-gray-500">
                                                    {new Date(log.created_at).toLocaleString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 sm:p-10 text-center">
                            <Clock size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">Belum ada aktivitas</p>
                        </div>
                    )}
                </div>

                {/* Activity Log Modal - Responsive */}
                <Modal show={showActivityModal} onClose={closeActivityModal} maxWidth="full" closeable={false}>
                    <div className="bg-white h-[85vh] sm:h-[80vh] flex flex-col rounded-xl sm:rounded-2xl overflow-hidden">
                        <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Riwayat Aktivitas</h2>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Log lengkap aktivitas</p>
                            </div>
                            <button 
                                onClick={closeActivityModal}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors self-end sm:self-auto"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-200 bg-white">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Cari..."
                                        value={activitySearchTermModal}
                                        onChange={(e) => setActivitySearchTermModal(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                    />
                                </div>
                                <select
                                    value={activityDateRangeModal}
                                    onChange={(e) => setActivityDateRangeModal(e.target.value)}
                                    className="py-2.5 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white min-w-[140px]"
                                >
                                    <option value="all">Semua</option>
                                    <option value="24h">24 Jam</option>
                                    <option value="7d">7 Hari</option>
                                    <option value="30d">30 Hari</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loadingLogsModal ? (
                                <div className="flex flex-col items-center justify-center h-full py-10">
                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                                    <p className="text-sm text-gray-500">Memuat...</p>
                                </div>
                            ) : currentLogItemsInModal.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Admin</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Keterangan</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Waktu</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {currentLogItemsInModal.map((log, index) => (
                                                <tr key={log.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-xs sm:text-sm text-gray-500">
                                                        {(currentActivityPageModal - 1) * ITEMS_PER_LOG_PAGE_MODAL + index + 1}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-xs sm:text-sm font-medium text-gray-900">{log.causer?.username || log.causer?.name || <span className="italic text-gray-400">Sistem</span>}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 hidden md:table-cell">
                                                        <span className="text-xs sm:text-sm text-gray-600 max-w-[200px] truncate block">{log.description || '-'}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                                                        {new Date(log.created_at).toLocaleString('id-ID', {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short'
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-10">
                                    <Info size={40} className="text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">Tidak ada data</p>
                                </div>
                            )}
                        </div>

                        {totalActivityPagesModal > 1 && (
                            <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                                <p className="text-xs sm:text-sm text-gray-600">
                                    {currentLogItemsInModal.length} dari {filteredActivityLogsInModal.length}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentActivityPageModal(prev => Math.max(1, prev - 1))}
                                        disabled={currentActivityPageModal === 1}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="text-xs sm:text-sm px-3 py-1">
                                        {currentActivityPageModal} / {totalActivityPagesModal}
                                    </span>
                                    <button
                                        onClick={() => setCurrentActivityPageModal(prev => Math.min(totalActivityPagesModal, prev + 1))}
                                        disabled={currentActivityPageModal === totalActivityPagesModal}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </AdminLayout>
    );
}
