'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  loading,
  empty,
  getRowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  empty?: string;
  getRowKey?: (row: T, index: number) => string | number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.key} className={c.className}>
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((c) => (
                  <TableCell key={c.key}>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-10 text-center text-muted-foreground"
              >
                {empty ?? 'Немає даних'}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <TableRow
                key={getRowKey ? getRowKey(row, i) : ((row as { id?: string | number }).id ?? i)}
                className="animate-in fade-in slide-in-from-bottom-1"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                {columns.map((c) => (
                  <TableCell key={c.key} className={c.className}>
                    {c.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
