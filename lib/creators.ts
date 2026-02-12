export type Creator = {
  id: number;
  name: string;
  followers: number;
  revenue: number;
  active: boolean;
  createdAt: string;
};

export const creators: Creator[] = [
  { id: 1, name: 'Aman', followers: 1200, revenue: 4500, active: true, createdAt: '2025-01-10' },
  { id: 2, name: 'Riya', followers: 540, revenue: 0, active: false, createdAt: '2025-01-12' },
  { id: 3, name: 'Karan', followers: 9800, revenue: 12000, active: true, createdAt: '2025-01-21' },
  { id: 4, name: 'Neha', followers: 9800, revenue: 2000, active: true, createdAt: '2025-02-02' },
];

export function sortCreators(
  data: Creator[],
  key: 'followers' | 'revenue' | null,
  direction: 'asc' | 'desc'
): Creator[] {
  if (key === null) {
    return [...data];
  }

  const sorted = [...data].sort((a, b) => {
    const aVal = key === 'followers' ? a.followers : a.revenue;
    const bVal = key === 'followers' ? b.followers : b.revenue;

    if (aVal !== bVal) {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Deterministic tie-breaking: sort by name ascending
    return a.name.localeCompare(b.name);
  });

  return sorted;
}

export function filterCreators(
  data: Creator[],
  search: string,
  activeOnly: boolean
): Creator[] {
  return data.filter((creator) => {
    const matchesSearch = search === '' || creator.name.toLowerCase().includes(search.toLowerCase());
    const matchesActive = !activeOnly || creator.active;
    return matchesSearch && matchesActive;
  });
}

export function applyFiltersAndSort(
  data: Creator[],
  search: string,
  activeOnly: boolean,
  sortKey: 'followers' | 'revenue' | null,
  sortDirection: 'asc' | 'desc'
): Creator[] {
  const filtered = filterCreators(data, search, activeOnly);
  return sortCreators(filtered, sortKey, sortDirection);
}

export interface DerivedMetrics {
  totalCreators: number;
  activeCreators: number;
  totalRevenue: number;
  avgRevenuePerActive: number;
}

export function getDerivedMetrics(data: Creator[]): DerivedMetrics {
  const totalCreators = data.length;
  const activeCreators = data.filter((c) => c.active).length;
  const totalRevenue = data.reduce((sum, c) => sum + c.revenue, 0);
  const avgRevenuePerActive = activeCreators > 0 ? totalRevenue / activeCreators : 0;

  return {
    totalCreators,
    activeCreators,
    totalRevenue,
    avgRevenuePerActive,
  };
}
