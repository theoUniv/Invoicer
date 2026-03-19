import React from 'react';

interface DataTableProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTable({ children, className = '' }: DataTableProps) {
  return (
    <table className={`w-full border-collapse text-left ${className}`}>
      {children}
    </table>
  );
}

interface DataTableHeaderProps {
  children: React.ReactNode;
}

export function DataTableHeader({ children }: DataTableHeaderProps) {
  return (
    <thead>
      {children}
    </thead>
  );
}

interface DataTableRowProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableRow({ children, className = '' }: DataTableRowProps) {
  return (
    <tr className={className}>
      {children}
    </tr>
  );
}

interface DataTableCellProps {
  children: React.ReactNode;
  className?: string;
  width?: string;
}

export function DataTableCell({ children, className = '', width }: DataTableCellProps) {
  const widthStyle = width ? { width } : {};
  return (
    <td 
      className={`py-5 text-sm align-middle ${className}`}
      style={widthStyle}
    >
      {children}
    </td>
  );
}

interface DataTableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  width?: string;
}

export function DataTableHeaderCell({ children, className = '', width }: DataTableHeaderCellProps) {
  const widthStyle = width ? { width } : {};
  return (
    <th 
      className={`py-4 text-xs uppercase tracking-[0.05em] text-[#8A8580] font-normal border-b border-[#1A1817] sticky top-0 z-20 ${className}`}
      style={widthStyle}
    >
      {children}
    </th>
  );
}
