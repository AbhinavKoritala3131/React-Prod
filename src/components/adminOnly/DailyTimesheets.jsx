// Admin/DailyTimesheetsTab.jsx
import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { TimePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import styles from '../../styles/adminOnly/ManageTS.module.css';


const DailyTimesheetsTab = ({ selectedWeek }) => {
  const [entries, setEntries] = useState([]);
  const [edited, setEdited] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        const res = await api.get('/admins/timesheets-by-week', {
          params: { week: selectedWeek },
        });
        setEntries(res.data || []);
        setEdited({});
      } catch (err) {
        console.error('Failed to fetch timesheets:', err);
      }
    };

    if (selectedWeek) fetchTimesheets();
  }, [selectedWeek]);

  const buildKey = (empId, date) => `${empId}_${date}`;

  const handleChange = (empId, date, field, value) => {
    const key = buildKey(empId, date);

    setEntries((prev) =>
      prev.map((e) =>
        e.empId === empId && e.date === date ? { ...e, [field]: value } : e
      )
    );

    setEdited((prev) => ({
      ...prev,
      [key]: { ...prev[key], empId, date, [field]: value },
    }));
  };
const parseTime = (str) => {
  if (!str) return null;
  const [h, m, s] = str.split(':').map(Number);
  return new Date(1970, 0, 1, h, m, s);
};

const getMinutesDiff = (startStr, endStr) => {
  const start = parseTime(startStr);
  const end = parseTime(endStr);
  if (!start || !end || end <= start) return 0;
  return Math.floor((end - start) / (1000 * 60)); // minutes diff
};

const minutesToHourMinuteString = (minutes) => {
  if (!minutes || isNaN(minutes)) return '0.00';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}.${m.toString().padStart(2, '0')}`;
};


  const formatTime = (date) => {
    if (!date) return '';
    return date.toTimeString().slice(0, 8); // "HH:MM:SS"
  };

  const calculateHours = (startStr, endStr) => {
    const start = parseTime(startStr);
    const end = parseTime(endStr);
    if (!start || !end || end <= start) return '0.00';
    const diff = (end - start) / (1000 * 60 * 60);
    return diff.toFixed(2);
  };

  const handleSave = async () => {
    const updates = Object.entries(edited).map(([key, changes]) => {
      const { empId, date } = changes;
      const entry = entries.find(e => e.empId === empId && e.date === date);
      if (!entry) return null;

      const start = changes.start ?? entry.start;
      const end = changes.end_time ?? entry.end_time;
      const project = changes.project ?? entry.project;
      const total = parseFloat(calculateHours(start, end));
      const totalMinutes = getMinutesDiff(start, end);


      return {
        empId,
        date,
        start,
        end_time: end,
        project,
  total: totalMinutes, // save as integer minutes
        week: entry.week || selectedWeek  // ensure week is included

      };
    }).filter(Boolean); // remove nulls

    if (updates.length === 0) return;
          console.log("Sending updates to backend:", updates); // <-- Add this line to log


    try {
      setIsSaving(true);
      await api.put('/admins/update-multiple', updates);
      alert('✅ All changes saved successfully!');
      setEdited({});
    } catch (err) {
      console.error('❌ Failed to save:', err);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h3 className={styles.heading}>📅 Daily Timesheets for: <em>{selectedWeek}</em></h3>

      <table className={styles.table}>
        <thead>
          <tr >
            <th>User ID</th>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            <th>Project</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr><td colSpan="6">No timesheets found.</td></tr>
          ) : entries.map((entry) => (
            <tr key={`${entry.empId}_${entry.date}`}>
              <td>{entry.empId}</td>
              <td>{entry.date}</td>
              <td>
                <TimePicker
                  format="HH:mm"
                  value={parseTime(entry.start)}
                  onChange={(val) =>
                    handleChange(entry.empId, entry.date, 'start', formatTime(val))
                  }
                />
              </td>
              <td>
                <TimePicker
                  format="HH:mm"
                  value={parseTime(entry.end_time)}
                  onChange={(val) =>
                    handleChange(entry.empId, entry.date, 'end_time', formatTime(val))
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  className={styles.inputText}
                  value={entry.project}
                  onChange={(e) =>
                    handleChange(entry.empId, entry.date, 'project', e.target.value)
                  }
                />
              </td>
             
<td>
  {(() => {
    // Use edited values if present, else original
    const key = buildKey(entry.empId, entry.date);
    const editedEntry = edited[key];
    const start = editedEntry?.start ?? entry.start;
    const end = editedEntry?.end_time ?? entry.end_time;

    const totalMinutes = getMinutesDiff(start, end);

    return minutesToHourMinuteString(totalMinutes);
  })()} hrs
</td>

            
            </tr>
          ))}
        </tbody>
      </table>

      {Object.keys(edited).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={styles.saveBtn}
          >
            💾 Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyTimesheetsTab;
