import { X, Download, Trash2, Eye } from 'lucide-react';
import { FileData } from '@/lib/files';
import { useAppTranslation } from '@/hooks/useTranslation';

interface FileModalProps {
  file: FileData | null;
  onClose: () => void;
  onView?: (file: FileData) => void;
  onDelete?: (file: FileData) => void;
}

export function FileModal({ file, onClose, onView, onDelete }: FileModalProps) {
  const { t } = useAppTranslation();
  
  if (!file) return null;

  const handleView = () => {
    onView?.(file);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(t('dashboard.folders.confirmDelete', { fileName: file.fileName }))) {
      onDelete?.(file);
      onClose();
    }
  };

  const handleDownload = async () => {
    if (file.id !== '#000001' && file.id !== '#000002') {
      try {
        const response = await fetch(`http://72.60.37.180:3001/api/documents/${file.id.replace('#', '')}/raw-file`);
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download error:', error);
        alert('Erreur lors du téléchargement');
      }
    } else {
      alert('Document de démonstration - pas de fichier réel');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-[rgba(18,18,18,0.12)]">
          <h2 className="text-xl font-semibold text-[#121212]">{t('dashboard.folders.fileDetails')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgba(18,18,18,0.05)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6B6B66]" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#F8F8F6] rounded-lg flex items-center justify-center">
                <Eye className="w-8 h-8 text-[#6B6B66]" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#121212]">{file.fileName}</h3>
                <p className="text-sm text-[#6B6B66]">{t('dashboard.folders.fileType')}: {file.type}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#6B6B66]">{t('dashboard.folders.fileId')}:</span>
                <span className="text-sm font-medium text-[#121212]">{file.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6B6B66]">{t('dashboard.folders.fileDate')}:</span>
                <span className="text-sm font-medium text-[#121212]">{file.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6B6B66]">{t('dashboard.folders.fileVendor')}:</span>
                <span className="text-sm font-medium text-[#121212]">{file.vendor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6B6B66]">{t('dashboard.folders.fileAmount')}:</span>
                <span className="text-sm font-medium text-[#121212]">{file.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6B6B66]">{t('dashboard.folders.fileStatus')}:</span>
                <span className={`text-sm font-medium ${
                  file.status === 'paid' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {file.status === 'paid' ? t('dashboard.paid') : t('dashboard.pending')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-[rgba(18,18,18,0.12)]">
          <button
            onClick={handleView}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#121212] text-white rounded-lg hover:bg-[#2A2A2A] transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">{t('dashboard.folders.view')}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#121212] text-[#121212] rounded-lg hover:bg-[#121212] hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">{t('dashboard.folders.download')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
