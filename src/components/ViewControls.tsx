import { useTranslation } from 'react-i18next';
import styles from '../styles/Timeline.module.scss';

export type ViewMode = 'expanded' | 'compact' | 'eras-only';

interface ViewControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({ viewMode, onViewModeChange }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.viewControls}>
      <div className={styles.viewControlsInner}>
        <span className={styles.viewControlsLabel}>{t('controls.view')}:</span>
        {/* <button
          className={`${styles.viewControlButton} ${viewMode === 'expanded' ? styles.active : ''}`}
          onClick={() => onViewModeChange('expanded')}
          aria-label={t('controls.expanded')}
          title={t('controls.expanded')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          <span>{t('controls.expanded')}</span>
        </button> */}
        <button
          className={`${styles.viewControlButton} ${viewMode === 'compact' ? styles.active : ''}`}
          onClick={() => onViewModeChange('compact')}
          aria-label={t('controls.compact')}
          title={t('controls.compact')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <span>{t('controls.compact')}</span>
        </button>
        <button
          className={`${styles.viewControlButton} ${viewMode === 'eras-only' ? styles.active : ''}`}
          onClick={() => onViewModeChange('eras-only')}
          aria-label={t('controls.erasOnly')}
          title={t('controls.erasOnly')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
          </svg>
          <span>{t('controls.erasOnly')}</span>
        </button>
      </div>
    </div>
  );
};

export default ViewControls;
