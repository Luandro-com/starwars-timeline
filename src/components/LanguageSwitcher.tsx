import { useTranslation } from 'react-i18next';
import styles from '../styles/Timeline.module.scss';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string): void => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={styles.languageSwitcher}>
      <button
        onClick={() => changeLanguage('en')}
        className={`${styles.langButton} ${i18n.language === 'en' ? styles.active : ''}`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('es')}
        className={`${styles.langButton} ${i18n.language === 'es' ? styles.active : ''}`}
      >
        ES
      </button>
      <button
        onClick={() => changeLanguage('fr')}
        className={`${styles.langButton} ${i18n.language === 'fr' ? styles.active : ''}`}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
