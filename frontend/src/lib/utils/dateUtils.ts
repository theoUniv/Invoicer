import { FileData, FileType } from '../types/documents';

export function getValidFileDate(file: FileData): Date | null {
  try {
    const fileDate = new Date(file.date);
    return isNaN(fileDate.getTime()) ? null : fileDate;
  } catch {
    return null;
  }
}

export function normalizeDateString(dateString: string): Date | null {
  if (!dateString) return null;
  
  const frenchMonths = {
    'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04', 'mai': '05', 'juin': '06',
    'juillet': '07', 'août': '08', 'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
  };
  
  const frenchMatch = dateString.match(/^(\d{1,2})\s+([a-zéû]+)\s+(\d{4})$/i);
  if (frenchMatch) {
    const [, day, monthName, year] = frenchMatch;
    const monthNum = frenchMonths[monthName.toLowerCase() as keyof typeof frenchMonths];
    if (monthNum) {
      const isoDate = `${year}-${monthNum}-${day.padStart(2, '0')}`;
      const result = new Date(isoDate);
      return !isNaN(result.getTime()) ? result : null;
    }
  }
  
  const formats = [
    dateString,
    new Date(dateString.replace(/\//g, '-')),
    new Date(dateString),
    new Date(dateString.replace(/\//g, '-').replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1')),
    new Date(dateString.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1')),
    new Date(parseInt(dateString)),
    new Date(dateString + 'T00:00:00.000Z')
  ];
  
  for (let i = 0; i < formats.length; i++) {
    const format = formats[i];
    if (format instanceof Date && !isNaN(format.getTime())) {
      return format;
    }
  }
  
  return null;
}

export function groupFilesByHierarchy(files: FileData[]) {
  const groups: Record<string, Record<string, Record<string, FileData[]>>> = {};
  
  files.forEach(file => {
    if (!file.type) {
      return;
    }
    
    const fileDate = normalizeDateString(file.date);
    
    if (!fileDate) {
      return;
    }
    
    const type = file.type;
    const year = fileDate.getFullYear().toString();
    const month = (fileDate.getMonth() + 1).toString().padStart(2, '0');
    
    if (!groups[type]) groups[type] = {};
    if (!groups[type][year]) groups[type][year] = {};
    if (!groups[type][year][month]) groups[type][year][month] = [];
    
    groups[type][year][month].push(file);
  });
  
  return groups;
}

export function getTypesFromGroups(groups: Record<string, Record<string, Record<string, FileData[]>>>): FileType[] {
  return Object.keys(groups).filter(type => 
    ['invoice', 'contract', 'devis', 'expense'].includes(type)
  ) as FileType[];
}

export function getYearsForType(groups: Record<string, Record<string, Record<string, FileData[]>>>, type: FileType): string[] {
  if (!groups[type]) return [];
  return Object.keys(groups[type]).sort((a, b) => parseInt(b) - parseInt(a));
}

export function getMonthsForTypeAndYear(groups: Record<string, Record<string, Record<string, FileData[]>>>, type: FileType, year: string): string[] {
  if (!groups[type] || !groups[type][year]) return [];
  return Object.keys(groups[type][year]).sort((a, b) => parseInt(a) - parseInt(b));
}

export function countFilesInGroup(groups: Record<string, Record<string, Record<string, FileData[]>>>, type: FileType, year?: string, month?: string): number {
  if (!groups[type]) return 0;
  if (!year) {
    let count = 0;
    Object.values(groups[type]).forEach(yearData => {
      Object.values(yearData).forEach(monthData => {
        count += monthData.length;
      });
    });
    return count;
  }
  if (!month) {
    if (!groups[type][year]) return 0;
    let count = 0;
    Object.values(groups[type][year]).forEach(monthData => {
      count += monthData.length;
    });
    return count;
  }
  return groups[type][year]?.[month]?.length || 0;
}

export function getFilesInGroup(groups: Record<string, Record<string, Record<string, FileData[]>>>, type: FileType, year?: string, month?: string): FileData[] {
  if (!groups[type]) return [];
  if (!year) {
    const allFiles: FileData[] = [];
    Object.values(groups[type]).forEach(yearData => {
      Object.values(yearData).forEach(monthData => {
        allFiles.push(...monthData);
      });
    });
    return allFiles;
  }
  if (!month) {
    if (!groups[type][year]) return [];
    const allFiles: FileData[] = [];
    Object.values(groups[type][year]).forEach(monthData => {
      allFiles.push(...monthData);
    });
    return allFiles;
  }
  return groups[type][year]?.[month] || [];
}
