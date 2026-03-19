import { DataTable, DataTableHeader, DataTableRow, DataTableCell, DataTableHeaderCell } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui';
import { useAppTranslation } from '@/hooks/useTranslation';
import { FileData } from '@/lib/types/documents';
import { ExtractedInvoiceData } from '@/lib/utils/documentDetailTransform';
import { formatDate } from '@/lib/utils/dateFormatter';
import { useEffect, useMemo, useState } from 'react';
import { FileModal } from './FileModal';

interface InvoiceTableProps {
  files: FileData[];
  onViewInvoice?: (file: FileData) => void;
  getExtractedData?: (file: FileData) => ExtractedInvoiceData | null;
}

export function InvoiceTable({ files, onViewInvoice, getExtractedData }: InvoiceTableProps) {
  const { t, i18n } = useAppTranslation();
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [showModal, setShowModal] = useState(false);

  const pageSize = 20;
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
  }, [files]);

  const pageCount = useMemo(() => {
    return files.length === 0 ? 0 : Math.ceil(files.length / pageSize);
  }, [files.length]);

  const paginatedFiles = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return files.slice(start, end);
  }, [files, pageIndex]);

  const hasPrev = pageIndex > 0;
  const hasNext = pageIndex + 1 < pageCount;

  const handleViewClick = (file: FileData) => {
    setSelectedFile(file);
    setShowModal(true);
  };

  const handleModalView = (file: FileData) => {
    onViewInvoice?.(file);
    setShowModal(false);
  };

  return (
    <>
      <DataTable>
        <DataTableHeader>
          <DataTableRow>
            <DataTableHeaderCell width="15%">{t('dashboard.invoiceId')}</DataTableHeaderCell>
            <DataTableHeaderCell width="15%">{t('dashboard.date')}</DataTableHeaderCell>
            <DataTableHeaderCell width="30%">{t('dashboard.vendor')}</DataTableHeaderCell>
            <DataTableHeaderCell width="15%">{t('dashboard.amount')}</DataTableHeaderCell>
            <DataTableHeaderCell width="15%">{t('dashboard.status')}</DataTableHeaderCell>
            <DataTableHeaderCell width="10%" className="text-right">{t('dashboard.action')}</DataTableHeaderCell>
          </DataTableRow>
        </DataTableHeader>
        <tbody>
          {paginatedFiles.map((file) => {
            const extractedData = getExtractedData?.(file);
            
            return (
              <DataTableRow 
                key={file.id}
                className="hover:bg-white/30 transition-colors"
              >
                <DataTableCell className="text-xs uppercase tracking-[0.05em] text-[#8A8580]">
                  <div>{file.id}</div>
                  {extractedData?.invoiceNumber && (
                    <div className="text-black text-xs normal-case tracking-normal mt-1">
                      {extractedData.invoiceNumber}
                    </div>
                  )}
                </DataTableCell>
                <DataTableCell className="text-black">
                  {formatDate(extractedData?.issueDate || file.date, t, i18n)}
                </DataTableCell>
                <DataTableCell className="font-medium text-black">
                  {file.vendor}
                  {extractedData?.siret && (
                    <span className="text-xs text-[#8A8580] block">SIRET: {extractedData.siret}</span>
                  )}
                </DataTableCell>
                <DataTableCell className="font-['Playfair_Display'] text-lg text-black">
                  {extractedData?.totalTtc || file.amount}
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge status={file.status as 'paid' | 'pending'}>
                    {file.status}
                  </StatusBadge>
                </DataTableCell>
                <DataTableCell className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleViewClick(file)}
                    className='text-[#8A8580] hover:underline'
                  >
                    {t('dashboard.view')}
                  </Button>
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </tbody>
      </DataTable>

      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="ghost"
            onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
            disabled={!hasPrev}
          >
            Prev
          </Button>

          <div className="text-xs text-[#6B6B66]">
            Page {pageIndex + 1}/{pageCount}
          </div>

          <Button
            variant="ghost"
            onClick={() => setPageIndex((p) => Math.min(p + 1, pageCount - 1))}
            disabled={!hasNext}
          >
            Next
          </Button>
        </div>
      )}

      {showModal && selectedFile && (
        <FileModal 
          file={selectedFile}
          onClose={() => {
            setShowModal(false);
            setSelectedFile(null);
          }}
          onView={handleModalView}
        />
      )}
    </>
  );
}
