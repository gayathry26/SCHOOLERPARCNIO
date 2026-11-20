'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  AlertCircle,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resultDataUrl: string | null) => Promise<void> | void;
  title?: string;
  currentImageUrl?: string | null;
  aspectRatio?: 'square' | 'circle';
  maxSizeMb?: number;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title = 'Update Profile Photo',
  currentImageUrl,
  aspectRatio = 'circle',
  maxSizeMb = 3,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(currentImageUrl || null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setImageSrc(currentImageUrl || null);
      setSelectedFile(null);
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setError(null);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [isOpen, currentImageUrl]);

  const validateAndLoadFile = (file: File) => {
    setError(null);

    // Validate type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setError('Please select a valid image format (JPEG, PNG, or WebP).');
      return;
    }

    // Validate size
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Image size exceeds the ${maxSizeMb}MB maximum limit.`);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndLoadFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndLoadFile(e.dataTransfer.files[0]);
    }
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Cropping output generator
  const generateCroppedImage = async (): Promise<string | null> => {
    if (!imageSrc) return null;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 400; // standard high-res avatar resolution
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);

        ctx.save();
        ctx.translate(size / 2, size / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        ctx.translate(pan.x, pan.y);

        // Calculate aspect ratio fit
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;

        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => resolve(null);
      img.src = imageSrc;
    });
  };

  const handleSave = async () => {
    setIsUploading(true);
    setUploadProgress(15);

    // Simulate upload progression for smooth feedback
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 100);

    try {
      const croppedDataUrl = await generateCroppedImage();
      setUploadProgress(100);
      clearInterval(interval);

      await onSave(croppedDataUrl);
      setTimeout(() => {
        setIsUploading(false);
        onClose();
      }, 200);
    } catch (err: any) {
      clearInterval(interval);
      setIsUploading(false);
      setError('Failed to save profile picture: ' + err.message);
    }
  };

  const handleRemovePhoto = async () => {
    if (confirm('Are you sure you want to remove the current profile picture?')) {
      await onSave(null);
      setImageSrc(null);
      setSelectedFile(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle="Crop, reposition and adjust photo before saving" maxWidth="lg">
      <div className="space-y-5">
        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Viewport / Drop Area */}
        {!imageSrc ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#E4EAEC] hover:border-[#086A92] bg-[#F7FAFA] hover:bg-[#EAF5F8]/40 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5F8] text-[#086A92] flex items-center justify-center shadow-2xs">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#17313A]">Click to upload or drag photo here</p>
              <p className="text-[11px] text-[#6B7C83] mt-0.5">JPEG, PNG, or WebP up to {maxSizeMb}MB</p>
            </div>
            <Button variant="outline" size="xs" type="button">
              Browse Local Files
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cropping Canvas Frame */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="relative w-full h-64 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
            >
              {/* Mask Overlay */}
              <div
                className={`absolute inset-0 pointer-events-none border-[40px] border-slate-950/70 z-10 flex items-center justify-center`}
              >
                <div
                  className={`w-44 h-44 border-2 border-white/90 shadow-2xl pointer-events-none ${
                    aspectRatio === 'circle' ? 'rounded-full' : 'rounded-2xl'
                  }`}
                />
              </div>

              {/* Contained Image with pan and zoom */}
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                draggable={false}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
                className="max-w-none max-h-none pointer-events-none"
              />
            </div>

            {/* Slider Controls */}
            <div className="bg-[#F7FAFA] p-3.5 rounded-xl border border-[#E4EAEC] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#17313A] flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-[#086A92]" />
                  <span>Zoom Level ({Math.round(zoom * 100)}%)</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.2))}
                    className="p-1 rounded-md text-[#6B7C83] hover:bg-white hover:text-[#17313A]"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-32 accent-[#086A92] cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.min(3, prev + 0.2))}
                    className="p-1 rounded-md text-[#6B7C83] hover:bg-white hover:text-[#17313A]"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="p-1 rounded-md text-[#6B7C83] hover:bg-white hover:text-[#17313A] ml-2"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Secondary Actions (Change photo, remove photo) */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#086A92] hover:underline font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Choose Different Photo</span>
              </button>

              {currentImageUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-rose-600 hover:underline font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Current Photo</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Progress Bar (when saving) */}
        {isUploading && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-[#086A92]">
              <span>Uploading &amp; Securing Photo...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[#E4EAEC] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#35B84A] h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E4EAEC]">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!imageSrc || isUploading}
            leftIcon={isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          >
            {isUploading ? 'Applying Changes...' : 'Save & Set Photo'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
