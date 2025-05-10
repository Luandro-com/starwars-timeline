import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { TimelineEra } from '../types';
// @ts-ignore - Import CSS module
import styles from '../styles/Timeline.module.scss';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Draggable, ScrollToPlugin);

interface NavigationProps {
  timelineData: TimelineEra[];
}

const Navigation: React.FC<NavigationProps> = ({ timelineData }) => {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLAnchorElement[]>([]);
  const stRef = useRef<ScrollTrigger | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const draggableInstanceRef = useRef<Draggable | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const navLinks = navLinksRef.current;

    const lastItemWidth = () => navLinks[navLinks.length - 1].offsetWidth;

    const getUseableHeight = () => document.documentElement.offsetHeight - window.innerHeight;

    const getDraggableWidth = () => {
      if (!track) return 0;
      return track.offsetWidth * 0.5 - lastItemWidth();
    };

    const updatePosition = () => {
      if (!track || !stRef.current) return;
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
      onDragStart: () => stRef.current?.disable(),
      onDragEnd: () => stRef.current?.enable(),
      onDrag: updatePosition,
      onThrowUpdate: updatePosition,
    })[0];

    // Create ScrollTrigger for each section to add active class to nav links
    timelineData.forEach((item, index) => {
      const section = document.getElementById(item.id);
      if (!section) return;

      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 20px',
          end: () => `bottom top`,
          toggleActions: 'play none play reverse',
          onToggle: ({ isActive }) => {
            const sectionLink = navLinks[index];
            if (!sectionLink) return;

            if (isActive) {
              sectionLink.classList.add(styles.isActive);

              // Update marker position to match the active era's position
              const marker = document.querySelector(`.${styles.marker}`);
              if (marker && sectionLink) {
                const linkRect = sectionLink.getBoundingClientRect();
                const navRect = document.querySelector(`.${styles.nav}`)?.getBoundingClientRect();
                if (navRect) {
                  const leftPos = linkRect.left - navRect.left + linkRect.width / 2;

                  // Create a more elaborate animation for the marker
                  gsap.timeline()
                    .to(marker, {
                      scale: 1.3,
                      duration: 0.2,
                      ease: 'power1.out'
                    })
                    .to(marker, {
                      left: `${leftPos}px`,
                      duration: 0.5,
                      ease: 'elastic.out(1, 0.5)'
                    }, "-=0.1")
                    .to(marker, {
                      scale: 1,
                      duration: 0.3,
                      ease: 'power2.out'
                    }, "-=0.2");
                }
              }
            } else {
              sectionLink.classList.remove(styles.isActive);
            }
          },
        },
      });
    });

    // Allow navigation via keyboard
    if (track) {
      track.addEventListener('keyup', (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        const id = target?.getAttribute('href');
        if (!id || e.key !== 'Tab') return;

        const section = document.querySelector(id);
        if (!section || !stRef.current) return;

        const y = section.getBoundingClientRect().top + window.scrollY;
        stRef.current.scroll(y);
      });
    }

    // Cleanup
    return () => {
      if (stRef.current) stRef.current.kill();
      if (draggableInstanceRef.current) draggableInstanceRef.current.kill();
    };
  }, [timelineData]);

  // Function to handle ref assignment safely
  const setNavLinkRef = (index: number) => (el: HTMLAnchorElement | null) => {
    if (el) {
      navLinksRef.current[index] = el;

      // Add click event listener for smooth scrolling
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = el.getAttribute('href');
        if (!targetId) return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        // Scroll to the target element with a smooth animation
        gsap.to(window, {
          duration: 1,
          scrollTo: {
            y: targetElement,
            offsetY: 20
          },
          ease: 'power3.inOut'
        });
      });
    }
  };

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
                ref={setNavLinkRef(index)}
                data-link
                style={{
                  // @ts-ignore - CSS custom property
                  '--era-icon-url': `url(${item.image})`,
                }}
              >
                <span>{item.yearRange.start} {item.yearRange.era}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
