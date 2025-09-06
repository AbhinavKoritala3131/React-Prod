import React, { useEffect, useState } from 'react';
import 'react-clock/dist/Clock.css';
import '../styles/Timesheets.css';
import api from '../api/axios'; 


const Timesheets = () => {
  const [selectedWeek, setSelectedWeek] = useState('');
  const [weekOptions, setWeekOptions] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [times, setTimes] = useState({});
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [submittedWeeks, setSubmittedWeeks] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  

  const today = new Date();
  const todayStr = today.toDateString();
  const isFriday = today.getDay() === 5;

  // 1. Generate past 2 weeks
  useEffect(() => {
    const weeks = [];
    const current = new Date();

    for (let i = 0; i < 2; i++) {
      const start = new Date(current);
      start.setDate(current.getDate() - current.getDay() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const label = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
      weeks.push({ label, start, end });
    }

    setWeekOptions(weeks.reverse());
    const defaultWeek = weeks[1];
    setSelectedWeek(defaultWeek.label);
    setWeekDays(generateWeekDays(defaultWeek.start));
  }, []);

  // 2. Update week days on week change
  useEffect(() => {
    const selected = weekOptions.find((w) => w.label === selectedWeek);
    if (selected) {
      setWeekDays(generateWeekDays(selected.start));
    }
  }, [selectedWeek]);

  // 3. Mock projects
  useEffect(() => {
    const mockProjects = ['Project Alpha', 'Project Beta', 'Project Gamma'];
    setProjects(mockProjects);
    setSelectedProject(mockProjects[0]);
  }, []);

  const generateWeekDays = (start) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        label: d.toLocaleDateString('default', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        fullDate: d.toDateString(),
      });
    }
    return days;
  };
  const canFillWeek = (selectedWeekLabel, dateStrToFill = null) => {
  const selectedWeekIndex = weekOptions.findIndex(w => w.label === selectedWeekLabel);
  if (selectedWeekIndex === -1) return false;

  // Check if the previous week is submitted
  if (selectedWeekIndex > 0) {
    const prevWeek = weekOptions[selectedWeekIndex - 1];
    if (!submittedWeeks.includes(prevWeek.label)) {
      alert("Please submit last week's timesheet first.");
      return false;
    }
  }

  // Weekday sequence enforcement (only if dateStrToFill is provided)
  if (dateStrToFill) {
    const selectedWeek = weekOptions[selectedWeekIndex];
    const days = generateWeekDays(selectedWeek.start);
    const weekdays = days.filter(day => {
      const dayNum = new Date(day.fullDate).getDay();
      return dayNum >= 1 && dayNum <= 5;
    });

    const targetIndex = weekdays.findIndex(day => day.fullDate === dateStrToFill);
    if (targetIndex > 0) {
      for (let i = 0; i < targetIndex; i++) {
        const prevDay = weekdays[i];
        const entry = times[prevDay.fullDate];
        if (!entry || !entry.start || !entry.end) {
          alert("Please fill all previous weekdays before continuing.");
          return false;
        }
      }
    }
  }

  return true;
};




const handleClock = (dateStr) => {
  if (!canFillWeek(selectedWeek, dateStr)) return;

  const now = new Date().toTimeString().slice(0, 5);

  setTimes((prev) => {
    const entry = prev[dateStr] || {};
    const updated = { ...entry };

    if (!entry.start) {
      updated.start = now;

      // Save only start
      const payload = {
        userId,
        date: new Date(dateStr).toISOString().slice(0, 10),
        start: now,
        week: selectedWeek,
        project: selectedProject,
      };

      api.post('http://localhost:8081/tsManage/submit', payload)
        .then(() => console.log("Clock-in saved"))
        .catch(err => console.error("Error saving clock-in:", err));
    } else if (!entry.end) {
      updated.end = now;
      updated.total = calculateDailyHours(entry.start, now);

      // Save end + total
      const payload = {
         userId,
        date: new Date(dateStr).toISOString().slice(0, 10),
        start: entry.start,
        end: now,
        total: updated.total,
        week: selectedWeek,
        project: selectedProject,
      };

      api.post('http://localhost:8081/tsManage/submit', payload)
        .then(() => console.log("Clock-out saved"))
        .catch(err => console.error("Error saving clock-out:", err));
    }

    return { ...prev, [dateStr]: updated };
  });
};






  const calculateDailyHours = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const diff = endMin - startMin;
    return (diff / 60).toFixed(2);
  };
const userId = Number(localStorage.getItem('userId'));

