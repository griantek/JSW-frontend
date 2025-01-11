'use client';

import React, { useState } from 'react';
import {
  Checkbox,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Slider,
  Chip
} from '@nextui-org/react';
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import { FilterOptions } from '../app/models';
import { SEARCH_FIELDS, PUBLISHERS, DATABASES } from '../app/constants/filters';

interface FiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function Filters({ filters, onFiltersChange }: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<FilterOptions>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const removeSearchField = (field: string) => {
    updateFilters({
      searchFields: filters.searchFields.filter(f => f !== field)
    });
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

  const resetRanges = () => {
    updateFilters({
      citeScoreRange: [0, 100],
      impactFactorRange: [0, 20]
    });
  };

  // Filter tags section to show selected filters
  const SelectedFilters = () => {
    const hasFilters = filters.searchFields.length > 0 || 
                      filters.publishers.length > 0 || 
                      filters.databases.length > 0 ||
                      filters.citeScoreRange[0] > 0 ||
                      filters.citeScoreRange[1] < 100 ||
                      filters.impactFactorRange[0] > 0 ||
                      filters.impactFactorRange[1] < 20;

    if (!hasFilters) return null;

    return (
      <div className="mb-4 p-4 border-b">
        <div className="flex flex-wrap gap-2">
          {/* Search Fields Tags */}
          {filters.searchFields.map((field) => (
            <Chip
              key={field}
              onClose={() => removeSearchField(field)}
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
              Database: {database}
            </Chip>
          ))}

          {/* Range Filters */}
          {(filters.citeScoreRange[0] > 0 || filters.citeScoreRange[1] < 100) && (
            <Chip
              onClose={resetRanges}
              variant="flat"
              color="warning"
              className="px-2 py-1"
            >
              CiteScore: {filters.citeScoreRange[0]}-{filters.citeScoreRange[1]}
            </Chip>
          )}

          {(filters.impactFactorRange[0] > 0 || filters.impactFactorRange[1] < 20) && (
            <Chip
              onClose={resetRanges}
              variant="flat"
              color="warning"
              className="px-2 py-1"
            >
              Impact Factor: {filters.impactFactorRange[0]}-{filters.impactFactorRange[1]}
            </Chip>
          )}

          {/* Clear All Button */}
          <Button
            size="sm"
            color="danger"
            variant="light"
            onClick={() => onFiltersChange({
              searchFields: [],
              publishers: [],
              databases: [],
              citeScoreRange: [0, 100],
              impactFactorRange: [0, 20],
            })}
            className="ml-2"
          >
            Clear All
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

      {/* Filter Content - Rest of the component remains the same */}

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Search Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium mb-3">Search Fields</h3>
              {SEARCH_FIELDS.map((field) => (
                <Checkbox
                  key={field}
                  isSelected={filters.searchFields.includes(field)}
                  onValueChange={(checked) => {
                    updateFilters({
                      searchFields: checked 
                        ? [...filters.searchFields, field]
                        : filters.searchFields.filter(f => f !== field)
                    });
                  }}
                >
                  {field}
                </Checkbox>
              ))}
            </div>

            {/* Publishers Dropdown */}
            <div className="space-y-2">
              <h3 className="font-medium mb-3">Publishers</h3>
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="bordered"
                    className="w-full justify-between"
                  >
                    {filters.publishers.length 
                      ? `${filters.publishers.length} selected`
                      : "Select Publishers"}
                    <ChevronDown className="h-4 w-4" />
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

            {/* Databases Dropdown */}
            <div className="space-y-2">
              <h3 className="font-medium mb-3">Databases</h3>
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="bordered"
                    className="w-full justify-between"
                  >
                    {filters.databases.length 
                      ? `${filters.databases.length} selected`
                      : "Select Databases"}
                    <ChevronDown className="h-4 w-4" />
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
          </div>

          {/* Range Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">CiteScore Range</h3>
              <Slider
                label="CiteScore"
                step={1}
                minValue={0}
                maxValue={100}
                value={filters.citeScoreRange}
                onChange={(value) => updateFilters({ 
                  citeScoreRange: [value as number, filters.citeScoreRange[1]] 
                })}
                className="max-w-md"
              />
            </div>
            <div>
              <h3 className="font-medium mb-3">Impact Factor Range</h3>
              <Slider
                label="Impact Factor"
                step={0.1}
                minValue={0}
                maxValue={20}
                value={filters.impactFactorRange}
                onChange={(value) => updateFilters({ 
                  impactFactorRange: [value as number, filters.impactFactorRange[1]] 
                })}
                className="max-w-md"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {1 > 0 && (
            <div className="flex justify-end pt-4 border-t">
              <Button
                color="danger"
                variant="light"
                onClick={() => onFiltersChange({
                  searchFields: [],
                  publishers: [],
                  databases: [],
                  citeScoreRange: [0, 100],
                  impactFactorRange: [0, 20],
                })}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}