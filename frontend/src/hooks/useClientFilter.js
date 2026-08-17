import { useMemo, useState } from 'react';

/**
 * Custom hook for client-side list filtering and searching
 */
export function useClientFilter(items = [], searchKeys = []) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];

    return items.filter((item) => {
      // 1. Search term matching across searchKeys
      const matchesSearch =
        !searchTerm.trim() ||
        searchKeys.some((key) => {
          const val = item[key];
          return val && String(val).toLowerCase().includes(searchTerm.toLowerCase());
        });

      // 2. Filter matching (e.g. by status or category if specified)
      const matchesFilter =
        filterValue === 'all' ||
        item.status === filterValue ||
        item.role === filterValue;

      return matchesSearch && matchesFilter;
    });
  }, [items, searchKeys, searchTerm, filterValue]);

  return {
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
    filteredItems,
  };
}
