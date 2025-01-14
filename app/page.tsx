'use client';
import React, { useState, useCallback, useRef } from 'react';
import { Input, Button, Spinner } from '@nextui-org/react';
import { Search } from 'lucide-react';
import debounce from 'lodash/debounce';
import { Filters } from '../components/Filters';
import { SearchResults } from '../components/SearchResults';
import { GoToTopButton } from '../components/GoToTopButton'; // Import the GoToTopButton component
import { searchJournals } from './lib/api';
import type { Journal, FilterOptions } from './models';

export default function JournalSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [filters, setFilters] = useState<FilterOptions>({
    searchFields: ['Title'], // Ensure 'Title' is always included initially
    publishers: [],
    databases: [],
    citeScoreRange: [0, 100],
    impactFactorRange: [0, 20],
  });
  const [useCiteScore, setUseCiteScore] = useState(false);
  const [useImpactFactor, setUseImpactFactor] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sortOption, setSortOption] = useState('impactFactor');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentSearchState, setCurrentSearchState] = useState<{
    query: string;
    filters: FilterOptions;
    sortOption: string;
    sortOrder: 'asc' | 'desc';
  } | null>(null);

  const cacheRef = useRef<{ [key: string]: Journal[] }>({});

  const debouncedSearch = useCallback(
    debounce(async (query: string, searchFilters: Partial<FilterOptions>, sortOption: string, sortOrder: 'asc' | 'desc') => {
      if (!query.trim()) return;
      
      // Create a complete FilterOptions object from the partial one, but only include ranges if they're enabled
      const completeFilters: FilterOptions = {
        searchFields: searchFilters.searchFields || ['Title'],
        publishers: searchFilters.publishers || [],
        databases: searchFilters.databases || [],
        // Only include these if they exist in searchFilters
        ...(searchFilters.citeScoreRange && { citeScoreRange: searchFilters.citeScoreRange }),
        ...(searchFilters.impactFactorRange && { impactFactorRange: searchFilters.impactFactorRange }),
      };
      
      const searchState = { 
        query, 
        filters: completeFilters, 
        sortOption, 
        sortOrder 
      };
      
      const cacheKey = JSON.stringify(searchState);
      
      if (cacheRef.current[cacheKey]) {
        setJournals(cacheRef.current[cacheKey]);
        setCurrentSearchState(searchState);
        setHasSearched(true);
        setIsFiltersExpanded(false);
        setIsProcessing(false);
        setIsLoading(false);
        return;
      }

      try {
        const results = await searchJournals(query, completeFilters, sortOption, sortOrder);
        cacheRef.current[cacheKey] = results;
        
        requestAnimationFrame(() => {
          setJournals(results);
          setCurrentSearchState(searchState);
          setHasSearched(true);
          setIsFiltersExpanded(false);
          setIsProcessing(false);
          setIsLoading(false);
        });
      } catch (error) {
        console.error(error);
        setJournals([]);
        setIsProcessing(false);
        setIsLoading(false);
      }
    }, 500), // Increased debounce time
    []
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setIsProcessing(true);
    
    const searchFilters: Partial<FilterOptions> = {
      searchFields: [...(filters.searchFields || [])],
      publishers: filters.publishers,
      databases: filters.databases,
    };

    // Only add ranges if they're enabled
    if (useCiteScore) {
      searchFilters.citeScoreRange = filters.citeScoreRange;
    }
    if (useImpactFactor) {
      searchFilters.impactFactorRange = filters.impactFactorRange;
    }

    // Add Aims & Scope if Title is selected
    if (searchFilters.searchFields?.includes('Title')) {
      searchFilters.searchFields.push('Aims & Scope');
    }

    try {
      debouncedSearch(searchQuery, searchFilters, sortOption, sortOrder);
    } catch (error) {
      console.error('Search error:', error);
      setIsProcessing(false);
      setIsLoading(false);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleSortChange = (newSortOption: string, newSortOrder: 'asc' | 'desc') => {
    // Only perform search if we have previous search state
    if (!currentSearchState) return;

    // Update the state immediately
    setSortOption(newSortOption);
    setSortOrder(newSortOrder);
    setIsProcessing(true);

    // Use current search state with new sort options
    const searchFilters: Partial<FilterOptions> = { ...currentSearchState.filters };
    
    // Ensure we're using the current checkbox states
    if (!useCiteScore) {
      delete searchFilters.citeScoreRange;
    }
    if (!useImpactFactor) {
      delete searchFilters.impactFactorRange;
    }

    // Force the debounce to execute immediately for sorting
    debouncedSearch.cancel();
    debouncedSearch(
      currentSearchState.query,
      searchFilters,
      newSortOption,
      newSortOrder
    );
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-[1400px]">
      <div className="w-full max-w-3xl mx-auto mb-8">
        <div className="flex gap-2">
          <Input
            placeholder="Search by Title, ISSN, or Aims & Scope"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-grow"
          />
          <Button 
            isLoading={isLoading}
            onClick={handleSearch}
            isDisabled={!searchQuery.trim()}
          >
            {!isLoading && <Search className="h-4 w-4" />}
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      <Filters 
        filters={filters} 
        onFiltersChange={setFilters} 
        useCiteScore={useCiteScore}
        setUseCiteScore={setUseCiteScore}
        useImpactFactor={useImpactFactor}
        setUseImpactFactor={setUseImpactFactor}
        isExpanded={isFiltersExpanded}
        setIsExpanded={setIsFiltersExpanded}
        disabled={isProcessing}
      />

      {isProcessing ? (
        <div className="flex justify-center items-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <SearchResults 
          journals={journals}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          hasSearched={hasSearched}
          onSortChange={handleSortChange}
          currentSortOption={sortOption} // Add this
          currentSortOrder={sortOrder} // Add this
        />
      )}

      <GoToTopButton /> {/* Add the GoToTopButton component */}
    </main>
  );
}