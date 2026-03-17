import { UploadArea } from '@/components/ui/UploadArea';
import { EmptyState } from '@/components/ui';
import { useAppTranslation } from '@/hooks/useTranslation';

interface UploadItem {
  name: string;
  status: 'processing' | 'done';
}

interface UploadPanelProps {
  uploads: UploadItem[];
  onFileSelect: (file: File) => void;
}

export function UploadPanel({ uploads, onFileSelect }: UploadPanelProps) {
  const { t } = useAppTranslation();

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col gap-6">
      <div>
        <h2 className="font-['Playfair_Display'] text-2xl leading-tight tracking-[-0.02em] mb-2 text-black">
          {t('dashboard.uploadDocument')}
        </h2>
        <div className="text-xs uppercase tracking-[0.05em] text-[#8A8580]">
          {t('dashboard.acceptedFormats')}
        </div>
      </div>

      <UploadArea onFileSelect={onFileSelect} />

      <div className="mt-8">
        <div className="text-xs uppercase tracking-[0.05em] text-[#8A8580] mb-4">
          {t('dashboard.processingQueue')}
        </div>
        {uploads.length === 0 ? (
          <EmptyState message={t('dashboard.noFilesInQueue')} />
        ) : (
          <ul className="list-none">
            {uploads.map((item, index) => (
              <li key={index} className="flex items-center justify-between py-3 border-b border-[rgba(26,24,23,0.12)] text-sm">
                <span className={ item.status === 'done' ? 'text-[#8A8580]' : 'text-black' }>{item.name}</span>
                <div 
                  className={`w-2 h-2 rounded-full border border-[#1A1817] ${
                    item.status === 'done' ? 'bg-[#1A1817]' : 'bg-transparent'
                  }`}
                  title={item.status === 'done' ? 'Done' : 'Processing'}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
