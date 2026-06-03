'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AssetCard from '@/components/asset-card';
import FilterSidebar, { type FilterState } from '@/components/filter-sidebar';
import type { Asset } from '@/types/asset';

const LIMIT = 24;

function AssetGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-100 overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; status?: string; fileType?: string }>;
}) {
  const resolvedSearchParams = use(searchParams);
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const [search, setSearch] = useState(resolvedSearchParams.search ?? '');
  const [filters, setFilters] = useState<FilterState>({
    categories: resolvedSearchParams.category ? [resolvedSearchParams.category] : [],
    statuses: resolvedSearchParams.status ? [resolvedSearchParams.status] : [],
    fileTypes: resolvedSearchParams.fileType ? [resolvedSearchParams.fileType] : [],
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchAssets = useCallback(
    async (currentPage: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (filters.categories.length === 1) params.set('category', filters.categories[0]);
        if (filters.statuses.length === 1) params.set('status', filters.statuses[0]);
        if (filters.fileTypes.length === 1) params.set('fileType', filters.fileTypes[0]);
        params.set('page', String(currentPage));
        params.set('limit', String(LIMIT));

        const res = await fetch(`/api/assets?${params.toString()}`);
        const data = await res.json();
        setAssets(data.assets ?? []);
        setTotalCount(data.totalCount ?? 0);
      } catch {
        setAssets([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [search, filters]
  );

  useEffect(() => {
    setPage(1);
    fetchAssets(1);
  }, [fetchAssets]);

  // Sync URL params with state
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filters.categories.length > 0) params.set('category', filters.categories.join(','));
    if (filters.statuses.length > 0) params.set('status', filters.statuses.join(','));
    if (filters.fileTypes.length > 0) params.set('fileType', filters.fileTypes.join(','));

    const newUrl = `/browse${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [search, filters, router]);

  const totalPages = Math.ceil(totalCount / LIMIT);
  const activeFilterCount =
    filters.categories.length + filters.statuses.length + filters.fileTypes.length;

  function handlePageChange(newPage: number) {
    setPage(newPage);
    fetchAssets(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchAssets(1);
    setPage(1);
  }

  return (
    <div className="flex-1 bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets..."
                className="pl-9 h-9 text-sm bg-white border-slate-200"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            {/* Mobile filter toggle */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger className="lg:hidden inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center h-4 w-4 text-xs bg-blue-600 text-white rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-white overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <FilterSidebar filters={filters} setFilters={setFilters} />
              </SheetContent>
            </Sheet>

            {/* View toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-white">
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-md ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-md ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Result count */}
            <span className="hidden sm:block text-sm text-slate-500 whitespace-nowrap">
              {loading ? '...' : `${totalCount.toLocaleString()} asset${totalCount !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-36 bg-white rounded-xl border border-slate-200 p-5">
              <FilterSidebar filters={filters} setFilters={setFilters} />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant="secondary"
                    className="gap-1 bg-blue-50 text-blue-700 border-blue-200 cursor-pointer"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        categories: filters.categories.filter((c) => c !== cat),
                      })
                    }
                  >
                    {cat}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
                {filters.statuses.map((st) => (
                  <Badge
                    key={st}
                    variant="secondary"
                    className="gap-1 bg-green-50 text-green-700 border-green-200 cursor-pointer"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        statuses: filters.statuses.filter((s) => s !== st),
                      })
                    }
                  >
                    {st}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
                {filters.fileTypes.map((ft) => (
                  <Badge
                    key={ft}
                    variant="secondary"
                    className="gap-1 bg-slate-100 text-slate-700 border-slate-200 cursor-pointer"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        fileTypes: filters.fileTypes.filter((f) => f !== ft),
                      })
                    }
                  >
                    {ft}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Assets grid/list */}
            {loading ? (
              viewMode === 'grid' ? (
                <AssetGridSkeleton />
              ) : (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              )
            ) : assets.length === 0 ? (
              <div className="text-center py-20">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No assets found</h3>
                <p className="text-slate-500 text-sm">
                  Try adjusting your search or filter criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearch('');
                    setFilters({ categories: [], statuses: [], fileTypes: [] });
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {assets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} viewMode="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {assets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} viewMode="list" />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        className={`h-8 w-8 p-0 text-sm ${page === pageNum ? 'bg-[#4E86F7] hover:bg-[#3a72e3] text-white' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
