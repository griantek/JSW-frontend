export type Journal = {
    title: string;
    link: string;
    impactFactor: number;
    issn: string;
    aimsAndScope: string;
    indexed: string[];
    citeScore: number;
    publisher: string;
  };
  
  export type FilterOptions = {
    searchFields: string[];
    publishers: string[];
    databases: string[];
    quartiles?: string[];      // Add this line
    citeScoreRange?: [number, number];
    impactFactorRange?: [number, number];
  };