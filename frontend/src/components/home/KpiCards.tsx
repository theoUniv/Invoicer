'use client';

import { useAppTranslation } from '@/hooks/useTranslation';
import { FileData } from '@/lib/types/documents';
import { ExtractedInvoiceData } from '@/lib/utils/documentDetailTransform';

interface KpiCardsProps {
  files: FileData[];
  getExtractedData?: (file: FileData) => ExtractedInvoiceData | null;
  isLoading?: boolean;
}

export function KpiCards({ files, getExtractedData, isLoading = false }: KpiCardsProps) {
  const { t } = useAppTranslation();

  if (isLoading) {
    return (
      <section className="grid grid-cols-4 gap-6 mb-8" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="p-8 border border-dashed border-black/15 rounded bg-transparent"
          >
            <div className="h-3 w-32 rounded bg-[#E7E1D8] animate-pulse mb-2" />
            <div className="h-10 w-28 rounded bg-[#E7E1D8] animate-pulse" />
          </div>
        ))}
      </section>
    );
  }

  const totalDocuments = files.length;
  
  const uniqueCompanies = new Set(
    files.map(file => file.vendor)
  ).size;

  const parseAmountToNumber = (value: unknown): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;

    const raw = String(value).trim();
    if (!raw || raw === '—') return 0;

    const cleaned = raw
      .replace(/\s+/g, '')
      .replace(/[^\d,.\-]/g, '');

    if (!cleaned) return 0;

    const standardized =
      cleaned.includes(',') && cleaned.includes('.')
        ? cleaned.replace(/,/g, '')
        : cleaned.includes(',')
          ? cleaned.replace(/,/g, '.')
          : cleaned;

    const num = Number(standardized);
    return Number.isFinite(num) ? num : 0;
  };

  const calculatedTotal = files.reduce((sum: number, file: FileData) => {
    const extracted = getExtractedData?.(file);
    const amountValue = extracted?.totalTtc || file.amount;
    return sum + parseAmountToNumber(amountValue);
  }, 0);
  
  const totalAmount = isNaN(calculatedTotal) ? 0 : calculatedTotal;

  const pendingInvoices = files.filter(file => file.status === 'pending').length;

  const kpiData = [
    {
      title: t('dashboard.kpis.totalAmount'),
      value: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(totalAmount),
      subtitle: t('dashboard.kpis.amount'),
    },
    {
      title: t('dashboard.kpis.totalDocuments'),
      value: totalDocuments.toLocaleString('fr-FR'),
      subtitle: t('dashboard.kpis.documents'),
    },
    {
      title: t('dashboard.kpis.pendingInvoices'),
      value: pendingInvoices,
      subtitle: t('dashboard.kpis.pending'),
    },
    {
      title: t('dashboard.kpis.totalCompanies'),
      value: uniqueCompanies,
      subtitle: t('dashboard.kpis.companies'),
    },
  ];

  return (
    <section className="grid grid-cols-4 gap-6 mb-8">
      {kpiData.map((kpi, index) => (
        <div key={index} className="p-8 border border-dashed border-black/15 rounded bg-transparent">
          <div className="font-sans text-[10px] uppercase tracking-[0.15em] text-[#8A8580] mb-2">
            {kpi.title}
          </div>
          <div className="font-['Playfair_Display'] text-3xl text-[#121212]">
            {kpi.value}
          </div>
        </div>
      ))}
    </section>
  );
}
