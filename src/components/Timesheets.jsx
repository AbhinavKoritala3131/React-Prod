

import React, { useEffect, useState } from 'react';
import { TimePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import 'react-clock/dist/Clock.css';
import styles from '../styles/Timesheets.module.css';
import api from '../api/axios'; 


const Timesheets = ({ userId }) => {
  const [selectedWeek, setSelectedWeek] = useState('');
  const [weekOptions, setWeekOptions] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [times, setTimes] = useState({});
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [submittedWeeks, setSubmittedWeeks] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [weekStatuses, setWeekStatuses] = useState({
    
  currentWeek: null,
  previousWeek: null,
});
const [weekType, setWeekType] = useState('');

  
const isWeekSubmitted = submittedWeeks.includes(selectedWeek);
// Then disable inputs and buttons accordingly

  const today = new Date();
  const todayStr = today.toDateString();
  const saveTimesToSessionStorage = (times) => {
  sessionStorage.setItem('unsavedTimesheet', JSON.stringify(times));
};

const loadTimesFromSessionStorage = () => {
  const saved = sessionStorage.getItem('unsavedTimesheet');
  return saved ? JSON.parse(saved) : {};
};




  // 1. Generate past 2 weeks
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

    const reversedWeeks = weeks.reverse();
setWeekOptions(reversedWeeks);

const savedWeek = sessionStorage.getItem('selectedWeek');
const defaultWeek = reversedWeeks.find(w => w.label === savedWeek) || reversedWeeks[1];

setSelectedWeek(defaultWeek.label);
setWeekDays(generateWeekDays(defaultWeek.start));

  }, []);
  const fetchWeekStatuses = async (weeks, userId) => {
  // console.log('fetchWeekStatuses called with:', weeks, userId);
  try {
    const res = await api.post('/tsManage/status-check', {
      empId: userId,
      weeks,
    });
    // console.log('API response:', res.data);

    const { previous: prevStatus, current: currStatus } = res.data;

    setWeekStatuses({
      previousWeek: prevStatus || null,
      currentWeek: currStatus || null,
    });

    const submitted = [];
     if (prevStatus !== "NOT_SUBMITTED") submitted.push(weeks[0]);
    if (currStatus !== "NOT_SUBMITTED") submitted.push(weeks[1]);

    // console.log('Setting submitted weeks:', submitted);
    setSubmittedWeeks(submitted);
  } catch (err) {
    console.error('Error fetching week statuses:', err);
  }
};


 useEffect(() => {
  

    if (weekOptions.length === 2 && userId) {
    const previous = weekOptions[0].label;
    const current = weekOptions[1].label;
    fetchWeekStatuses([previous, current], userId);
  }

}, [selectedWeek,  userId]); // ✅ Add selectedWeek and weekOptions.length
useEffect(() => {
  // console.log('submittedWeeks:', submittedWeeks);
  // console.log('weekOptions:', weekOptions);
  // console.log('selectedWeek:', selectedWeek);
}, [submittedWeeks, weekOptions, selectedWeek]);

  useEffect(() => {
  if (selectedWeek) {
    sessionStorage.setItem('selectedWeek', selectedWeek);
  }
}, [selectedWeek]);




  // 2. Update week days on week change
  useEffect(() => {
    const selected = weekOptions.find((w) => w.label === selectedWeek);
    if (selected) {
      setWeekDays(generateWeekDays(selected.start));
    }
  }, [selectedWeek, weekOptions]);

  // 3. Mock projects
  useEffect(() => {
    const mockProjects = ['Project Alpha', 'Project Beta', 'Project Gamma'];
    setProjects(mockProjects);
    setSelectedProject(mockProjects[0]);
  }, []);


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

