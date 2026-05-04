import { useState, useEffect, useCallback } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

export function useContentManagement(initialData, updateRoute, method = 'post') {
    const { success, errors: pageErrorsFromLaravel } = usePage().props;
    
    const { data, setData, post, put, processing: formProcessing, errors: formErrors, reset, transform } = useForm(initialData);

    const [selectedFiles, setSelectedFiles] = useState({});
    const [previewUrls, setPreviewUrls] = useState({});
    const [localSuccess, setLocalSuccess] = useState(null);
    const [localErrors, setLocalErrors] = useState({});
    const [routerProcessing, setRouterProcessing] = useState(false);

    const processing = formProcessing || routerProcessing;

    useEffect(() => {
        if (success) {
            setLocalSuccess(success);
            const timer = setTimeout(() => setLocalSuccess(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);
    
    useEffect(() => {
        if (pageErrorsFromLaravel && Object.keys(pageErrorsFromLaravel).length > 0) {
            setLocalErrors(pageErrorsFromLaravel);
        } else {
            setLocalErrors({});
        }
    }, [pageErrorsFromLaravel]);

    const handleFileChange = (fileType, file, options = {}) => {
        if (file) {
            const { maxSize = 10 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'] } = options;

            if (file.size > maxSize) {
                setLocalErrors(prev => ({
                    ...prev,
                    [fileType]: `Ukuran file tidak boleh lebih dari ${maxSize / (1024 * 1024)}MB`
                }));
                return;
            }

            if (!allowedTypes.includes(file.type)) {
                setLocalErrors(prev => ({
                    ...prev,
                    [fileType]: 'File harus berupa gambar (JPEG, PNG, JPG, GIF, SVG)'
                }));
                return;
            }

            setLocalErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fileType];
                return newErrors;
            });

            setSelectedFiles(prev => ({
                ...prev,
                [fileType]: file
            }));

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrls(prev => ({
                    ...prev,
                    [fileType]: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSectionInputChange = (section, field, value) => {
        setData(prevData => ({
            ...prevData,
            [section]: {
                ...prevData[section],
                [field]: value,
            }
        }));

        if (localErrors[`${section}.${field}`]) {
            setLocalErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[`${section}.${field}`];
                return newErrors;
            });
        }
    };

    const handleSubmit = useCallback((e, additionalData = null, callerOptions = {}) => {
        if (e) e.preventDefault();
        setLocalErrors({});

        const mergedOptions = {
            preserveScroll: true,
            preserveState: false,
            ...callerOptions,
        };

        if (additionalData instanceof FormData) {
            if (method !== 'post') {
                additionalData.append('_method', method.toUpperCase());
            }

            setRouterProcessing(true);
            router.post(updateRoute, additionalData, {
                ...mergedOptions,
                onSuccess: () => {
                    setRouterProcessing(false);
                    setSelectedFiles({});
                    toast.success('Perubahan berhasil disimpan');
                    if (mergedOptions.onSuccess) mergedOptions.onSuccess();
                },
                onError: (serverErrors) => {
                    setRouterProcessing(false);
                    setLocalErrors(serverErrors);
                    toast.error('Gagal menyimpan perubahan');
                    if (mergedOptions.onError) mergedOptions.onError(serverErrors);
                },
                onFinish: () => {
                    setRouterProcessing(false);
                },
            });
            return;
        }

        if (additionalData) {
            transform((data) => ({
                ...data,
                ...additionalData
            }));
        }

        const options = {
            ...mergedOptions,
            onSuccess: () => {
                setSelectedFiles({});
                toast.success('Perubahan berhasil disimpan');
                if (mergedOptions.onSuccess) mergedOptions.onSuccess();
            },
            onError: (serverErrors) => {
                setLocalErrors(serverErrors);
                toast.error('Gagal menyimpan perubahan');
                if (mergedOptions.onError) mergedOptions.onError(serverErrors);
            }
        };

        if (method === 'post') {
            post(updateRoute, options);
        } else {
            put(updateRoute, options);
        }
    }, [method, updateRoute, post, put, transform]);

    return {
        data,
        setData,
        processing,
        formErrors,
        localSuccess,
        localErrors,
        setLocalErrors,
        selectedFiles,
        setSelectedFiles,
        previewUrls,
        setPreviewUrls,
        handleFileChange,
        handleSectionInputChange,
        handleSubmit,
        reset
    };
}
