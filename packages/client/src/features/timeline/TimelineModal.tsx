import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { TimelineEvent } from '@us-always/shared';
import { Modal } from '../../components/ui/Modal';
import { PhotoUploader } from './PhotoUploader';
import { formatDate } from '../../lib/utils';
import api from '../../lib/api';

interface TimelineModalProps {
  event: TimelineEvent;
  open: boolean;
  onClose: () => void;
}

export function TimelineModal({ event, open, onClose }: TimelineModalProps) {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const deletePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      await api.delete(`/timeline/${event.id}/photos/${photoId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timeline'] }),
    onError: () => toast.error('Failed to delete photo'),
  });

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('photos', f));
    try {
      await api.post(`/timeline/${event.id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      qc.invalidateQueries({ queryKey: ['timeline'] });
      toast.success('Photos uploaded 📸');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} size="lg">
        {/* Event header */}
        <div className="flex items-start gap-4 mb-5">
          <span className="text-5xl leading-none">{event.emoji}</span>
          <div>
            <p className="text-xs text-text-tertiary font-mono mb-0.5">{formatDate(event.date)}</p>
            <h2 className="font-display text-2xl italic text-text-primary">{event.title}</h2>
          </div>
        </div>

        {/* Description */}
        <p className="text-text-secondary text-sm leading-relaxed mb-6">{event.description}</p>

        {/* Photo masonry grid */}
        {event.photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-5">
            {event.photos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="relative group"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `Memory ${idx + 1}`}
                  className={`w-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity ring-1 ring-border-subtle ${
                    idx % 5 === 0 ? 'h-40' : idx % 5 === 1 ? 'h-32' : 'h-36'
                  }`}
                  onClick={() => setLightbox(photo.url)}
                />
                <button
                  onClick={() => deletePhoto.mutate(photo.id)}
                  className="absolute top-1.5 right-1.5 bg-bg-base/80 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-rose/20"
                  aria-label="Delete this photo"
                >
                  <X size={12} className="text-accent-rose" />
                </button>
                {photo.caption && (
                  <p className="absolute bottom-1.5 left-2 right-2 text-[10px] text-white/80 truncate">
                    {photo.caption}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Upload zone */}
        <div className="border-t border-border-subtle pt-4">
          <p className="text-xs text-text-tertiary font-mono mb-2">Add photos to this memory</p>
          <PhotoUploader onUpload={handleUpload} uploading={uploading} />
        </div>
      </Modal>

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/92 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={lightbox}
              alt="Full size memory"
              className="max-w-[92vw] max-h-[92vh] rounded-2xl object-contain shadow-2xl"
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/40 rounded-full p-2"
              aria-label="Close lightbox"
              onClick={() => setLightbox(null)}
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