// Convert time "HH:mm AM/PM" string to Date object on 1970-01-01
const timeStringToDate = (timeStr) => {
  if (!timeStr) return null;
  // Parse "08:30 AM" or "14:45"
  const [time, meridian] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (meridian) {
    if (meridian.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (meridian.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }
  const d = new Date(1970, 0, 1, hours, minutes, 0);
  return d;
};

// Convert Date object to "hh:mm AM/PM" string
const dateToTimeString = (date) => {
  if (!date) return '';
return date.toTimeString().slice(0, 8); // e.g., "08:30:00"
};




  const calculateDailyHours = (startStr, endStr) => {
  if (!startStr || !endStr) return 0;

  const startDate = timeStringToDate(startStr);
  const endDate = timeStringToDate(endStr);
  if (!startDate || !endDate) return 0;

  let diffInMs = endDate - startDate;
  if (diffInMs < 0) {
    diffInMs += 24 * 60 * 60 * 1000;
  }

  // Round to nearest full minute (ignore seconds)
  const totalMinutes = Math.round(diffInMs / (1000 * 60));

  // Convert to decimal hours
  const diffInHours = totalMinutes / 60;

  return diffInHours.toFixed(2);
};
const formatDecimalHoursToHHmm = (decimalHours) => {
  if (!decimalHours || isNaN(decimalHours)) return '0:00';
  const totalMinutes = Math.round(parseFloat(decimalHours) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minutesStr}`;
};



const handleManualChange = (dateStr, field, value) => {
  if (!canFillWeek(selectedWeek, dateStr)) return;

  setTimes((prev) => {
    const existing = prev[dateStr] || {};
    const updated = { ...existing, [field]: value };
   

    if (updated.start && updated.end) {
  const startDate = timeStringToDate(updated.start);
  const endDate = timeStringToDate(updated.end);

  if (startDate >= endDate) {
    updated.error = 'Invalid time given';
    updated.total = '0.00';
  } else {
    updated.total = calculateDailyHours(updated.start, updated.end);
    delete updated.error;
  }
}

  else {
      // Clear error if only one of start/end is present (user fixing partial input)
      if (updated.error) {
        delete updated.error;
      }
    }
    const updatedTimes = { ...prev, [dateStr]: updated };
    saveTimesToSessionStorage(updatedTimes);
    return updatedTimes;
  });
};

useEffect(() => {
  const restored = loadTimesFromSessionStorage();

  if (
    restored &&
    Object.keys(restored).length > 0 &&
    selectedWeek &&
    !submittedWeeks.includes(selectedWeek)
  ) {
    setTimes(restored);
  }
}, [submittedWeeks, selectedWeek]);






const handleSendForApproval = async () => {
  const selected = weekOptions.find(w => w.label === selectedWeek);
  const weekDaysToSend = generateWeekDays(selected.start).filter(day => {
    const dayNum = new Date(day.fullDate).getDay();
    return dayNum >= 1 && dayNum <= 5; // Monday to Friday
  });

  // Validate all entries before submission (your existing validation logic here)
  let hasErrors = false;
  const updatedTimes = { ...times };

  for (let day of weekDaysToSend) {
    const entry = times[day.fullDate] || {};

    if (!entry.start || !entry.end) {
      updatedTimes[day.fullDate] = { 
        ...entry, 
        error: 'Please complete start and end times' 
      };
      hasErrors = true;
    } else {
      const startDate = timeStringToDate(entry.start);
      const endDate = timeStringToDate(entry.end);
      if (startDate >= endDate) {
        updatedTimes[day.fullDate] = {
          ...entry,
          error: 'Invalid time given'
        };
        hasErrors = true;
      } else {
        if (entry.error) {
          const { error, ...rest } = entry;
          updatedTimes[day.fullDate] = rest;
        }
      }
    }
  }

  if (hasErrors) {
    setTimes(updatedTimes);
    return;
  }

  // Convert daily totals to minutes before sending
  const dataToSend = weekDaysToSend.map(day => {
    const entry = times[day.fullDate] || {};
    const decimalHours = parseFloat(entry.total) || 0;
    const totalMinutes = Math.round(decimalHours * 60);

    return {
      userId,
      date: new Date(day.fullDate).toISOString().slice(0, 10),
      ...entry,
      total: totalMinutes,  // <-- converted to minutes
      project: selectedProject,
      week: selectedWeek,
    };
  });

  // Convert total week hours to minutes
  const totalWeekMinutes = Math.round(totalWeekHours * 60);

  try {
    await api.post('/tsManage/submit', {
      userId,
      week: selectedWeek,
      weekTotal: totalWeekMinutes, // <-- converted to minutes
      weekType: weekType,
      entries: dataToSend,
    });

    sessionStorage.removeItem('unsavedTimesheet');
    setShowSuccess(true);
    setTimes({});

  // ✅ Re-fetch week statuses from backend
  const fetchWeekStatuses = async () => {
    if (weekOptions.length === 0) return;

    const previous = weekOptions[0]?.label;
    const current = weekOptions[1]?.label;

    try {
      const res = await api.post('/tsManage/status-check', {
        empId: userId,
        weeks: [previous, current]
      });

      const { previous: prevStatus, current: currStatus } = res.data;
      setWeekStatuses({
        previousWeek: prevStatus || null,
        currentWeek: currStatus || null
      });

      const submitted = [];
      if (prevStatus === 'SUBMITTED') submitted.push(previous);
      if (currStatus === 'SUBMITTED') submitted.push(current);
      setSubmittedWeeks(submitted);

    } catch (err) {
      console.error('Error fetching week statuses:', err);
    }
  };

  await fetchWeekStatuses();

  // Optional: Return to current week after delay
  setTimeout(() => {
    const currentWeek = weekOptions.find(
      (w) => new Date() >= w.start && new Date() <= w.end
    );
    if (currentWeek) {
      setSelectedWeek(currentWeek.label);
    }
    setShowSuccess(false);
  }, 3000);
} catch (err) {
  alert('Failed to submit timesheet');
  console.error(err);
}
  };


  const totalWeekHours = Object.values(times).reduce(
    (sum, entry) => {const totalNum = parseFloat(entry.total);
  return sum + (isNaN(totalNum) ? 0 : totalNum);
}, 0);
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

const hasUnsavedData = Object.keys(times || {}).length > 0;
const isSubmitted = submittedWeeks.includes(selectedWeek);
  return (
    <div className={styles.timesheetContainer}>
      <h2>🕒 Weekly Timesheet</h2>
      
{hasUnsavedData && !isSubmitted && (
  <div className={styles.reminderBanner}>
    ⚠️ Don't forget to submit your timesheet before logging out!
  </div>
)}


      <div className={styles.weekSelector}>
        <label>Select Week:</label>
        <select  style={{ color: 'black' }}

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
      title={isSubmitted ? 'Already submitted' : ''}
    >
      {week.label} {isSubmitted && '✅ Submitted'}
    </option>
  );
})}




        </select>
        <span className={styles.monthDisplay}>
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
      </div>

   




 {allWeeksSubmitted ? (
  <div style={{ textAlign: 'center', margin: '40px 0', fontSize: '1.2rem', color: 'green' }}>
    🎉 You're all caught up for this week!
  </div>
) : (
  <>
    <div className={styles.projectDropdown}>
      <label>Select Project:</label>
      <select style={{ color: 'white' }}
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

    <div className={styles.timesheetTable}>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            {/* <th>Clock</th> */}
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
    const isFutureDay = dateObj > today;



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
  <TimePicker     className={entry.error ? styles.invalidTime : ''}


    format="hh:mm a"
    value={timeStringToDate(entry.start)}

    onChange={(value) => {
      if (!value) return;
      const timeString = dateToTimeString(value);
      handleManualChange(day.fullDate, 'start', timeString);
    }}
    showMeridiem={true} 

    placeholder="Start time"
    disabled={isWeekend|| isFutureDay|| isWeekSubmitted}
  />
  {entry.error && (
  <div className={styles.errorText}>{entry.error}</div>
)}
</td>
<td>
  <TimePicker     className={entry.error ? styles.invalidTime : ''}

    format="hh:mm a"
    value={timeStringToDate(entry.end)}
    onChange={(value) => {
      if (!value) return;
      const timeString = dateToTimeString(value);
      handleManualChange(day.fullDate, 'end', timeString);
    }}
    showMeridiem={true} 
    placeholder="End time"
    disabled={isWeekend || isFutureDay|| isWeekSubmitted}
    
  />
  {entry.error && (
  <div className={styles.errorText}>{entry.error}</div>
)}
</td>

                {/* <td>
  {isToday &&  (
    <button 
      disabled={isWeekend}
      className={`${styles.clockBtn} ${!entry.start ? styles.clockIn : !entry.end ? styles.clockOut : styles.done}`}
      onClick={() => handleClock(day.fullDate)}
      title={isWeekend ? "Cannot clockIn/out on weekends" : ""}
      
    >
      {!entry.start ? 'Clock In' : !entry.end ? 'Clock Out' : 'Done'}
    </button>
  )}
</td> */}

                <td>{formatDecimalHoursToHHmm(entry.total) || '0:00'} hrs</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
     {!isWeekSubmitted &&  !allWeeksSubmitted && (
  <div style={{ textAlign: 'center', marginTop: '30px' }}>
    <button
      className={`${styles.submitBtn} ${styles.rocketBtn}`}
      onClick={handleSendForApproval}
      disabled={!isSendEnabled()|| isWeekSubmitted}
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

    <div className={styles.totalTime}>
  Total Time This Week: <strong>{formatDecimalHoursToHHmm(totalWeekHours)} hrs</strong>
    </div>
  </>
)}


      

      {showSuccess && (
        <div className={styles.successToast}>
          ✅ Timesheet submitted successfully!
        </div>
      )}
    </div>
  );
};

export default Timesheets;
