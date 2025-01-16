'use client';

import React from 'react';
import {
  Radio,
  RadioGroup,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Slider,
  Chip,
  Checkbox // Add this line
} from '@nextui-org/react';
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import { FilterOptions } from '../app/models';
import { SEARCH_FIELDS, PUBLISHERS, DATABASES, QUARTILES } from '../app/constants/filters';

interface FiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  useCiteScore: boolean;
  setUseCiteScore: (value: boolean) => void;
  useImpactFactor: boolean;
  setUseImpactFactor: (value: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  disabled?: boolean; // Add this line
  useQuartiles?: boolean;  // Add this
  setUseQuartiles?: (value: boolean) => void;  // Add this
  useAimsAndScope?: boolean;  // Add this
  setUseAimsAndScope?: (value: boolean) => void;  // Add this
}

// Add initial range values
const DEFAULT_CITESCORE_RANGE: [number, number] = [0, 1000];
const DEFAULT_IMPACT_FACTOR_RANGE: [number, number] = [0, 300];

export function Filters({ 
  filters, 
  onFiltersChange, 
  useCiteScore, 
  setUseCiteScore, 
  useImpactFactor, 
  setUseImpactFactor,
  isExpanded,
  setIsExpanded,
  disabled = false, // Add default value
  useQuartiles = false,  // Add this
  setUseQuartiles = () => {},  // Add this
  useAimsAndScope = false,  // Add this
  setUseAimsAndScope = () => {},  // Add this
}: FiltersProps) {

  const updateFilters = (updates: Partial<FilterOptions>) => {
    const newFilters = { ...filters, ...updates };
    onFiltersChange(newFilters);
  };

  const removePublisher = (publisher: string) => {
    updateFilters({
      publishers: filters.publishers.filter(p => p !== publisher)
    });
  };

  const removeDatabase = (database: string) => {
    updateFilters({
      databases: filters.databases.filter(d => d !== database)
    });
  };

  const removeQuartile = (quartile: string) => {
    updateFilters({
      quartiles: filters.quartiles?.filter(q => q !== quartile) || []
    });
  };

  const resetRanges = () => {
    updateFilters({
      citeScoreRange: [0, 1000],
      impactFactorRange: [0, 300]
    });
  };

  const handleCiteScoreChange = (checked: boolean) => {
    setUseCiteScore(checked);
    const newFilters = { ...filters };
    if (checked) {
      // Initialize with default range when checked
      newFilters.citeScoreRange = DEFAULT_CITESCORE_RANGE;
    } else {
      delete newFilters.citeScoreRange;
    }
    onFiltersChange(newFilters);
  };

  const handleImpactFactorChange = (checked: boolean) => {
    setUseImpactFactor(checked);
    const newFilters = { ...filters };
    if (checked) {
      // Initialize with default range when checked
      newFilters.impactFactorRange = DEFAULT_IMPACT_FACTOR_RANGE;
    } else {
      delete newFilters.impactFactorRange;
    }
    onFiltersChange(newFilters);
  };

  const handleQuartileChange = (checked: boolean) => {
    setUseQuartiles(checked);
    const newFilters = { ...filters };
    if (!checked) {
      delete newFilters.quartiles;
    } else if (!newFilters.quartiles) {
      newFilters.quartiles = []; // Initialize empty array when enabled
    }
    onFiltersChange(newFilters);
  };

  // Filter tags section to show selected filters
  const SelectedFilters = () => {
    const hasFilters = filters.searchFields.length > 0 || 
                      filters.publishers.length > 0 || 
                      filters.databases.length > 0 ||
                      (filters.quartiles && filters.quartiles.length > 0) || // Add this
                      useCiteScore ||
                      useImpactFactor ||
                      (useQuartiles && filters.quartiles && filters.quartiles.length > 0);

    if (!hasFilters) return null;

    return (
      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-2">
          {/* Search Fields Tags */}
          {filters.searchFields.filter(field => field !== 'Aims & Scope').map((field) => (
            <Chip
              key={field}
              variant="flat"
              color="primary"
              className="px-2 py-1"
            >
              Field: {field}
            </Chip>
          ))}

          {/* Publishers Tags */}
          {filters.publishers.map((publisher) => (
            <Chip
              key={publisher}
              onClose={() => removePublisher(publisher)}
              variant="flat"
              color="secondary"
              className="px-2 py-1"
            >
              Publisher: {publisher}
            </Chip>
          ))}

          {/* Databases Tags */}
          {filters.databases.map((database) => (
            <Chip
              key={database}
              onClose={() => removeDatabase(database)}
              variant="flat"
              color="success"
              className="px-2 py-1"
            >
              Index : {database}
            </Chip>
          ))}

          {/* Quartiles Tags */}
          {filters.quartiles?.map((quartile) => (
            <Chip
              key={quartile}
              onClose={() => removeQuartile(quartile)}
              variant="flat"
              color="default"
              className="px-2 py-1"
            >
              Quartile: {quartile}
            </Chip>
          ))}

          {/* Range Filters */}
          {useCiteScore && (
            <Chip
              onClose={() => {
                setUseCiteScore(false);
                resetRanges();
              }}
              variant="flat"
              color="warning"
              className="px-2 py-1"
            >
              CiteScore: {filters.citeScoreRange ? 
                `${filters.citeScoreRange[0]}-${filters.citeScoreRange[1]}` : 
                `${DEFAULT_CITESCORE_RANGE[0]}-${DEFAULT_CITESCORE_RANGE[1]}`}
            </Chip>
          )}

          {useImpactFactor && (
            <Chip
              onClose={() => {
                setUseImpactFactor(false);
                resetRanges();
              }}
              variant="flat"
              color="warning"
              className="px-2 py-1"
            >
              Impact Factor: {filters.impactFactorRange ? 
                `${filters.impactFactorRange[0]}-${filters.impactFactorRange[1]}` : 
                `${DEFAULT_IMPACT_FACTOR_RANGE[0]}-${DEFAULT_IMPACT_FACTOR_RANGE[1]}`}
            </Chip>
          )}

          {/* Clear All Button */}
          <Button
            size="sm"
            color="danger"
            variant="light"
            onClick={() => {
              setUseCiteScore(false);
              setUseImpactFactor(false);
              onFiltersChange({
                searchFields: ['Title'],
                publishers: [],
                databases: [],
                citeScoreRange: [0, 1000],
                impactFactorRange: [0, 300],
              });
            }}
            className="ml-2"
          >
            Clear All Filters
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-8 border rounded-lg shadow-sm">
      {/* Filter Header */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center p-4 bg-default-100 rounded-t-lg"
        variant="light"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          <span className="font-medium">Filters</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </Button>

      {/* Selected Filters Display */}
      <SelectedFilters />

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Main grid container with better responsive layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {/* Search Fields - Full width on small screens */}
            <div className="sm:col-span-2 lg:col-span-1 space-y-3">
              <h3 className="font-medium">Search Fields</h3>
              <RadioGroup
                value={filters.searchFields[0]}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFilters({ 
                    searchFields: [value]
                  });
                  // Reset Aims & Scope checkbox when switching away from Title
                  if (value !== 'Title') {
                    setUseAimsAndScope(false);
                  }
                }}
                className="space-y-2"
              >
                {SEARCH_FIELDS.map((field) => (
                  <Radio key={field} value={field} className="max-w-full">
                    <div className="flex items-center justify-between w-full gap-2">
                      <span>{field}</span>
                      {/* Only show checkbox when Title is selected */}
                      {field === 'Title' && filters.searchFields[0] === 'Title' && (
                        <Checkbox
                          color="primary"
                          isSelected={useAimsAndScope}
                          onValueChange={setUseAimsAndScope}
                          size="sm"
                        >
                          <span className="text-sm">Include Aims & Scope</span>
                        </Checkbox>
                      )}
                    </div>
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            {/* Publishers Dropdown - Responsive width */}
            <div className="space-y-3">
              <h3 className="font-medium">Publishers</h3>
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="bordered"
                    className="w-full justify-between min-h-unit-10"
                  >
                    <span className="truncate">
                      {filters.publishers.length 
                        ? `${filters.publishers.length} selected`
                        : "Select Publishers"}
                    </span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectionMode="multiple"
                  selectedKeys={new Set(filters.publishers)}
                  onSelectionChange={(keys) => updateFilters({ 
                    publishers: Array.from(keys) as string[] 
                  })}
                >
                  {PUBLISHERS.map((publisher) => (
                    <DropdownItem key={publisher}>{publisher}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>

            {/* Databases Dropdown - Responsive width */}
            <div className="space-y-3">
              <h3 className="font-medium">Indexing</h3>
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="bordered"
                    className="w-full justify-between min-h-unit-10"
                  >
                    <span className="truncate">
                      {filters.databases.length 
                        ? `${filters.databases.length} selected`
                        : "Select Indexing"}
                    </span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectionMode="multiple"
                  selectedKeys={new Set(filters.databases)}
                  onSelectionChange={(keys) => updateFilters({ 
                    databases: Array.from(keys) as string[] 
                  })}
                >
                  {DATABASES.map((database) => (
                    <DropdownItem key={database}>{database}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>

            {/* Quartiles Section - Better responsive layout */}
            <div className="sm:col-span-2 lg:col-span-3 space-y-3">
              <Checkbox
                isSelected={useQuartiles}
                onValueChange={handleQuartileChange}
              >
                Use Quartiles
              </Checkbox>
              {useQuartiles && (
                <div className="mt-2">
                  <h3 className="font-medium mb-2">Quartiles</h3>
                  <div className="flex flex-wrap gap-2">
                    {QUARTILES.map((quartile) => {
                      const isSelected = filters.quartiles?.includes(quartile) || false;
                      return (
                        <Button
                          key={quartile}
                          variant={isSelected ? "solid" : "bordered"}
                          color={isSelected ? "primary" : "default"}
                          className={`min-w-[60px] ${isSelected ? 'bg-primary-500' : ''}`}
                          onClick={() => {
                            const currentQuartiles = filters.quartiles || [];
                            const newQuartiles = isSelected
                              ? currentQuartiles.filter(q => q !== quartile)
                              : [...currentQuartiles, quartile];
                            updateFilters({ quartiles: newQuartiles });
                          }}
                        >
                          {quartile}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Range Sliders - Better responsive layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
            <div className="space-y-3">
              <Checkbox
                isSelected={useCiteScore}
                onValueChange={handleCiteScoreChange}
              >
                Use CiteScore
              </Checkbox>
              {useCiteScore && (
                <div className="space-y-2">
                  <h3 className="font-medium">CiteScore Range</h3>
                  <Slider
                    label="CiteScore"
                    step={1}
                    minValue={0}
                    maxValue={1000}
                    value={filters.citeScoreRange || DEFAULT_CITESCORE_RANGE}
                    onChange={(value) => {
                      if (Array.isArray(value) && value.length === 2) {
                        updateFilters({ citeScoreRange: value as [number, number] });
                      }
                    }}
                    className="max-w-full px-1"
                  />
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Checkbox
                isSelected={useImpactFactor}
                onValueChange={handleImpactFactorChange}
              >
                Use Impact Factor
              </Checkbox>
              {useImpactFactor && (
                <div className="space-y-2">
                  <h3 className="font-medium">Impact Factor Range</h3>
                  <Slider
                    label="Impact Factor"
                    step={0.1}
                    minValue={0}
                    maxValue={300}
                    value={filters.impactFactorRange || DEFAULT_IMPACT_FACTOR_RANGE}
                    onChange={(value) => {
                      if (Array.isArray(value) && value.length === 2) {
                        updateFilters({ impactFactorRange: value as [number, number] });
                      }
                    }}
                    className="max-w-full px-1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Clear Filters Button - Consistent positioning */}
          {/* <div className="flex justify-end pt-4 border-t">
            <Button
              color="danger"
              variant="light"
              className="min-w-[120px]"
              onClick={() => {
                setUseCiteScore(false);
                setUseImpactFactor(false);
                onFiltersChange({
                  searchFields: ['Title'],
                  publishers: [],
                  databases: [],
                  citeScoreRange: [0, 1000],
                  impactFactorRange: [0, 300],
                });
              }}
            >
              Clear All Filters
            </Button>
          </div> */}
        </div>
      )}
    </div>
  );
}