import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, ImagePlus } from 'lucide-react';

interface PhotoUploaderProps {
  onUpload: (files: FileList) => Promise<void>;
  uploading: boolean;
}

export function PhotoUploader({ onUpload, uploading }: PhotoUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      await onUpload(e.dataTransfer.files);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      await onUpload(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <motion.div
      whileHover={{ borderColor: 'var(--accent-gold-muted)' }}
      className={`
        border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors duration-200
        ${dragOver ? 'border-accent-gold bg-accent-gold/5' : 'border-border-default hover:border-accent-gold/50'}
      `}
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      aria-label="Upload photos — click or drag and drop"
      onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Upload size={22} className="text-accent-gold" />
          </motion.div>
          <p className="text-xs text-text-tertiary">Uploading photos...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <ImagePlus size={22} className="text-text-tertiary" />
          <p className="text-sm text-text-secondary">
            Drop photos here, or <span className="text-accent-gold">click to browse</span>
          </p>
          <p className="text-xs text-text-tertiary">JPEG, PNG, WebP up to 10MB each</p>
        </div>
      )}
    </motion.div>
  );
}
