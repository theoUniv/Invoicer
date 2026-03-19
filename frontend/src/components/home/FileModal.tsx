import { useAppTranslation } from '@/hooks/useTranslation';
import { getDocument } from '@/lib/api';
import { createDocumentVersion } from '@/lib/services/filesService';
import { DocumentVersion } from '@/lib/types/documentDetail';
import { Document, FileData } from '@/lib/types/documents';
import { formatDate } from '@/lib/utils/dateFormatter';
import { ChevronDown, ChevronUp, Download, Edit2, Eye, History, Save, User, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FileModalProps {
  file: FileData | null;
  onClose: () => void;
  onView?: (file: FileData) => void;
  onDelete?: (file: FileData) => void;
}

export function FileModal({ file, onClose, onView, onDelete }: FileModalProps) {
  const { t, i18n } = useAppTranslation();
  const [fullDoc, setFullDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editableFields, setEditableFields] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchDoc = async (id: number) => {
    setLoading(true);
    try {
      const doc = await getDocument(id);
      setFullDoc(doc as any);
    } catch (err) {
      console.error('Error fetching full doc:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (file && file.id.startsWith('#')) {
      const numericId = parseInt(file.id.replace('#', ''), 10);
      if (!isNaN(numericId)) {
        fetchDoc(numericId);
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

  const handleStartEdit = (version: DocumentVersion) => {
    const fieldsMap: Record<string, string> = {};
    version.fields.forEach(f => {
      fieldsMap[f.fieldName] = f.fieldValue || '';
    });
    setEditableFields(fieldsMap);
    setIsEditing(true);
    setExpandedVersion(0);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableFields({});
  };

  const handleSaveEdit = async () => {
    if (!fullDoc) return;
    setIsSaving(true);
    try {
      const fieldsArray = Object.entries(editableFields).map(([fieldName, fieldValue]) => ({
        fieldName,
        fieldValue: fieldValue.trim() === '' ? null : fieldValue.trim()
      }));
      
      await createDocumentVersion(fullDoc.documentId, fieldsArray);
      setIsEditing(false);
      setEditableFields({});
      
      await fetchDoc(fullDoc.documentId);
    } catch (err) {
      console.error('Failed to save new version', err);
      alert('Erreur lors de la création de la nouvelle version');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[rgba(18,18,18,0.08)]">
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

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
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
                <span className="text-sm font-semibold text-[#121212]">{formatDate(file.date, t, i18n)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#6B6B66] tracking-widest mb-1">{t('dashboard.folders.fileStatus')}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  file.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {file.status === 'processed' ? t('dashboard.processed') : t('dashboard.pending')}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#121212] uppercase tracking-widest flex items-center gap-2">
                <History className="w-4 h-4" />
                Historique des versions
              </h3>
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#121212] border-t-transparent" />}
            </div>

            <div className="space-y-3">
              {(fullDoc as any)?.versions?.map((version: DocumentVersion, idx: number) => {
                const isLatest = idx === 0;
                const isCurrentlyEditing = isEditing && isLatest;

                return (
                  <div 
                    key={version.versionId} 
                    className={`border rounded-xl overflow-hidden transition-shadow duration-200 ${
                      isCurrentlyEditing 
                        ? 'border-[#121212] shadow-md ring-1 ring-[#121212]/10' 
                        : 'border-[rgba(18,18,18,0.08)] shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between p-4 bg-white transition-colors">
                      <button 
                        onClick={() => !isCurrentlyEditing && setExpandedVersion(expandedVersion === idx ? null : idx)}
                        className={`flex items-center gap-4 flex-1 text-left ${isCurrentlyEditing ? 'cursor-default' : 'cursor-pointer hover:bg-[#FDFDFB]'}`}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-bold ${
                          isCurrentlyEditing ? 'bg-indigo-600 text-white shadow-inner' : 'bg-[#121212] text-white'
                        }`}>
                          V{version.versionNumber}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#121212]">
                            {formatDate(version.extractedAt, t, i18n)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {version.processor ? (
                              <><User className="w-3 h-3 text-[#6B6B66]" /><span className="text-[10px] text-[#6B6B66] font-medium">{version.processor.firstName} {version.processor.lastName}</span></>
                            ) : (
                              <><span className="text-[10px] text-[#6B6B66] font-medium">Traitement automatique</span></>
                            )}
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center gap-2">
                        {isLatest && !isEditing && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStartEdit(version); }}
                            className="p-1.5 text-[#6B6B66] hover:text-[#121212] hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                            title="Créer une correction"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline">Modifier</span>
                          </button>
                        )}
                        {!isCurrentlyEditing && (
                          <button onClick={() => setExpandedVersion(expandedVersion === idx ? null : idx)} className="p-1.5 text-[#6B6B66] hover:bg-gray-100 rounded">
                            {expandedVersion === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {((expandedVersion === idx) || isCurrentlyEditing) && (
                      <div className="p-4 bg-[rgba(18,18,18,0.01)] border-t border-[rgba(18,18,18,0.06)] animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          {version.fields.map(field => {
                            const originalValue = field.fieldValue || '';
                            const currentValue = isCurrentlyEditing ? editableFields[field.fieldName] : originalValue;
                            const isModified = isCurrentlyEditing && currentValue !== originalValue;

                            return (
                              <div key={field.fieldId} className={`flex flex-col p-2 bg-white rounded-lg border transition-colors shadow-sm ${
                                isModified ? 'border-amber-400 bg-amber-50/30' : 'border-[rgba(18,18,18,0.04)]'
                              }`}>
                                <span className="text-[9px] uppercase font-bold text-[#6B6B66] tracking-tighter mb-0.5 flex justify-between">
                                  {field.fieldName.replace(/_/g, ' ')}
                                  {isModified && <span className="text-amber-600">Modifié</span>}
                                </span>
                                
                                {isCurrentlyEditing ? (
                                  <input 
                                    type="text"
                                    value={currentValue}
                                    onChange={(e) => setEditableFields(prev => ({...prev, [field.fieldName]: e.target.value}))}
                                    className={`text-[11px] font-medium text-[#121212] w-full bg-transparent outline-none focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1 py-0.5 transition-shadow ${
                                      isModified ? 'text-amber-900' : ''
                                    }`}
                                    placeholder="—"
                                  />
                                ) : (
                                  <span className="text-[11px] font-medium text-[#121212] truncate" title={originalValue || '—'}>
                                    {originalValue || '—'}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {isCurrentlyEditing && (
                          <div className="mt-4 pt-4 border-t border-[rgba(18,18,18,0.06)] flex items-center justify-end gap-2">
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="px-3 py-1.5 text-xs font-bold text-[#6B6B66] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Annuler
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              disabled={isSaving}
                              className="px-4 py-1.5 text-xs font-bold text-white bg-[#121212] hover:bg-[#2A2A2A] rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {isSaving ? (
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                              Enregistrer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {!loading && (!(fullDoc as any)?.versions || (fullDoc as any).versions.length === 0) && (
                <p className="text-center py-8 text-sm text-[#6B6B66] italic bg-[#F8F8F6] rounded-xl">Aucun historique disponible pour ce document.</p>
              )}
            </div>
          </div>
        </div>

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
