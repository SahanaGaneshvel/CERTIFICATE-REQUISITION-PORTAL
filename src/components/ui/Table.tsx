import React from 'react';
import styles from './Table.module.css';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={`${styles.table} ${className}`}>{children}</table>
    </div>
  );
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHead({ children, className = '' }: TableHeadProps) {
  return <thead className={`${styles.head} ${className}`}>{children}</thead>;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className = '' }: TableBodyProps) {
  return <tbody className={`${styles.body} ${className}`}>{children}</tbody>;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className = '', onClick }: TableRowProps) {
  return (
    <tr
      className={`${styles.row} ${onClick ? styles.clickable : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function TableCell({ children, className = '', align = 'left' }: TableCellProps) {
  return (
    <td className={`${styles.cell} ${styles[align]} ${className}`}>{children}</td>
  );
}

interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function TableHeaderCell({ children, className = '', align = 'left' }: TableHeaderCellProps) {
  return (
    <th className={`${styles.headerCell} ${styles[align]} ${className}`}>{children}</th>
  );
}
