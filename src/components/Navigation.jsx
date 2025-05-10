import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import styles from '../styles/Timeline.module.scss';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Draggable);

const Navigation = ({ timelineData }) => {
  const { t } = useTranslation();
  const trackRef = useRef(null);
  const navLinksRef = useRef([]);
  const stRef = useRef(null);
  const tlRef = useRef(null);
  const draggableInstanceRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const navLinks = navLinksRef.current;

    const lastItemWidth = () => navLinks[navLinks.length - 1].offsetWidth;

    const getUseableHeight = () => document.documentElement.offsetHeight - window.innerHeight;

    const getDraggableWidth = () => {
      return track.offsetWidth * 0.5 - lastItemWidth();
    };

    const updatePosition = () => {
      const left = track.getBoundingClientRect().left * -1;
      const width = getDraggableWidth();
      const useableHeight = getUseableHeight();
      const y = gsap.utils.mapRange(0, width, 0, useableHeight, left);

      stRef.current.scroll(y);
    };

    tlRef.current = gsap.timeline().to(track, {
      x: () => getDraggableWidth() * -1,
      ease: 'none',
    });

    stRef.current = ScrollTrigger.create({
      animation: tlRef.current,
      scrub: 0,
    });

    draggableInstanceRef.current = Draggable.create(track, {
      type: 'x',
      inertia: true,
      bounds: {
        minX: 0,
        maxX: getDraggableWidth() * -1,
      },
      edgeResistance: 1,
      onDragStart: () => stRef.current.disable(),
      onDragEnd: () => stRef.current.enable(),
      onDrag: updatePosition,
      onThrowUpdate: updatePosition,
    })[0];

    // Create ScrollTrigger for each section to add active class to nav links
    timelineData.forEach((item, index) => {
      const section = document.getElementById(item.id);

      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 20px',
          end: () => `bottom top`,
          toggleActions: 'play none play reverse',
          onToggle: ({ isActive }) => {
            const sectionLink = navLinks[index];

            if (isActive) {
              sectionLink.classList.add(styles.isActive);
            } else {
              sectionLink.classList.remove(styles.isActive);
            }
          },
        },
      });
    });

    // Allow navigation via keyboard
    track.addEventListener('keyup', e => {
      const id = e.target.getAttribute('href');
      if (!id || e.key !== 'Tab') return;

      const section = document.querySelector(id);
      const y = section.getBoundingClientRect().top + window.scrollY;

      stRef.current.scroll(y);
    });

    // Cleanup
    return () => {
      if (stRef.current) stRef.current.kill();
      if (draggableInstanceRef.current) draggableInstanceRef.current.kill();
    };
  }, [timelineData]);

  return (
    <nav className={styles.nav}>
      {/* Shows our position on the timeline */}
      <div className={styles.marker}></div>

      {/* Draggable element */}
      <div className={styles.navTrack} ref={trackRef}>
        <ul className={styles.navList}>
          {timelineData.map((item, index) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={styles.navLink}
                ref={el => (navLinksRef.current[index] = el)}
                data-link
              >
                <span>{t(`timeline.${item.id}.year`)}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
