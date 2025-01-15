'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  Button,
  Pagination,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@nextui-org/react';
import { List, Grid, ChevronRight, Copy, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react';
import { Journal } from '../app/models';

const truncateText = (text: string, maxLength: number = 50) => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

const isValidValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (typeof value === 'number' && isNaN(value)) return false;
  return true;
};

const formatJournalForCopy = (journal: Journal) => {
  const indexed = Array.isArray(journal.indexed) ? journal.indexed.join(', ') : journal.indexed || '-';
  return `
Title: ${journal.title || '-'} \n
Link: ${journal.link || '-'} \n
Impact Factor: ${isValidValue(journal.impactFactor) ? journal.impactFactor : '-'} \n
CiteScore: ${isValidValue(journal.citeScore) ? journal.citeScore : '-'} \n
ISSN: ${journal.issn || '-'} \n
Indexed: ${indexed} \n
Publisher: ${journal.publisher || '-'} \n
  `.trim();
};

const copyToClipboard = (text: string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      // alert('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      fallbackCopyToClipboard(text);
    });
  } else {
    fallbackCopyToClipboard(text);
  }
};

const fallbackCopyToClipboard = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";  // Avoid scrolling to bottom
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'Copied to clipboard' : 'Failed to copy';
    // alert(msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }
  document.body.removeChild(textArea);
};

interface SearchResultsProps {
  journals: Journal[];
  viewMode: 'table' | 'card';
  onViewModeChange: (mode: 'table' | 'card') => void;
  hasSearched: boolean;
  onSortChange: (sortOption: string, sortOrder: 'asc' | 'desc') => void;
  currentSortOption: string; // Add this
  currentSortOrder: 'asc' | 'desc'; // Add this
}

