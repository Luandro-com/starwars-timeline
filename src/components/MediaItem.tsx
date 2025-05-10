import { useRef, useEffect } from 'react';
import { Media } from '../types';
import gsap from 'gsap';
import styles from '../styles/Timeline.module.scss';

interface MediaItemProps {
  media: Media;
  index: number;
  delay: number;
}

const MediaItem: React.FC<MediaItemProps> = ({ media, index, delay }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  
  // Get media type icon based on the media type
  const getMediaTypeIcon = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'film':
        return '🎬';
      case 'tv series':
        return '📺';
      case 'novel':
      case 'young adult novel':
      case 'junior novel':
        return '📚';
      case 'comic':
        return '💬';
      case 'video game':
        return '🎮';
      case 'vr experience':
        return '🥽';
      case 'audio drama':
        return '🎧';
      case 'short story':
        return '📝';
      default:
        return '📌';
    }
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return;

    const item = itemRef.current;
    if (!item) return;

    // Set initial state
    gsap.set(item, {
      opacity: 0,
      y: 30,
      scale: 0.95
    });

    // Create animation
    gsap.to(item, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      delay: delay + (index * 0.05),
      ease: 'power2.out'
    });

    // Add hover animation
    const hoverTl = gsap.timeline({ paused: true });
    hoverTl.to(item, {
      scale: 1.03,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
      duration: 0.3,
      ease: 'power2.out'
    });

    // Add event listeners for hover
    item.addEventListener('mouseenter', () => hoverTl.play());
    item.addEventListener('mouseleave', () => hoverTl.reverse());

    return () => {
      item.removeEventListener('mouseenter', () => hoverTl.play());
      item.removeEventListener('mouseleave', () => hoverTl.reverse());
      hoverTl.kill();
    };
  }, [index, delay]);

  // Format the year for display
  const formatYear = (media: Media): string => {
    if (media.year) {
      return media.year;
    } else if (media.parsedYear) {
      return `${media.parsedYear.value} ${media.parsedYear.era}${media.parsedYear.uncertain ? ' (estimated)' : ''}`;
    }
    return 'Unknown date';
  };

  const handleClick = () => {
    if (media.link) {
      window.open(media.link, '_blank');
    }
  };

  return (
    <div 
      ref={itemRef}
      className={`${styles.mediaItem} ${media.parsedYear.uncertain ? styles.uncertainDate : ''}`}
      onClick={handleClick}
      style={{
        '--hue': (index % 12) * 30
      }}
    >
      <div className={styles.mediaTypeIcon}>
        {getMediaTypeIcon(media.type)}
      </div>
      <div className={styles.mediaContent}>
        <h3 className={styles.mediaTitle}>{media.title}</h3>
        <div className={styles.mediaDetails}>
          <span className={styles.mediaYear}>{formatYear(media)}</span>
          <span className={styles.mediaType}>{media.type}</span>
          {media.releaseDate && (
            <span className={styles.mediaReleaseDate}>Released: {media.releaseDate}</span>
          )}
        </div>
      </div>
      {media.link && (
        <div className={styles.mediaLink}>
          <span className={styles.linkIcon}>↗</span>
        </div>
      )}
    </div>
  );
};

export default MediaItem;
