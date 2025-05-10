import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Era, Media, MediaFilterOptions, MediaSortOptions, MediaType } from '../types';
import MediaItem from './MediaItem';
import gsap from 'gsap';
import styles from '../styles/Timeline.module.scss';

interface MediaListProps {
  era: Era;
  onBack: () => void;
}

const MediaList: React.FC<MediaListProps> = ({ era, onBack }) => {
  const { t } = useTranslation();
  const [filteredMedia, setFilteredMedia] = useState<Media[]>(era.media);
  const [filterOptions, setFilterOptions] = useState<MediaFilterOptions>({
    type: 'All',
    era: 'All',
    uncertain: 'All',
    search: ''
  });
  const [sortOptions, setSortOptions] = useState<MediaSortOptions>({
    field: 'year',
    direction: 'asc'
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Get unique media types from the era's media
  const mediaTypes = Array.from(new Set(era.media.map(item => item.type))) as MediaType[];

  useEffect(() => {
    // Apply filters and sorting
    let result = [...era.media];

    // Filter by type
    if (filterOptions.type !== 'All') {
      result = result.filter(item => item.type === filterOptions.type);
    }

    // Filter by era (BBY/ABY)
    if (filterOptions.era !== 'All') {
      result = result.filter(item => item.parsedYear.era === filterOptions.era);
    }

    // Filter by uncertainty
    if (filterOptions.uncertain !== 'All') {
      result = result.filter(item => item.parsedYear.uncertain === filterOptions.uncertain);
    }

    // Filter by search term
    if (filterOptions.search) {
      const searchTerm = filterOptions.search.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchTerm) || 
        item.year.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm)
      );
    }

    // Sort the results
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOptions.field) {
        case 'year':
          // Sort by parsed year value and era
          if (a.parsedYear.era !== b.parsedYear.era) {
            // BBY comes before ABY
            return a.parsedYear.era === 'BBY' ? -1 : 1;
          }
          if (a.parsedYear.era === 'BBY') {
            // For BBY, higher numbers are earlier
            comparison = b.parsedYear.value - a.parsedYear.value;
          } else {
            // For ABY, lower numbers are earlier
            comparison = a.parsedYear.value - b.parsedYear.value;
          }
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'releaseDate':
          comparison = a.releaseDate.localeCompare(b.releaseDate);
          break;
      }
      
      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });

    setFilteredMedia(result);
  }, [era.media, filterOptions, sortOptions]);

  useEffect(() => {
    const container = containerRef.current;
    const header = headerRef.current;
    
    if (!container || !header) return;
    
    // Animate the container in
    gsap.fromTo(container, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );
    
    // Animate the header in
    gsap.fromTo(header,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
    
    return () => {
      gsap.killTweensOf(container);
      gsap.killTweensOf(header);
    };
  }, []);

  const handleFilterChange = (key: keyof MediaFilterOptions, value: any) => {
    setFilterOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (field: MediaSortOptions['field']) => {
    setSortOptions(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className={styles.mediaListContainer} ref={containerRef}>
      <div className={styles.mediaListHeader} ref={headerRef}>
        <button className={styles.backButton} onClick={onBack}>
          ← Back to Eras
        </button>
        <h2 className={styles.mediaListTitle}>
          {t(`timeline.${era.id}.title`)} <span>({era.media.length} items)</span>
        </h2>
        <div className={styles.mediaListFilters}>
          <div className={styles.filterGroup}>
            <label htmlFor="typeFilter">Type:</label>
            <select 
              id="typeFilter"
              value={filterOptions.type as string}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="All">All Types</option>
              {mediaTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label htmlFor="eraFilter">Era:</label>
            <select 
              id="eraFilter"
              value={filterOptions.era as string}
              onChange={(e) => handleFilterChange('era', e.target.value)}
            >
              <option value="All">All</option>
              <option value="BBY">BBY</option>
              <option value="ABY">ABY</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label htmlFor="uncertainFilter">Date:</label>
            <select 
              id="uncertainFilter"
              value={filterOptions.uncertain as string}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'true') handleFilterChange('uncertain', true);
                else if (value === 'false') handleFilterChange('uncertain', false);
                else handleFilterChange('uncertain', 'All');
              }}
            >
              <option value="All">All Dates</option>
              <option value="false">Confirmed</option>
              <option value="true">Estimated</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <input 
              type="text"
              placeholder="Search..."
              value={filterOptions.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
        
        <div className={styles.mediaSortOptions}>
          <span>Sort by:</span>
          <button 
            className={`${styles.sortButton} ${sortOptions.field === 'year' ? styles.active : ''}`}
            onClick={() => handleSortChange('year')}
          >
            Year {sortOptions.field === 'year' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            className={`${styles.sortButton} ${sortOptions.field === 'title' ? styles.active : ''}`}
            onClick={() => handleSortChange('title')}
          >
            Title {sortOptions.field === 'title' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            className={`${styles.sortButton} ${sortOptions.field === 'type' ? styles.active : ''}`}
            onClick={() => handleSortChange('type')}
          >
            Type {sortOptions.field === 'type' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            className={`${styles.sortButton} ${sortOptions.field === 'releaseDate' ? styles.active : ''}`}
            onClick={() => handleSortChange('releaseDate')}
          >
            Release Date {sortOptions.field === 'releaseDate' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>
      
      <div className={styles.mediaListResults}>
        <div className={styles.resultCount}>
          Showing {filteredMedia.length} of {era.media.length} items
        </div>
        
        <div className={styles.mediaGrid}>
          {filteredMedia.length > 0 ? (
            filteredMedia.map((media, index) => (
              <MediaItem 
                key={media.id} 
                media={media} 
                index={index}
                delay={0.1}
              />
            ))
          ) : (
            <div className={styles.noResults}>
              No media items match your filters. Try adjusting your search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaList;
