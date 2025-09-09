import React, { useEffect, useState } from 'react';
import styles from '../styles/ClockWidget.module.css';
import api from '../api/axios';

const ClockWidget = ({ userId, userName, submittedWeeks }) => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // update every minute

    const checkClockStatus = () => {
      const saved = sessionStorage.getItem('unsavedTimesheet');
      if (saved) {
        const times = JSON.parse(saved);
        const today = new Date().toDateString();
        if (times[today]?.start && !times[today]?.end) {
          setIsClockedIn(true);
        }
      }
    };

    checkClockStatus();
    updateGreeting();

    return () => clearInterval(interval);
  }, []);

  const updateGreeting = () => {
    const now = new Date();
    const hours = now.getHours();
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
    const isLate = hours >= 8;

    if (!isClockedIn) {
      if (isLate && isWeekday) {
        setGreeting(`Good morning, ${userName}! You're getting late to clock in.`);
      } else {
        setGreeting(`Good morning, ${userName}! Ready to clock in?`);
      }
    } else {
      setGreeting(`You're clocked in, ${userName}! Keep going strong 💪`);
    }
  };

  const handleClock = () => {
    const now = new Date();
    const todayStr = now.toDateString();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const payload = {
      userId,
      date: todayStr,
      start: !isClockedIn ? timeStr : null,
      end: isClockedIn ? timeStr : null,
      status: isClockedIn ? 'CLOCK_OUT' : 'CLOCK_IN',
    };

    api.post('/tsManage/clock', payload)
      .then(() => {
        const saved = sessionStorage.getItem('unsavedTimesheet');
        const updated = saved ? JSON.parse(saved) : {};
        const entry = updated[todayStr] || {};

        if (!isClockedIn) {
          entry.start = timeStr;
        } else {
          entry.end = timeStr;
        }

        updated[todayStr] = entry;
        sessionStorage.setItem('unsavedTimesheet', JSON.stringify(updated));
        setIsClockedIn(!isClockedIn);
        updateGreeting();
      })
      .catch(err => {
        console.error('Clock failed:', err);
        alert('Clock action failed.');
      });
  };

  // Check if last week's timesheet is submitted
  const getLastWeekLabel = () => {
    const now = new Date();
    const lastSunday = new Date(now);
    lastSunday.setDate(now.getDate() - now.getDay() - 7); // start of last week
    const lastSaturday = new Date(lastSunday);
    lastSaturday.setDate(lastSunday.getDate() + 6);
    return `${lastSunday.toLocaleDateString()} - ${lastSaturday.toLocaleDateString()}`;
  };

  const lastWeek = getLastWeekLabel();
  const timesheetReminder = !submittedWeeks.includes(lastWeek);

  return (
    <div className={styles.clockWidgetContainer}>
      <div className={styles.greetingBox}>
        {greeting}
        <button className={styles.clockBtn} onClick={handleClock}>
          {isClockedIn ? 'Clock Out' : 'Clock In'}
        </button>
      </div>

      {timesheetReminder && (
        <div className={styles.reminderBox}>
          ⏰ Forgot to submit last week's timesheet? Do it now!
        </div>
      )}
    </div>
  );
};

export default ClockWidget;
