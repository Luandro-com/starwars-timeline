
import Navigation from './Navigation';
import Section from './Section';
import LanguageSwitcher from './LanguageSwitcher';
import timelineData from '../data/timeline.json';

const Timeline = () => {
  return (
    <>
      <LanguageSwitcher />
      <Navigation timelineData={timelineData.items} />
      <main>
        {timelineData.items.map(item => (
          <Section
            key={item.id}
            id={item.id}
            year={item.year}
            title={item.title}
            image={item.image}
            index={item.index}
          />
        ))}
      </main>
    </>
  );
};

export default Timeline;
