import { DataTable, DataTableHeader, DataTableRow, DataTableCell, DataTableHeaderCell } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui';
import { useAppTranslation } from '@/hooks/useTranslation';
import { FileData } from '@/lib/files';

interface InvoiceTableProps {
  files: FileData[];
  onViewInvoice?: (file: FileData) => void;
}

export function InvoiceTable({ files, onViewInvoice }: InvoiceTableProps) {
  const { t } = useAppTranslation();

  return (
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
        {files.map((file, index) => (
          <DataTableRow 
            key={index}
            className="hover:bg-white/30 transition-colors"
          >
            <DataTableCell className="text-xs uppercase tracking-[0.05em] text-[#8A8580]">
              {file.id}
            </DataTableCell>
            <DataTableCell className="text-black">{file.date}</DataTableCell>
            <DataTableCell className="font-medium text-black">{file.vendor}</DataTableCell>
            <DataTableCell className="font-['Playfair_Display'] text-lg text-black">
              {file.amount}
            </DataTableCell>
            <DataTableCell>
              <StatusBadge status={file.status as 'paid' | 'pending'}>
                {file.status}
              </StatusBadge>
            </DataTableCell>
            <DataTableCell className="text-right">
              <Button
                variant="ghost"
                onClick={() => onViewInvoice?.(file)}
                className='text-[#8A8580] hover:underline'
              >
                {t('dashboard.view')}
              </Button>
            </DataTableCell>
          </DataTableRow>
        ))}
      </tbody>
    </DataTable>
  );
}
