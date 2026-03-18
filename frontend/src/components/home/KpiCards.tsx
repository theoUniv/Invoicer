'use client';

import { useAppTranslation } from '@/hooks/useTranslation';
import { FileData } from '@/lib/files';

interface KpiCardsProps {
  files: FileData[];
}

export function KpiCards({ files }: KpiCardsProps) {
  const { t } = useAppTranslation();

  const totalDocuments = files.length;
  
  const uniqueCompanies = new Set(
    files.map(file => file.vendor)
  ).size;

  const totalAmount = files
    .filter(file => file.amount && typeof file.amount === 'number')
    .reduce((sum: number, file: FileData) => sum + Number(file.amount), 0);

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
