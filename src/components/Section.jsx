import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import styles from '../styles/Timeline.module.scss';

const Section = ({ id, image, index }) => {
  const { t } = useTranslation();
  const headingRef = useRef(null);
  const imageRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return;

    const heading = headingRef.current;
    const imageElement = imageRef.current;
    const section = sectionRef.current;

    // Set animation start state
    gsap.set(heading, {
      opacity: 0,
      y: 50,
    });
    gsap.set(imageElement, {
      opacity: 0,
      rotateY: 15,
    });

    // Create the timeline
    const sectionTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: () => 'top center',
        end: () => `+=${window.innerHeight}`,
        toggleActions: 'play reverse play reverse',
      },
    });

    // Add tweens to the timeline
    sectionTl
      .to(imageElement, {
        opacity: 1,
        rotateY: -5,
        duration: 6,
        ease: 'elastic',
      })
      .to(
        heading,
        {
          opacity: 1,
          y: 0,
          duration: 2,
        },
        0.5
      );

    return () => {
      // Cleanup
      sectionTl.kill();
    };
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={styles.section}
      style={{
        '--i': index,
        backgroundColor: `hsl(${index * 30} 75% 60%)`,
      }}
    >
      <div className={styles.container}>
        <h2 className={styles.sectionHeading} ref={headingRef}>
          <span>{t(`timeline.${id}.year`)}</span>
          <span>{t(`timeline.${id}.title`)}</span>
        </h2>
        <div
          className={styles.sectionImage}
          ref={imageRef}
          style={{
            '--h': `hsl(${index * 30} 50% 50%)`,
          }}
        >
          <img src={image} width="1200" height="1200" alt={t(`timeline.${id}.title`)} />
        </div>
      </div>
    </section>
  );
};

export default Section;
