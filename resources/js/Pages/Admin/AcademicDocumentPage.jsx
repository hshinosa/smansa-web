import React, { useMemo, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import toast from 'react-hot-toast';
import {
    FileText,
    Plus,
    Edit,
    Trash2,
    Upload,
    X,
    Search,
    AlertCircle,
} from 'lucide-react';

const CATEGORIES = ['Prestasi Akademik', 'Serapan PTN', 'Hasil TKA', 'Lainnya'];
const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i);

const slugify = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

const getFileNameFromUrl = (url) => {
    if (!url) return '';

    try {
        const lastPart = url.split('/').pop() || '';
        return decodeURIComponent(lastPart.split('?')[0]);
    } catch {
        return url;
    }
};

export default function AcademicDocumentPage({ documents = [] }) {
    const { errors } = usePage().props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pdfName, setPdfName] = useState('');
    const [localErrors, setLocalErrors] = useState({});

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: CATEGORIES[0],
        year: new Date().getFullYear(),
        description: '',
        pdf: null,
        sort_order: 0,
        is_active: true,
    });

    const filteredDocuments = useMemo(() => {
        return documents.filter((document) => {
            const matchesSearch = document.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !selectedCategory || document.category === selectedCategory;
            const matchesYear = !selectedYear || String(document.year) === String(selectedYear);

            return matchesSearch && matchesCategory && matchesYear;
        });
    }, [documents, searchTerm, selectedCategory, selectedYear]);

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            category: CATEGORIES[0],
            year: new Date().getFullYear(),
            description: '',
            pdf: null,
            sort_order: documents.length + 1,
            is_active: true,
        });
        setPdfName('');
        setEditingId(null);
        setIsEditMode(false);
        setIsSubmitting(false);
        setLocalErrors({});
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleOpenModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleEdit = (document) => {
        setFormData({
            title: document.title,
            slug: document.slug,
            category: document.category || CATEGORIES[0],
            year: document.year || new Date().getFullYear(),
            description: document.description || '',
            pdf: null,
            sort_order: document.sort_order || 0,
            is_active: Boolean(document.is_active),
        });
        setPdfName(getFileNameFromUrl(document.pdf_url));
        setEditingId(document.id);
        setIsEditMode(true);
        setLocalErrors({});
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (!deletingId) return;

        router.delete(route('admin.academic-documents.destroy', deletingId), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteConfirm(false);
                setDeletingId(null);
                toast.success('Dokumen berhasil dihapus.');
            },
            onError: () => {
                toast.error('Gagal menghapus dokumen.');
            },
        });
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;

        setFormData((prev) => ({
            ...prev,
            title,
            slug: prev.slug || slugify(title),
        }));
    };

    const validateForm = () => {
        const nextErrors = {};
        const trimmedSlug = (formData.slug || '').trim();

        const duplicateSlug = documents.some((doc) => {
            if (isEditMode && doc.id === editingId) return false;
            return doc.slug === trimmedSlug;
        });

        if (duplicateSlug) {
            nextErrors.slug = 'Slug sudah digunakan. Gunakan slug lain.';
        }

        if (formData.pdf) {
            const isPdf = formData.pdf.type === 'application/pdf';
            const maxSize = 10 * 1024 * 1024;

            if (!isPdf) {
                nextErrors.pdf = 'File harus berformat PDF.';
            } else if (formData.pdf.size > maxSize) {
                nextErrors.pdf = 'Ukuran PDF maksimal 10MB.';
            }
        }

        if (!isEditMode && !formData.pdf) {
            nextErrors.pdf = 'File PDF wajib diunggah.';
        }

        setLocalErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            const firstError = Object.values(nextErrors)[0];
            toast.error(firstError);
            return false;
        }

        return true;
    };

    const buildPayload = () => {
        const payload = {
            title: formData.title,
            slug: formData.slug,
            category: formData.category,
            year: Number(formData.year),
            description: formData.description,
            sort_order: Number(formData.sort_order) || 0,
            is_active: formData.is_active,
        };

        if (formData.pdf) {
            payload.pdf = formData.pdf;
        }

        return payload;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isSubmitting) return;
        if (!validateForm()) return;

        setIsSubmitting(true);
        const payload = buildPayload();

        if (isEditMode) {
            router.put(route('admin.academic-documents.update', editingId), payload, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Dokumen berhasil diperbarui.');
                    closeModal();
                },
                onError: (submitErrors) => {
                    setLocalErrors(submitErrors || {});
                    const firstError = Object.values(submitErrors || {})[0];
                    toast.error(firstError || 'Gagal memperbarui dokumen.');
                },
                onFinish: () => setIsSubmitting(false),
            });
            return;
        }

        router.post(route('admin.academic-documents.store'), payload, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Dokumen berhasil ditambahkan.');
                closeModal();
            },
            onError: (submitErrors) => {
                setLocalErrors(submitErrors || {});
                const firstError = Object.values(submitErrors || {})[0];
                toast.error(firstError || 'Gagal menambahkan dokumen.');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AdminLayout title="Kelola Dokumen Akademik">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kelola Dokumen Akademik</h1>
                        <p className="text-gray-600 mt-1">Kelola file PDF dokumen akademik sekolah</p>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-darker transition-colors"
                    >
                        <Plus size={20} />
                        Tambah Dokumen
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="relative sm:col-span-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari judul dokumen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                        <option value="">Semua Kategori</option>
                        {CATEGORIES.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                        <option value="">Semua Tahun</option>
                        {YEARS.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Year</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredDocuments.length > 0 ? (
                                    filteredDocuments.map((document) => (
                                        <tr key={document.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{document.title}</div>
                                                <div className="text-sm text-gray-500">{document.slug}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                    {document.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{document.year}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                        document.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {document.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(document)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(document.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>Tidak ada dokumen akademik</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={closeModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-900">
                                {isEditMode ? 'Edit Dokumen Akademik' : 'Tambah Dokumen Akademik'}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Judul <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    placeholder="Contoh: Laporan Prestasi Akademik 2026"
                                    required
                                />
                                {(localErrors?.title || errors?.title) && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} /> {localErrors.title || errors.title}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    placeholder="laporan-prestasi-akademik-2026"
                                    required
                                />
                                {(localErrors?.slug || errors?.slug) && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} /> {localErrors.slug || errors.slug}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategori <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    >
                                        {CATEGORIES.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                    {(localErrors?.category || errors?.category) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle size={14} /> {localErrors.category || errors.category}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tahun <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.year}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, year: Number(e.target.value) }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    >
                                        {YEARS.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    {(localErrors?.year || errors?.year) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle size={14} /> {localErrors.year || errors.year}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    rows={3}
                                    placeholder="Deskripsi dokumen akademik..."
                                />
                                {(localErrors?.description || errors?.description) && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} /> {localErrors.description || errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                                    <input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: parseInt(e.target.value, 10) || 0 }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                        min="0"
                                    />
                                    {(localErrors?.sort_order || errors?.sort_order) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle size={14} /> {localErrors.sort_order || errors.sort_order}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 pt-7">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Aktif</label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    File PDF {!isEditMode && <span className="text-red-500">*</span>}
                                </label>
                                <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-darker transition-colors cursor-pointer w-fit">
                                            <Upload size={18} />
                                            Pilih PDF
                                            <input
                                                type="file"
                                                accept="application/pdf,.pdf"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] || null;
                                                    setFormData((prev) => ({ ...prev, pdf: file }));
                                                    setPdfName(file ? file.name : '');
                                                    if (localErrors.pdf) {
                                                        setLocalErrors((prev) => ({ ...prev, pdf: undefined }));
                                                    }
                                                }}
                                            />
                                        </label>
                                        <div className="text-sm text-gray-600 break-all">
                                            {pdfName || (isEditMode ? 'Tidak ada file baru dipilih (pakai file lama)' : 'Belum ada file dipilih')}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Hanya PDF, maksimal 10MB.</p>
                                </div>
                                {(localErrors?.pdf || errors?.pdf) && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} /> {localErrors.pdf || errors.pdf}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-darker transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting
                                        ? 'Menyimpan...'
                                        : isEditMode
                                            ? 'Simpan Perubahan'
                                            : 'Tambah Dokumen'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Dokumen?</h3>
                            <p className="text-gray-600 mb-6">
                                Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
