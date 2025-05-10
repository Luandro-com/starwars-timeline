import { useState, useEffect } from 'react';
import Navigation from './Navigation';
import EraSection from './EraSection';
import MediaList from './MediaList';
import LanguageSwitcher from './LanguageSwitcher';
import fullTimelineData from '../data/full_timeline.json';
import timelineErasData from '../data/timeline_eras.json';
import { Era, TimelineData } from '../types';
import styles from '../styles/Timeline.module.scss';

const Timeline = () => {
  const [activeEra, setActiveEra] = useState<Era | null>(null);
  const [showMedia, setShowMedia] = useState<boolean>(false);
  const [timelineData, setTimelineData] = useState<TimelineData>(fullTimelineData);

  // Filter out eras with negative indices (pre-republic) and indices > 8 (legacy era)
  // to match the timeline_eras.json structure
  useEffect(() => {
    const filteredEras = fullTimelineData.eras.filter(era => era.index >= 0 && era.index <= 8);
    setTimelineData({ eras: filteredEras });
  }, []);

  const handleViewMedia = (eraId: string) => {
    const era = timelineData.eras.find(e => e.id === eraId);
    if (era) {
      setActiveEra(era);
      setShowMedia(true);
      // Scroll to top when viewing media
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToEras = () => {
    setShowMedia(false);
    setActiveEra(null);
  };

  return (
    <div className={styles.timelineApp}>
      <LanguageSwitcher />
      {!showMedia && (
        <>
          <Navigation timelineData={timelineErasData.items} />
          <main>
            {timelineData.eras.map(era => (
              <EraSection
                key={era.id}
                era={era}
                onViewMedia={handleViewMedia}
              />
            ))}
          </main>
        </>
      )}

      {showMedia && activeEra && (
        <div className={styles.mediaView}>
          <MediaList era={activeEra} onBack={handleBackToEras} />
        </div>
      )}
    </div>
  );
};

export default Timeline;
