// Admin/TimesheetManagement.jsx
import React, { useState, useEffect } from 'react';
import DailyTimesheetsTab from './DailyTimesheets';
import WeeklyStatusTab from './TimesheetsApproval';
import styles from '../../styles/adminOnly/ManageTS.module.css';

const TimesheetManagement = () => {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'status'
  const [weekOptions, setWeekOptions] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');

  useEffect(() => {
    const current = new Date();
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      const start = new Date(current);
      start.setDate(current.getDate() - current.getDay() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const label = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
      weeks.push({ label, start, end });
    }

    const reversed = weeks.reverse();
    setWeekOptions(reversed);
    setSelectedWeek(reversed[1]?.label); // Default to last week
  }, []);

  return (
    <div className={styles.timesheetManagementContainer}>
      <h2>🛠️ Timesheet Management </h2>

      {/* Tabs */}
      <div style={{ marginBottom: '50px' }}>
        <button
          onClick={() => setActiveTab('daily')}
          className={`${styles.tabButton} ${activeTab === 'daily' ? styles.active : ''}`}
        >
          📅 Daily Timesheets
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`${styles.tabButton} ${activeTab === 'status' ? styles.active : ''}`}
        >
          📦 Weekly Status
        </button>
      </div>

      {/* Week Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label>Select Week: </label>
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className={styles.weekSelector}
        >
          {weekOptions.map((w) => (
            <option key={w.label} value={w.label}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active Tab View */}
      {activeTab === 'daily' ? (
        <DailyTimesheetsTab selectedWeek={selectedWeek} />
      ) : (
        <WeeklyStatusTab selectedWeek={selectedWeek} />
      )}
    </div>
  );
};

export default TimesheetManagement;
