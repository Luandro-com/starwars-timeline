import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Navigation from './Navigation';
import EraSection from './EraSection';
import ExpandedEraSection from './ExpandedEraSection';
import MediaList from './MediaList';
import LanguageSwitcher from './LanguageSwitcher';
import ViewControls, { ViewMode } from './ViewControls';
import fullTimelineData from '../data/full_timeline.json';
import { Era, TimelineData } from '../types';
import styles from '../styles/Timeline.module.scss';

const Timeline = () => {
  const { t } = useTranslation();
  const [activeEra, setActiveEra] = useState<Era | null>(null);
  const [showDetailedMedia, setShowDetailedMedia] = useState<boolean>(false);
  const [timelineData, setTimelineData] = useState<TimelineData>(fullTimelineData);
  const [viewMode, setViewMode] = useState<ViewMode>('eras-only');
  const mainRef = useRef<HTMLElement>(null);

  // Filter out eras with negative indices (pre-republic) and indices > 8 (legacy era)
  // to match the timeline_eras.json structure
  useEffect(() => {
    const filteredEras = fullTimelineData.eras;
    setTimelineData({ eras: filteredEras });
  }, []);

  const handleViewMedia = (eraId: string) => {
    const era = timelineData.eras.find(e => e.id === eraId);
    if (era) {
      setActiveEra(era);
      setShowDetailedMedia(true);
      // Scroll to top when viewing media
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToEras = () => {
    setShowDetailedMedia(false);
    setActiveEra(null);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);

    // If changing to eras-only mode, close detailed media view
    if (mode === 'eras-only' && showDetailedMedia) {
      handleBackToEras();
    }

    // Scroll to top when changing view mode
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`${styles.timelineApp} ${styles[`viewMode-${viewMode}`]}`}>
      <LanguageSwitcher />
      <ViewControls viewMode={viewMode} onViewModeChange={handleViewModeChange} />

      {!showDetailedMedia && (
        <>
          <Navigation timelineData={fullTimelineData.eras} />
          <main ref={mainRef}>
            {viewMode === 'eras-only' && (
              timelineData.eras.map(era => (
                <EraSection
                  key={era.id}
                  era={era}
                  onViewMedia={handleViewMedia}
                />
              ))
            )}

            {viewMode === 'expanded' && (
              timelineData.eras.map(era => (
                <ExpandedEraSection
                  key={era.id}
                  era={era}
                  isActive={activeEra?.id === era.id}
                />
              ))
            )}

            {viewMode === 'compact' && (
              <div className={styles.compactView}>
                {timelineData.eras.map(era => (
                  <div key={era.id} className={styles.compactEraSection}>
                    <div className={styles.compactEraHeader} id={era.id}>
                      <img
                        src={era.image}
                        alt={t(`timeline.${era.id}.title`)}
                        className={styles.compactEraIcon}
                      />
                      <h2 className={styles.compactEraTitle}>
                        {t(`timeline.${era.id}.title`)}
                        <span className={styles.compactEraYear}>
                          {era.yearRange.start.toLocaleString()} – {era.yearRange.end.toLocaleString()} {era.yearRange.era}
                        </span>
                      </h2>
                      <button
                        className={styles.viewMediaButton}
                        onClick={() => handleViewMedia(era.id)}
                      >
                        {t('controls.viewMedia')} ({era.media.length})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {showDetailedMedia && activeEra && (
        <div className={styles.mediaView}>
          <MediaList era={activeEra} onBack={handleBackToEras} />
        </div>
      )}
    </div>
  );
};

export default Timeline;
