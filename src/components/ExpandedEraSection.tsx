import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { Era, Media, MediaFilterOptions, MediaSortOptions } from '../types';
import MediaItem from './MediaItem';
import styles from '../styles/Timeline.module.scss';

interface ExpandedEraSectionProps {
  era: Era;
  isActive: boolean;
}

const ExpandedEraSection: React.FC<ExpandedEraSectionProps> = ({ era, isActive }) => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mediaGridRef = useRef<HTMLDivElement>(null);
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
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Format year range for display
  const yearRangeText = `${era.yearRange.start.toLocaleString()} – ${era.yearRange.end.toLocaleString()} ${era.yearRange.era}`;

  // Get unique media types from the era's media
  const mediaTypes = Array.from(new Set(era.media.map(item => item.type)));

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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return;

    const section = sectionRef.current;
    const heading = headingRef.current;
    const mediaGrid = mediaGridRef.current;

    if (!section || !heading || !mediaGrid) return;

    // Set animation start state
    gsap.set(heading, {
      opacity: 0,
      y: 30
    });

    // Create the timeline
    const sectionTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top center',
        end: `+=${window.innerHeight}`,
        toggleActions: 'play none none reverse',
      },
    });

    // Add tweens to the timeline
    sectionTl.to(heading, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    });

    return () => {
      // Cleanup
      sectionTl.kill();
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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section
      id={era.id}
      ref={sectionRef}
      className={`${styles.expandedEraSection} ${isActive ? styles.active : ''}`}
      style={{
        '--i': era.index,
        backgroundColor: `hsl(${(era.index + 1) * 30} 75% 10%)`,
      }}
    >
      <div className={styles.expandedEraHeader}>
        <div className={styles.eraIconContainer}>
          <img 
            src={era.image} 
            alt={t(`timeline.${era.id}.title`)} 
            className={styles.eraIcon}
          />
        </div>
        <h2 className={styles.expandedEraTitle} ref={headingRef}>
          <span className={styles.eraYear}>{yearRangeText}</span>
          <span className={styles.eraName}>{t(`timeline.${era.id}.title`)}</span>
        </h2>
        <div className={styles.eraControls}>
          <button 
            className={`${styles.eraToggleButton} ${isExpanded ? styles.expanded : ''}`}
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            aria-controls={`media-grid-${era.id}`}
          >
            {isExpanded ? t('controls.collapse') : t('controls.expand')}
            <span className={styles.toggleIcon}>{isExpanded ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.expandedEraContent} id={`media-grid-${era.id}`}>
          <div className={styles.mediaFilters}>
            <div className={styles.filterGroup}>
              <label htmlFor={`typeFilter-${era.id}`}>{t('filters.type')}:</label>
              <select 
                id={`typeFilter-${era.id}`}
                value={filterOptions.type as string}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="All">{t('filters.allTypes')}</option>
                {mediaTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label htmlFor={`eraFilter-${era.id}`}>{t('filters.era')}:</label>
              <select 
                id={`eraFilter-${era.id}`}
                value={filterOptions.era as string}
                onChange={(e) => handleFilterChange('era', e.target.value)}
              >
                <option value="All">{t('filters.all')}</option>
                <option value="BBY">BBY</option>
                <option value="ABY">ABY</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label htmlFor={`uncertainFilter-${era.id}`}>{t('filters.date')}:</label>
              <select 
                id={`uncertainFilter-${era.id}`}
                value={filterOptions.uncertain as string}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'true') handleFilterChange('uncertain', true);
                  else if (value === 'false') handleFilterChange('uncertain', false);
                  else handleFilterChange('uncertain', 'All');
                }}
              >
                <option value="All">{t('filters.allDates')}</option>
                <option value="false">{t('filters.confirmed')}</option>
                <option value="true">{t('filters.estimated')}</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <input 
                type="text"
                placeholder={t('filters.search')}
                value={filterOptions.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.sortControls}>
              <span>{t('filters.sortBy')}:</span>
              <button 
                className={`${styles.sortButton} ${sortOptions.field === 'year' ? styles.active : ''}`}
                onClick={() => handleSortChange('year')}
              >
                {t('filters.year')} {sortOptions.field === 'year' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={`${styles.sortButton} ${sortOptions.field === 'title' ? styles.active : ''}`}
                onClick={() => handleSortChange('title')}
              >
                {t('filters.title')} {sortOptions.field === 'title' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={`${styles.sortButton} ${sortOptions.field === 'type' ? styles.active : ''}`}
                onClick={() => handleSortChange('type')}
              >
                {t('filters.type')} {sortOptions.field === 'type' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>

          <div className={styles.mediaGridContainer} ref={mediaGridRef}>
            <div className={styles.resultCount}>
              {t('filters.showing', { count: filteredMedia.length, total: era.media.length })}
            </div>
            
            <div className={styles.mediaGrid}>
              {filteredMedia.length > 0 ? (
                filteredMedia.map((media, index) => (
                  <MediaItem 
                    key={media.id} 
                    media={media} 
                    index={index}
                    delay={0.05}
                  />
                ))
              ) : (
                <div className={styles.noResults}>
                  {t('filters.noResults')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExpandedEraSection;
