import { useEffect } from 'react';
import Timeline from './components/Timeline';
import './i18n/i18n';
import './App.css';

function App() {
  useEffect(() => {
    // Add Syncopate font
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Syncopate:wght@400;700&display=swap';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return <Timeline />;
}

export default App;
