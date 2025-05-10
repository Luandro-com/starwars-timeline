import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '100px',
        right: '10px',
        zIndex: 3000,
        display: 'flex',
        gap: '10px',
      }}
    >
      <button
        onClick={() => changeLanguage('en')}
        style={{
          background: i18n.language === 'en' ? 'var(--activeColor)' : 'transparent',
          color: i18n.language === 'en' ? 'var(--navBgColor)' : 'var(--activeColor)',
          border: '1px solid var(--activeColor)',
          padding: '5px 10px',
          cursor: 'pointer',
          borderRadius: '4px',
        }}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('es')}
        style={{
          background: i18n.language === 'es' ? 'var(--activeColor)' : 'transparent',
          color: i18n.language === 'es' ? 'var(--navBgColor)' : 'var(--activeColor)',
          border: '1px solid var(--activeColor)',
          padding: '5px 10px',
          cursor: 'pointer',
          borderRadius: '4px',
        }}
      >
        ES
      </button>
    </div>
  );
};

export default LanguageSwitcher;
