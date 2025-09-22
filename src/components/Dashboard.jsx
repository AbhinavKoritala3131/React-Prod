// src/components/Dashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import logo from '../assets/v.png';
import api from '../api/axios'
import ManageTimesheets from './adminOnly/ManageTimesheets'

import PersonalInfo from './PersonalInfo';
import Projects from './Projects';
import Timesheets from './Timesheets';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState('welcome');
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isClockedIn, setIsClockedIn] = useState(() => {
    return sessionStorage.getItem('isClockedIn') === 'true';
  });
const role = sessionStorage.getItem('role'); // e.g., 'USER' or 'ADMIN'

  const headerRef = useRef(null);
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);
  const menuButtonRef = useRef(null);

  const navigate = useNavigate();
  const userId = Number(sessionStorage.getItem('userId'));


  useEffect(() => {
  const adminOnly = ['ManageTimesheets', 'adminReports'];
  if (adminOnly.includes(activeComponent) && role !== 'ADMIN') {
    setActiveComponent('home');
  }
}, [activeComponent, role]);
  // Redirect if no userId
  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    // Calculate header height for sidebar positioning
    const updateHeaderHeight = () => {
      requestAnimationFrame(() => {
        if (headerRef.current) {
          setHeaderHeight(headerRef.current.offsetHeight);
        }
      });
    };
    // MORE SECURITY FOR COMPONENT SPOOFING USING DEV TOOLS
    


    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);

    // Fetch user data
    const fetchUserDetails = async () => {
  try {
    const response = await fetch(`http://localhost:8081/users/fetch/${userId}`);

    if (!response.ok) {
      console.error('Failed to fetch user details:', response.status);
      setLoading(false);
      return;
    }

    // Now safe to parse JSON
    const data = await response.json();
    setUser(data);
    setActiveComponent('home');

    // Fetch clock status
    const statusRes = await fetch(`http://localhost:8081/tsManage/status/${userId}`);
    if (statusRes.ok) {
      const currentStatus = await statusRes.text(); // plain string
      const clockedIn = currentStatus === 'CLOCK_IN';
      setIsClockedIn(clockedIn);
      sessionStorage.setItem('isClockedIn', clockedIn);
    }

  } catch (error) {
    console.error('Error fetching user data:', error);
  } finally {
    setLoading(false);
  }
};


    fetchUserDetails();

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, [userId, navigate]);

  // Close menu/profile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedSidebar = sidebarRef.current?.contains(event.target);
      const clickedProfile = profileRef.current?.contains(event.target);
      const clickedMenuBtn = menuButtonRef.current?.contains(event.target);

      if (menuOpen && !clickedSidebar && !clickedMenuBtn) {
        setMenuOpen(false);
      }
      if (profileOpen && !clickedProfile) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, profileOpen]);

  // Logout handler
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  
  // Check if last week's timesheet submitted
  const hasSubmittedLastWeek = () => {
    const submittedWeeks = JSON.parse(sessionStorage.getItem('submittedWeeks') || '[]');
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const weekString = lastWeek.toISOString().slice(0, 10);
    return submittedWeeks.includes(weekString);
  };

  // Clock in/out handler
  const handleClock = () => {
    const payload = {
      userId,
      date: new Date().toISOString().slice(0, 10),  // e.g. "2025-09-11"
      start: isClockedIn ? null : new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit',hour12: false })
// e.g. "11:24"
,
      end: isClockedIn ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit',second: '2-digit', hour12: false })
// e.g. "11:24"
 : null,
      status: isClockedIn ? 'CLOCK_OUT' : 'CLOCK_IN'
      
    };

  
api.post('http://localhost:8081/tsManage/clock', payload)
  .then(res => {
    if (res.status === 200) {
      const newState = !isClockedIn;
      setIsClockedIn(newState);
      sessionStorage.setItem('isClockedIn', newState);
    } else {
      alert('Failed to update clock status.');
    }
  })
  .catch(err => {
    console.error('Clock update failed:', err);
    alert('Failed to update clock status.');
  });
  };

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;
  if (!user) return <div className="dashboard-error">User not found.</div>;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div ref={headerRef} className="dashboard-header">
        <div className="left-section">
          <div
            ref={menuButtonRef}
            className="menu-icon"
            onClick={() => setMenuOpen(prev => !prev)}
          >
            ☰
          </div>
          <img className="logoheader" src={logo} alt="Vectrolla Logo" />
          <h1 className="comp-name">vectrolla</h1>
        </div>
        <div
          ref={profileRef}
          className="profile-icon"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          👤Profile
          {profileOpen && (
            <div className="profile-dropdown">
              <button
                onClick={() => {
                  setActiveComponent('personalInfo');
                  setProfileOpen(false);
                }}
              >
                Personal Info
              </button>
              <button onClick={handleLogout}>Logout</button>
              <button onClick={() => alert('Redirect to bug report page')}>
                Report a Bug
              </button>
            </div>
          )}
        </div>
      </div>

      

      {/* Sidebar Menu */}
      <div
        ref={sidebarRef}
        className={`sidebar ${menuOpen ? 'open' : ''}`}
        style={{
          top: headerHeight || 80,
          height: `calc(100% - ${headerHeight || 80}px)`
        }}
      >
        <button
          onClick={() => {
            setActiveComponent('home');
            setMenuOpen(false);
          }}
        >
          🏠 Home
        </button>
        <button
          onClick={() => {
            setActiveComponent('timesheets');
            setMenuOpen(false);
          }}
        >
          📅 Timesheets
        </button>
        <button
          onClick={() => {
            setActiveComponent('projects');
            setMenuOpen(false);
          }}
        >
          📁 Projects
        </button>
        {role === 'ADMIN' && (
    <>
      <button onClick={() => { setActiveComponent('ManageTimesheets'); setMenuOpen(false); }}>🗓️ Manage Timesheets</button>
      <button onClick={() => { setActiveComponent('adminReports'); setMenuOpen(false); }}>📊 Admin Reports</button>
    </>
  )}
  

      </div>
      {activeComponent === 'personalInfo' && <PersonalInfo user={user} />}
      {activeComponent === 'projects' && <Projects />}
      {activeComponent === 'timesheets' && <Timesheets />}
            {activeComponent === 'home' && 
            <button
  className={`oval-clock-btn ${isClockedIn ? 'clocked-in' : 'clocked-out'}`}
  onClick={handleClock}
  aria-label={isClockedIn ? 'Clock Out' : 'Clock In'}
>
  {isClockedIn ? 'Clock Out' : 'Clock In'}
</button>
}
{activeComponent === 'ManageTimesheets' && role === 'ADMIN' && <ManageTimesheets />}



    </div>
    
  );
};

export default Dashboard;
