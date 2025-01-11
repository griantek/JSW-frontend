'use client';

import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  Button
} from '@nextui-org/react';
import { List, Grid } from 'lucide-react';
import { Journal } from '../app/models';

interface SearchResultsProps {
  journals: Journal[];
  viewMode: 'table' | 'card';
  onViewModeChange: (mode: 'table' | 'card') => void;
  hasSearched: boolean; // New prop to track if search was performed
}

export function SearchResults({ 
  journals, 
  viewMode, 
  onViewModeChange, 
  hasSearched 
}: SearchResultsProps) {
  if (!hasSearched) {
    return null; // Don't render anything if search hasn't been performed
  }

  if (hasSearched && journals.length === 0) {
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
          Found {journals.length} {journals.length === 1 ? 'result' : 'results'}
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
        </div>
      </div>

      {viewMode === 'table' ? (
        <Table aria-label="Journals table">
          <TableHeader>
            <TableColumn>Title</TableColumn>
            <TableColumn>Link</TableColumn>
            <TableColumn>Impact Factor</TableColumn>
            <TableColumn>ISSN</TableColumn>
            <TableColumn>Aims & Scope</TableColumn>
            <TableColumn>Indexed</TableColumn>
            <TableColumn>CiteScore</TableColumn>
          </TableHeader>
          <TableBody>
            {journals.map((journal) => (
              <TableRow key={journal.issn}>
                <TableCell>{journal.title}</TableCell>
                <TableCell>
                  <a href={journal.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Visit Journal
                  </a>
                </TableCell>
                <TableCell>{journal.impactFactor}</TableCell>
                <TableCell>{journal.issn}</TableCell>
                <TableCell>{journal.aimsAndScope}</TableCell>
                <TableCell>{journal.indexed.join(', ')}</TableCell>
                <TableCell>{journal.citeScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {journals.map((journal) => (
            <Card key={journal.issn}>
              <CardBody>
                <h3 className="text-lg font-semibold mb-2">{journal.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{journal.publisher}</p>
                <a 
                  href={journal.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline block mb-2"
                >
                  Visit Journal
                </a>
                <div className="space-y-1">
                  <p>Impact Factor: {journal.impactFactor}</p>
                  <p>ISSN: {journal.issn}</p>
                  <p>CiteScore: {journal.citeScore}</p>
                  <p>Indexed in: {journal.indexed.join(', ')}</p>
                  <details>
                    <summary className="cursor-pointer">Aims & Scope</summary>
                    <p className="mt-2 text-sm">{journal.aimsAndScope}</p>
                  </details>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}