'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Upload, X, Check, Image as ImageIcon, File, Film, MoreVertical, Trash2, Loader2, Filter } from 'lucide-react';
import axios from 'axios';
import { Modal } from './Modal';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';
import { Pagination } from './Pagination';
import { toast } from 'sonner';

/**
 * MediaPicker Component
 * 
 * A reusable modal for selecting or uploading media.
 * 
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close handler
 * @param {function} onSelect - Selection handler (returns media object)
 * @param {string} title - Modal title
 * @param {string} allowedTypes - Filter by type (image, video, document)
 * @param {boolean} multiple - Allow multiple selection
 */
export const MediaPicker = ({
    isOpen,
    onClose,
    onSelect,
    title = 'Select Media',
    allowedType = '',
    multiple = false,
}) => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [folder, setFolder] = useState('blog');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 12,
                folder,
                search,
                type: allowedType,
            };
            const { data } = await axios.get('/api/media', { params });
            if (data.success) {
                setMedia(data.data);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            toast.error('Failed to fetch media');
        } finally {
            setLoading(false);
        }
    }, [page, folder, search, allowedType]);

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
        }
    }, [isOpen, fetchMedia]);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        try {
            const { data } = await axios.post('/api/media', formData);
            if (data.success) {
                toast.success('Media uploaded successfully');
                fetchMedia(); // Refresh list
                if (!multiple) {
                    onSelect(data.data);
                    onClose();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const toggleSelection = (item) => {
        if (multiple) {
            setSelectedItems(prev => 
                prev.some(i => i._id === item._id)
                    ? prev.filter(i => i._id !== item._id)
                    : [...prev, item]
            );
        } else {
            onSelect(item);
            onClose();
        }
    };

    const handleConfirmSelection = () => {
        onSelect(multiple ? selectedItems : selectedItems[0]);
        onClose();
    };

    const getIcon = (mimeType) => {
        if (mimeType.startsWith('image/')) return <ImageIcon size={20} />;
        if (mimeType.startsWith('video/')) return <Film size={20} />;
        return <File size={20} />;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="xl"
            footer={
                multiple && selectedItems.length > 0 ? (
                    <div className="flex items-center justify-between w-full">
                        <span className="text-sm text-[var(--color-text-secondary)]">
                            {selectedItems.length} items selected
                        </span>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleConfirmSelection}>Select {selectedItems.length} items</Button>
                        </div>
                    </div>
                ) : null
            }
        >
            <div className="flex flex-col gap-4">
                {/* Filters and Upload */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={18} />
                        <input
                            type="text"
                            placeholder="Search media..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <select
                        className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]"
                        value={folder}
                        onChange={(e) => setFolder(e.target.value)}
                    >
                        <option value="blog">Blog</option>
                        <option value="avatars">Avatars</option>
                        <option value="documents">Documents</option>
                        <option value="general">General</option>
                    </select>

                    <label className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        <span>Upload</span>
                        <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept={allowedType === 'image' ? 'image/*' : '*/*'} />
                    </label>
                </div>

                {/* Media Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 size={40} className="animate-spin text-[var(--color-primary)]" />
                        <p className="text-[var(--color-text-secondary)]">Loading your library...</p>
                    </div>
                ) : media.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-background-secondary)] flex items-center justify-center mb-4">
                            <ImageIcon size={32} className="text-[var(--color-text-tertiary)]" />
                        </div>
                        <h3 className="text-lg font-medium">No media found</h3>
                        <p className="text-[var(--color-text-secondary)]">Try searching for something else or upload a new file.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 min-h-[400px]">
                        {media.map((item) => {
                            const isSelected = selectedItems.some(i => i._id === item._id);
                            return (
                                <div
                                    key={item._id}
                                    onClick={() => toggleSelection(item)}
                                    className={`group relative aspect-square rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
                                        isSelected 
                                            ? 'border-[var(--color-primary)] scale-[0.98]' 
                                            : 'border-[var(--color-border)] hover:border-[var(--color-primary-light)]'
                                    }`}
                                >
                                    {item.mimeType.startsWith('image/') ? (
                                        <img
                                            src={item.url}
                                            alt={item.alt || item.originalName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[var(--color-background-secondary)] flex flex-col items-center justify-center p-4">
                                            {getIcon(item.mimeType)}
                                            <span className="text-[10px] text-center mt-2 truncate w-full">
                                                {item.originalName}
                                            </span>
                                        </div>
                                    )}

                                    {/* Selection Overlay */}
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-[var(--color-primary)]/10 flex items-center justify-center">
                                            <div className="bg-[var(--color-primary)] text-white rounded-full p-1 ring-4 ring-white">
                                                <Check size={16} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Info Overlay on Hover */}
                                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                                        <p className="text-white text-[10px] truncate">{item.originalName}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
};
