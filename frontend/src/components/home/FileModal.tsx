import { X, Download, Eye, History, User, Cpu, ChevronDown, ChevronUp } from 'lucide-react';
import { FileData, getDocument, Document, DocumentVersion } from '@/lib/files';
import { useAppTranslation } from '@/hooks/useTranslation';
import { useState, useEffect } from 'react';

interface FileModalProps {
  file: FileData | null;
  onClose: () => void;
  onView?: (file: FileData) => void;
  onDelete?: (file: FileData) => void;
}

export function FileModal({ file, onClose, onView, onDelete }: FileModalProps) {
  const { t } = useAppTranslation();
  const [fullDoc, setFullDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);

  useEffect(() => {
    if (file && file.id.startsWith('#')) {
      const numericId = parseInt(file.id.replace('#', ''), 10);
      if (!isNaN(numericId)) {
        setLoading(true);
        getDocument(numericId)
          .then(setFullDoc)
          .catch((err: any) => console.error('Error fetching full doc:', err))
          .finally(() => setLoading(false));
      }
    }
  }, [file]);
  
  if (!file) return null;

  const handleView = () => {
    onView?.(file);
    onClose();
  };

  const handleDownload = async () => {
    if (file.id !== '#000001' && file.id !== '#000002') {
      try {
        const numericId = file.id.replace('#', '');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://72.60.37.180:3001/api'}/documents/${numericId}/raw-file`);
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[rgba(18,18,18,0.08)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(18,18,18,0.08)] bg-[#FDFDFB]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#121212] rounded-lg">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#121212] tracking-tight">{t('dashboard.folders.fileDetails')}</h2>
              <p className="text-xs text-[#6B6B66] font-medium uppercase tracking-wider">{file.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgba(18,18,18,0.05)] rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5 text-[#121212]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Main Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F8F8F6] p-5 rounded-xl border border-[rgba(18,18,18,0.04)]">
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#6B6B66] tracking-widest mb-1">{t('dashboard.folders.fileType')}</span>
                <span className="text-sm font-semibold text-[#121212]">{file.type}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#6B6B66] tracking-widest mb-1">{t('dashboard.folders.fileVendor')}</span>
                <span className="text-sm font-semibold text-[#121212]">{file.vendor}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#6B6B66] tracking-widest mb-1">{t('dashboard.folders.fileDate')}</span>
                <span className="text-sm font-semibold text-[#121212]">{file.date}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#6B6B66] tracking-widest mb-1">{t('dashboard.folders.fileStatus')}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  file.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {file.status === 'paid' ? t('dashboard.paid') : t('dashboard.pending')}
                </span>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#121212] uppercase tracking-widest flex items-center gap-2">
                <History className="w-4 h-4" />
                Historique des versions
              </h3>
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#121212] border-t-transparent" />}
            </div>

            <div className="space-y-3">
              {fullDoc?.versions?.map((version, idx) => (
                <div 
                  key={version.versionId} 
                  className="border border-[rgba(18,18,18,0.08)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <button 
                    onClick={() => setExpandedVersion(expandedVersion === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#FDFDFB] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#121212] text-white text-[10px] font-bold">
                        V{version.versionNumber}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-[#121212]">
                          {new Date(version.extractedAt).toLocaleString('fr-FR', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {version.processor ? (
                            <><User className="w-3 h-3 text-[#6B6B66]" /><span className="text-[10px] text-[#6B6B66] font-medium">{version.processor.firstName} {version.processor.lastName}</span></>
                          ) : (
                            <><span className="text-[10px] text-[#6B6B66] font-medium">Traitement automatique</span></>
                          )}
                        </div>
                      </div>
                    </div>
                    {expandedVersion === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {expandedVersion === idx && (
                    <div className="p-4 bg-[rgba(18,18,18,0.01)] border-t border-[rgba(18,18,18,0.06)] animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {version.fields.map(field => (
                          <div key={field.fieldId} className="flex flex-col p-2 bg-white rounded-lg border border-[rgba(18,18,18,0.04)] shadow-sm">
                            <span className="text-[9px] uppercase font-bold text-[#6B6B66] tracking-tighter mb-0.5">
                              {field.fieldName.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[11px] font-medium text-[#121212] truncate" title={field.fieldValue || '—'}>
                              {field.fieldValue || '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {!loading && (!fullDoc?.versions || fullDoc.versions.length === 0) && (
                <p className="text-center py-8 text-sm text-[#6B6B66] italic bg-[#F8F8F6] rounded-xl">Aucun historique disponible pour ce document.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[rgba(18,18,18,0.08)] bg-white flex gap-3">
          <button
            onClick={handleView}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#121212] text-white rounded-xl hover:shadow-lg hover:bg-[#2A2A2A] active:scale-[0.98] transition-all duration-200"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-bold tracking-tight">{t('dashboard.folders.view')}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center p-3 border-2 border-[#121212] text-[#121212] rounded-xl hover:bg-[#121212] hover:text-white active:scale-[0.98] transition-all duration-200"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
