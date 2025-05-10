import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { Era } from '../types';
import styles from '../styles/Timeline.module.scss';

interface EraSectionProps {
  era: Era;
  onViewMedia: (eraId: string) => void;
}

const EraSection: React.FC<EraSectionProps> = ({ era, onViewMedia }) => {
  const { t } = useTranslation();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return;

    const heading = headingRef.current;
    const imageElement = imageRef.current;
    const section = sectionRef.current;
    const button = buttonRef.current;

    if (!heading || !imageElement || !section || !button) return;

    // Set animation start state
    gsap.set(heading, {
      opacity: 0,
      y: 50,
    });
    gsap.set(imageElement, {
      opacity: 0,
      scale: 0.8,
    });
    gsap.set(button, {
      opacity: 0,
      y: 20,
    });

    // Create the timeline
    const sectionTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top center',
        end: `+=${window.innerHeight}`,
        toggleActions: 'play reverse play reverse',
      },
    });

    // Add tweens to the timeline
    sectionTl
      .to(imageElement, {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: 'back.out(1.7)',
      })
      .to(
        heading,
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
        },
        0.3
      )
      .to(
        button,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        0.6
      );

    return () => {
      // Cleanup
      sectionTl.kill();
    };
  }, []);

  const handleViewMedia = () => {
    onViewMedia(era.id);
  };

  // Format year range for display
  const yearRangeText = `${era.yearRange.start.toLocaleString()} – ${era.yearRange.end.toLocaleString()} ${era.yearRange.era}`;

  return (
    <section
      id={era.id}
      ref={sectionRef}
      className={`${styles.section} ${styles.eraSection}`}
      style={{
        '--i': era.index,
        backgroundColor: `hsl(${(era.index + 1) * 30} 75% 60%)`,
      }}
    >
      <div className={styles.container}>
        <h2 className={styles.sectionHeading} ref={headingRef}>
          <span>{yearRangeText}</span>
          <span>{t(`timeline.${era.id}.title`)}</span>
        </h2>
        <div
          className={styles.eraSectionImage}
          ref={imageRef}
          style={{
            '--h': `hsl(${(era.index + 1) * 30} 50% 50%)`,
          }}
        >
          <img src={era.image} width="1200" height="1200" alt={t(`timeline.${era.id}.title`)} />
        </div>
        <div className={styles.mediaCount}>
          <span>{era.media.length} items</span>
        </div>
        <button 
          ref={buttonRef}
          className={styles.viewMediaButton}
          onClick={handleViewMedia}
        >
          View Media
        </button>
      </div>
    </section>
  );
};

export default EraSection;
