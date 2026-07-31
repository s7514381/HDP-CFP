export type TableSearchValue = string | number | boolean | null | undefined;
export type TableSearchParams = Record<string, TableSearchValue>;

export interface ParsedTableResponse<T> {
  data: T[];
  totalRecords: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function buildTableQuery(page: number, pageSize: number, searchParams: TableSearchParams): string {
  const params = new URLSearchParams({
    order: JSON.stringify({ column: 0, dir: 'asc' }),
    start: String((page - 1) * pageSize),
    length: String(pageSize),
    draw: '1',
  });

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });

  return params.toString();
}

export function parseTableResponse<T>(response: unknown): ParsedTableResponse<T> {
  const root = isRecord(response) ? response : {};
  const rootData = root.data;
  const payload = isRecord(rootData) ? rootData : root;
  const list = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(rootData)
      ? rootData
      : [];
  const total = payload.recordsTotal ?? root.recordsTotal ?? list.length;

  return {
    data: list as T[],
    totalRecords: typeof total === 'number' ? total : Number(total) || list.length,
  };
}

export type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right';

export function getPaginationItems(currentPage: number, pageCount: number): PaginationItem[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);

  const visiblePages = new Set<number>([1, pageCount, currentPage]);
  for (let offset = -2; offset <= 2; offset += 1) {
    const page = currentPage + offset;
    if (page > 1 && page < pageCount) visiblePages.add(page);
  }

  const sortedPages = Array.from(visiblePages).sort((left, right) => left - right);
  const items: PaginationItem[] = [];
  sortedPages.forEach((page, index) => {
    if (index > 0 && page - sortedPages[index - 1] > 1) {
      items.push(page <= currentPage ? 'ellipsis-left' : 'ellipsis-right');
    }
    items.push(page);
  });
  return items;
}

export function readTableCell<T extends object>(item: T, key: keyof T | string): unknown {
  return key in item ? item[key as keyof T] : undefined;
}
