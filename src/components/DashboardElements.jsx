// src/components/GlowingCards.jsx
import React, { useEffect, useRef } from 'react';
import styles from '../styles/DashElements.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faUser, faFile, faLink } from '@fortawesome/free-solid-svg-icons';

const cards = [
  {
    icon: faCalendarDays,
    title: 'Timesheets',
    description: 'Last Submitted',
    value: '9/20/25',
    linkText: 'Submit Timesheets',
    linkTo: '#',
  },
  {
    icon: faUser,
    title: 'Profile',
    description: 'Keep Info Upto-date',
    value: '',
    linkText: 'Manage Profile',
    linkTo: '#',
  },
  {
    icon: faFile,
    title: 'Projects',
    description: 'New Deadline:',
    value: '10/12/25',
    linkText: 'Go to Projects',
    linkTo: '#',
  },
];

export default function GlowingCards() {
  const containerRef = useRef(null);

  useEffect(() => {
    const cardEls = Array.from(containerRef.current.querySelectorAll(`.${styles.card}`));

    const handleMouseMove = (e) => {
      for (const card of cardEls) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={styles.cards} ref={containerRef}>
      {cards.map((card, i) => (
        <div className={styles.card} key={i}>
          <div className={styles.cardContent}>
            <FontAwesomeIcon icon={card.icon} />
            <h2>{card.title}</h2>
            <p>
              {card.description} {card.value && <span>{card.value}</span>}
            </p>
            <a href={card.linkTo}>
              <FontAwesomeIcon icon={faLink} />
              <span>{card.linkText}</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
