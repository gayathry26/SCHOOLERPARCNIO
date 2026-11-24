'use client';

import React from 'react';
import { FileText, Download, CheckCircle2, Eye, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { formatDate } from '@/lib/formatters';

export interface FilePreviewItem {
  id?: string;
  title: string;
  category?: string;
  format?: string;
  fileSize?: string;
  uploadDate?: Date | string;
  verified?: boolean;
  verifiedBy?: string;
  url?: string;
  previewUrl?: string;
}

export interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FilePreviewItem | null;
  onDownload?: (file: FilePreviewItem) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file,
  onDownload,
}) => {
  if (!file) return null;

  const isImage = file.format && /png|jpg|jpeg|webp/i.test(file.format);

  const handleDownload = () => {
    if (onDownload) {
      onDownload(file);
    } else if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={file.title}>
      <div className="space-y-4 text-xs">
        {/* Metadata Banner */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-slate-400 block font-semibold">Category</span>
            <strong className="text-slate-800">{file.category || 'Institutional Record'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">File Format</span>
            <strong className="text-slate-800">{file.format || 'PDF'} ({file.fileSize || '1.2 MB'})</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Upload Date</span>
            <strong className="text-slate-800">{formatDate(file.uploadDate)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Status</span>
            <Badge variant={file.verified !== false ? 'emerald' : 'amber'} size="xs">
              {file.verified !== false ? 'Verified' : 'Pending Verification'}
            </Badge>
          </div>
        </div>

        {/* Visual Preview Area */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center min-h-[260px] p-4 relative">
          {isImage && file.url ? (
            <img
              src={file.url}
              alt={file.title}
              className="max-h-[340px] max-w-full object-contain rounded-lg shadow-lg"
            />
          ) : (
            <div className="text-center text-white space-y-2 p-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center mx-auto text-cyan-300">
                <FileText className="w-8 h-8" />
              </div>
              <p className="font-bold text-sm text-white">{file.title}</p>
              <p className="text-xs text-white/70">
                Secure PDF Document • Digitally encrypted on institutional S3 storage.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close Preview
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleDownload}
            className="bg-[#990000] hover:bg-[#800000] text-white flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Copy</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