export function SearchResults({ 
  journals, 
  viewMode, 
  onViewModeChange, 
  hasSearched,
  onSortChange,
  currentSortOption, // Add this
  currentSortOrder, // Add this
}: SearchResultsProps) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [visibleItems, setVisibleItems] = useState(10);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleSortChange = (option: string) => {
    let newSortOrder: 'asc' | 'desc';
    
    // If clicking the same option, toggle the order
    if (option === currentSortOption) {
      newSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // For a new option, start with desc
      newSortOrder = 'desc';
    }
    
    // Only call the parent handler
    onSortChange(option, newSortOrder);
  };

  const renderSortIcon = (option: string) => {
    if (currentSortOption === option) {
      return currentSortOrder === 'asc' ? 
        <ArrowUp className="h-4 w-4 ml-2 text-primary" /> : 
        <ArrowDown className="h-4 w-4 ml-2 text-primary" />;
    }
    return null;
  };

  const uniqueJournals = useMemo(() => journals.reduce((acc, journal) => {
    if (!acc.some(j => j.issn === journal.issn)) {
      acc.push(journal);
    }
    return acc;
  }, [] as Journal[]), [journals]);

  const pages = Math.ceil(uniqueJournals.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return uniqueJournals.slice(start, end);
  }, [page, uniqueJournals]);

  const visibleCards = useMemo(() => uniqueJournals.slice(0, visibleItems), [uniqueJournals, visibleItems]);

  // Reset visible items when view mode changes
  useEffect(() => {
    setVisibleItems(10);
  }, [viewMode]);

  // Update the intersection observer effect to depend on viewMode
  useEffect(() => {
    if (viewMode !== 'card') return; // Only run for card view

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleItems((prev) => Math.min(prev + 10, uniqueJournals.length));
      }
    });

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [uniqueJournals, viewMode]); // Add viewMode as dependency

  if (!hasSearched) {
    return null; // Don't render anything if search hasn't been performed
  }

  if (hasSearched && uniqueJournals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600">No results found. Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Found {uniqueJournals.length} {uniqueJournals.length === 1 ? 'result' : 'results'}
        </h2>
        <div className="flex gap-2 items-center">
          <Button
            isIconOnly
            variant="light"
            onClick={() => onViewModeChange('table')}
          >
            <List className={viewMode === 'table' ? 'text-primary' : 'text-gray-400'} />
          </Button>
          <Button
            isIconOnly
            variant="light"
            onClick={() => onViewModeChange('card')}
          >
            <Grid className={viewMode === 'card' ? 'text-primary' : 'text-gray-400'} />
          </Button>
          <div className="border-l h-6 mx-2"></div>
          <Dropdown>
            <DropdownTrigger>
              <Button variant="light" endContent={<ChevronDown className="h-4 w-4" />}>
                Sort by: {currentSortOption} ({currentSortOrder})
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              selectedKeys={new Set([currentSortOption])}
              selectionMode="single"
              aria-label="Sort options"
            >
              {[{ key: 'impactFactor', label: 'Impact Factor' },
                { key: 'citeScore', label: 'CiteScore' },
                { key: 'title', label: 'Title' },
                { key: 'publisher', label: 'Publisher' }
              ].map(({ key, label }) => (
                <DropdownItem 
                  key={key}
                  onClick={() => handleSortChange(key)}
                  endContent={renderSortIcon(key)}
                  className="flex justify-between items-center"
                >
                  {label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div>
          <Table 
            aria-label="Journals table"
            bottomContent={
              pages > 1 ? (
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={(page) => setPage(page)}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader>
              <TableColumn>Title</TableColumn>
              <TableColumn>Link</TableColumn>
              <TableColumn>Impact Factor</TableColumn>
              <TableColumn>CiteScore</TableColumn>
              <TableColumn>ISSN</TableColumn>
              <TableColumn>Aims & Scope</TableColumn>
              <TableColumn>Indexed</TableColumn>
              <TableColumn>Publisher</TableColumn>
              <TableColumn>Copy</TableColumn>
            </TableHeader>
            <TableBody>
              {items.map((journal) => (
                <TableRow key={journal.issn + journal.title}>
                  <TableCell>{journal.title || '-'}</TableCell>
                  <TableCell>
                    {journal.link ? (
                      <a href={journal.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Link
                      </a>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{isValidValue(journal.impactFactor) ? journal.impactFactor : '-'}</TableCell>
                  <TableCell>{isValidValue(journal.citeScore) ? journal.citeScore : '-'}</TableCell>
                  <TableCell>{journal.issn || '-'}</TableCell>
                  <TableCell>
                    {journal.aimsAndScope ? (
                      <Popover placement="right">
                        <PopoverTrigger>
                          <Button 
                            size="sm" 
                            variant="light" 
                            className="text-primary text-left justify-start"
                            endContent={<ChevronRight className="h-4 w-4 flex-shrink-0" />}
                          >
                            {truncateText(journal.aimsAndScope)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-4 py-3 max-w-[400px]">
                            <h4 className="font-semibold mb-2">Aims & Scope</h4>
                            <p className="text-sm text-gray-600">{journal.aimsAndScope}</p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {journal.indexed && journal.indexed.length > 0 ? (
                      <Popover placement="right">
                        <PopoverTrigger>
                          <Button 
                            size="sm" 
                            variant="light" 
                            className="text-primary text-left justify-start"
                            endContent={<ChevronRight className="h-4 w-4 flex-shrink-0" />}
                          >
                            {truncateText(Array.isArray(journal.indexed) ? journal.indexed.join(', ') : journal.indexed)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-4 py-3 max-w-[400px]">
                            <h4 className="font-semibold mb-2">Indexed</h4>
                            <p className="text-sm text-gray-600">{Array.isArray(journal.indexed) ? journal.indexed.join(', ') : journal.indexed}</p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {journal.publisher ? (
                      <span className="text-default-600">{journal.publisher}</span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Tooltip content="Copy">
                      <Button 
                        isIconOnly 
                        variant="light" 
                        onClick={() => copyToClipboard(formatJournalForCopy(journal))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleCards.map((journal) => (
            <Card key={journal.issn + journal.title}>
              <CardBody>
                <h3 className="text-lg font-semibold mb-2">{journal.title}</h3>
                {journal.publisher && (
                  <p className="text-sm text-gray-600 mb-2">{journal.publisher}</p>
                )}
                {journal.link && (
                  <a 
                    href={journal.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:underline block mb-2"
                  >
                    Visit Journal
                  </a>
                )}
                <div className="space-y-1">
                  {isValidValue(journal.impactFactor) && (
                    <p>Impact Factor: {journal.impactFactor}</p>
                  )}
                  {journal.issn && <p>ISSN: {journal.issn}</p>}
                  {isValidValue(journal.citeScore) && (
                    <p>CiteScore: {journal.citeScore}</p>
                  )}
                  {journal.indexed && journal.indexed.length > 0 && (
                    <details>
                      <summary className="cursor-pointer">Indexed in</summary>
                      <p className="mt-2 text-sm">
                        {Array.isArray(journal.indexed) ? journal.indexed.join(', ') : journal.indexed}
                      </p>
                    </details>
                  )}
                  {journal.aimsAndScope && (
                    <details>
                      <summary className="cursor-pointer">Aims & Scope</summary>
                      <p className="mt-2 text-sm">{journal.aimsAndScope}</p>
                    </details>
                  )}
                </div>
                <Tooltip content="Copy">
                  <Button 
                    isIconOnly 
                    variant="light" 
                    onClick={() => copyToClipboard(formatJournalForCopy(journal))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </Tooltip>
              </CardBody>
            </Card>
          ))}
          <div ref={loadMoreRef} />
        </div>
      )}
    </div>
  );
}