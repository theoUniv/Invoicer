const MONTH_NAMES = {
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};

export function formatDate(dateString: string, t?: any, i18n?: any): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return dateString;
  
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const monthKey = (monthIndex + 1).toString().padStart(2, '0');
  
  let monthName = MONTH_NAMES[i18n?.language as keyof typeof MONTH_NAMES]?.[monthIndex] || monthKey;
  
  if (t) {
    monthName = t(`dashboard.folders.months.${monthKey}`, monthName);
  }
  
  return `${day} ${monthName} ${year}`;
}

export function formatDateWithoutHook(dateString: string, translations: any, language: string = 'fr'): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return dateString;
  
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const monthKey = (monthIndex + 1).toString().padStart(2, '0');
  
  let monthName = MONTH_NAMES[language as keyof typeof MONTH_NAMES]?.[monthIndex] || monthKey;
  
  if (translations) {
    const dashboardMonths = translations.dashboard?.folders?.months;
    if (dashboardMonths && dashboardMonths[monthKey]) {
      monthName = dashboardMonths[monthKey];
    } else {
      const directMonth = translations[`dashboard.folders.months.${monthKey}`];
      if (directMonth) {
        monthName = directMonth;
      }
    }
  }
  
  return `${day} ${monthName} ${year}`;
}
