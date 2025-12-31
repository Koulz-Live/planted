import React, { useRef, useState } from 'react';

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
  accept?: string;
  helperText?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  maxImages = 5,
  accept = 'image/*',
  helperText = 'Drag & drop images here, or browse files.'
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image to reduce payload size for API calls
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 1200px width/height)
          const maxDimension = 1200;
          let width = img.width;
          let height = img.height;
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with 0.8 quality (reduced file size)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const newImages: string[] = [];
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          const compressedUrl = await compressImage(file);
          newImages.push(compressedUrl);
          
          if (newImages.length === filesToProcess) {
            const updated = [...images, ...newImages];
            setImages(updated);
            onImagesChange(updated);
          }
        } catch (error) {
          console.error('Error compressing image:', error);
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onImagesChange(updated);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBrowseClick();
    }
  };

  return (
    <div className="image-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        aria-label="Upload images"
      />

      {images.length < maxImages && (
        <div
          className={`pc-upload-box ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={handleBrowseClick}
          aria-label={`Upload images. ${maxImages - images.length} slot${maxImages - images.length !== 1 ? 's' : ''} remaining`}
        >
          <span aria-hidden="true">
            {helperText}
            <br />
            {maxImages - images.length} slot{maxImages - images.length !== 1 ? 's' : ''} remaining
          </span>
          <button
            type="button"
            className="pc-badge-secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleBrowseClick();
            }}
            aria-label="Browse files to upload"
          >
            Browse files
          </button>
        </div>
      )}

      {images.length > 0 && (
        <div className="image-preview-grid" role="list" aria-label="Uploaded images">
          {images.map((url, index) => (
            <div key={index} className="image-preview-item" role="listitem">
              <img src={url} alt={`Uploaded image ${index + 1} of ${images.length}`} />
              <button
                type="button"
                className="image-remove-btn"
                onClick={() => handleRemoveImage(index)}
                aria-label={`Remove image ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .pc-upload-box {
          border-radius: 14px;
          border: 1px dashed var(--border);
          padding: 0.7rem 0.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          background: #f7fcf8;
          font-size: 0.8rem;
          color: var(--text-muted);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .pc-upload-box:hover {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .pc-upload-box:focus {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        .pc-upload-box.dragging {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .pc-upload-box span {
          display: block;
          flex: 1;
        }

        .pc-badge-secondary {
          border-radius: 999px;
          padding: 0.32rem 0.8rem;
          background: #ffffff;
          border: 1px solid var(--border);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pc-badge-secondary:hover {
          background: var(--accent-soft);
          border-color: var(--accent);
          transform: none;
          box-shadow: none;
        }

        .pc-badge-secondary:focus {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        .image-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 0.75rem;
          margin-top: 0.75rem;
        }

        .image-preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .image-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-remove-btn {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid var(--border);
          font-size: 18px;
          line-height: 1;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--danger);
          box-shadow: var(--shadow-subtle);
        }

        .image-remove-btn:hover {
          background: var(--danger);
          color: white;
          transform: scale(1.1);
        }

        .image-remove-btn:focus {
          outline: 2px solid var(--danger);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};
