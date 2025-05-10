export interface ParsedYear {
  value: number;
  era: 'BBY' | 'ABY';
  uncertain: boolean;
}

export interface YearRange {
  start: number;
  end: number;
  era: 'BBY' | 'ABY';
}

export interface Media {
  id: string;
  year: string;
  title: string;
  type: string;
  link: string;
  releaseDate: string;
  parsedYear: ParsedYear;
}

export interface Era {
  id: string;
  yearRange: YearRange;
  title: string;
  image: string;
  index: number;
  media: Media[];
}

export interface TimelineData {
  eras: Era[];
}

export interface TimelineEra {
  id: string;
  year: string;
  title: string;
  image: string;
  index: number;
}

export interface TimelineErasData {
  items: TimelineEra[];
}

export type MediaType = 
  | 'Film'
  | 'TV Series'
  | 'Novel'
  | 'Young Adult Novel'
  | 'Junior Novel'
  | 'Comic'
  | 'Video Game'
  | 'VR Experience'
  | 'Audio Drama'
  | 'Short Story'
  | 'Other';

export interface MediaFilterOptions {
  type?: MediaType | 'All';
  era?: 'BBY' | 'ABY' | 'All';
  uncertain?: boolean | 'All';
  search?: string;
}

export interface MediaSortOptions {
  field: 'year' | 'title' | 'type' | 'releaseDate';
  direction: 'asc' | 'desc';
}