const handleManualChange = (dateStr, field, value) => {
  if (!canFillWeek(selectedWeek, dateStr)) return;

  setTimes((prev) => {
    const existing = prev[dateStr] || {};
    const updated = { ...existing, [field]: value };

    if (updated.start && updated.end) {
      updated.total = calculateDailyHours(updated.start, updated.end);

      const payload = {
        userId,
        date: new Date(dateStr).toISOString().slice(0, 10),
        start: updated.start,
        end: updated.end,
        total: updated.total,
        week: selectedWeek,
        project: selectedProject,
      };

      api.post('http://localhost:8081/tsManage/submit', payload)
        .then(() => console.log('Manual time saved'))
        .catch((err) => console.error('Error saving entry:', err));
    }

    return { ...prev, [dateStr]: updated };
  });
};






  const handleSendForApproval = async () => {
  const selected = weekOptions.find(w => w.label === selectedWeek);
  const weekDaysToSend = generateWeekDays(selected.start);

  const dataToSend = weekDaysToSend.map(day => ({
    userId, 
    date: day.fullDate,
    ...times[day.fullDate],
    project: selectedProject,
    week: selectedWeek,
  }));

  try {
    await api.post('tsManage/submit', {
      week: selectedWeek,
      entries: dataToSend,
    });

    setShowSuccess(true);
    setSubmittedWeeks(prev => [...prev, selectedWeek]);

    setTimeout(() => {
      setShowSuccess(false);
      const currentWeek = weekOptions.find((w) =>
        new Date() >= w.start && new Date() <= w.end
      );
      if (currentWeek) {
        setSelectedWeek(currentWeek.label);
      }
    }, 3000);
  } catch (err) {
    alert('Failed to submit timesheet');
    console.error(err);
  }
};


  const totalWeekHours = Object.values(times).reduce(
    (sum, entry) => sum + (parseFloat(entry.total) || 0),
    0
  );
  const isSendEnabled = () => {
  const selected = weekOptions.find((w) => w.label === selectedWeek);
  if (!selected) return false;

  const today = new Date();
  const isCurrentWeek = today >= selected.start && today <= selected.end;

  const isSubmitted = submittedWeeks.includes(selectedWeek);

  if (isSubmitted) return false;

  if (!isCurrentWeek) {
    // Past week, allow anytime if not submitted
    return true;
  }

  // Current week — allow only if it's Friday or later
  return today.getDay() >= 5;
};
const allWeeksSubmitted = weekOptions.every(week =>
  submittedWeeks.includes(week.label)
);


  return (
    <div className="timesheet-container">
      <h2>🕒 Weekly Timesheet</h2>

      <div className="week-selector">
        <label>Select Week:</label>
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
        >
          {weekOptions.map((week) => {
  const isSubmitted = submittedWeeks.includes(week.label);
  return (
    <option
      key={week.label}
      value={week.label}
      disabled={isSubmitted}
      title={isSubmitted ? 'Already submitted, contact your admin to edit' : ''}
    >
      {week.label} {isSubmitted && '✅ Submitted'}
    </option>
  );
})}

        </select>
        <span className="month-display">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
      </div>

   




 {allWeeksSubmitted ? (
  <div style={{ textAlign: 'center', margin: '40px 0', fontSize: '1.2rem', color: 'green' }}>
    🎉 You're all caught up for this week!
  </div>
) : (
  <>
    <div className="project-dropdown">
      <label>Select Project:</label>
      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
      >
        {projects.map((proj) => (
          <option key={proj} value={proj}>
            {proj}
          </option>
        ))}
      </select>
    </div>

    <div className="timesheet-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            <th>Clock</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {weekDays
  
  .map((day) => {
    const entry = times[day.fullDate] || {};
    const isToday = day.fullDate === todayStr;
    const dateObj = new Date(day.fullDate);
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;


            return (
              <tr
                key={day.fullDate}
                style={
                  isToday
                    ? { boxShadow: '0 0 10px yellow', backgroundColor: '#fffbe6' }
                    : {}
                }
              >
                <td>{day.label}</td>
                <td>
                  <input disabled={isWeekend} 
                    type="time"
                    value={entry.start || ''}
                    onChange={(e) =>
                      handleManualChange(day.fullDate, 'start', e.target.value)
                    }
                  />
                </td>
                <td>
                  <input disabled={isWeekend} 
                    type="time"
                    value={entry.end || ''}
                    onChange={(e) =>
                      handleManualChange(day.fullDate, 'end', e.target.value)
                    }
                  />
                </td>
                <td>
                  {isToday && (
                    <button disabled={isWeekend}  className={`clock-btn ${!entry.start ? 'clock-in' : !entry.end ? 'clock-out' : 'done'}`}
                     onClick={() => handleClock(day.fullDate)}>
                      {!entry.start
                        ? 'Clock In'
                        : !entry.end
                        ? 'Clock Out'
                        : 'Done'}
                    </button>
                  )}
                </td>
                <td>{entry.total || '0.00'} hrs</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
     {!submittedWeeks.includes(selectedWeek) && !allWeeksSubmitted && (
  <div style={{ textAlign: 'center', marginTop: '30px' }}>
    <button
      className="submit-btn rocket-btn"
      onClick={handleSendForApproval}
      disabled={!isSendEnabled()}
      title={
        isSendEnabled()
          ? 'Submit this timesheet for approval'
          : 'For current week, available only after Friday'
      }
    >
      🚀 Send for Approval
    </button>
  </div>
)}

    <div className="total-time">
      Total Time This Week: <strong>{totalWeekHours.toFixed(2)} hrs</strong>
    </div>
  </>
)}


      

      {showSuccess && (
        <div className="success-toast">
          ✅ Timesheet submitted successfully!
        </div>
      )}
    </div>
  );
};

export default Timesheets;
