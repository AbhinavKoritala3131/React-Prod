import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/v.png';
import ManageTimesheets from './adminOnly/ManageTimesheets';
import GlowingCards from './DashboardElements';
import PersonalInfo from './PersonalInfo';
import Projects from './Projects';
import Timesheets from './Timesheets';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState('home');
  const [isClockedIn, setIsClockedIn] = useState(false);

  const navigate = useNavigate();
  const headerRef = useRef(null);
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);
  const menuButtonRef = useRef(null);

  // ✅ Fetch user info + role + clock status securely from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 'api' already attaches JWT Authorization header from axios interceptor
        const res = await api.get('/users/who');
        const data = res.data;
        setUserId(data.userId);

        setUser({
         id: data.userId,
          email: data.username,
          fName: data.fName,
          lName: data.lName,          
          
  mobile: data.mobile,
  country: data.country,      
  DOB: data.DOB 
        });
        setRole(data.role);
        setIsClockedIn(data.ClockStatus === 'CLOCK_IN');

      } catch (err) {
        console.error('Error fetching user:', err);
        navigate('/'); // token invalid or expired -> redirect
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);
  // Close menu if clicked outside menu bar
  useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target) &&
      menuButtonRef.current &&
      !menuButtonRef.current.contains(event.target)
    ) {
      setMenuOpen(false);
    }

    if (
      profileRef.current &&
      !profileRef.current.contains(event.target)
    ) {
      setProfileOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);


  // ✅ Clock-in/out directly through backend (no local storage)
  const handleClock = async () => {
  if (!user) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const payload = {
    userId: user.id,
    date: now.toISOString().slice(0, 10),
    start: isClockedIn ? null : timeStr,
    end: isClockedIn ? timeStr : null,
    status: isClockedIn ? 'CLOCK_OUT' : 'CLOCK_IN',
  };

  try {
    const res = await api.post('/tsManage/clock', payload);
    if (res.status === 200) {
      const newStatus = res.data.status || (isClockedIn ? 'CLOCK_OUT' : 'CLOCK_IN');
      setIsClockedIn(newStatus === 'CLOCK_IN');
    } else {
      alert('Failed to update clock status');
    }
  } catch (err) {
    console.error('Clock update failed:', err);
    alert('Clock update failed.');
  }
};


  // ✅ Secure logout (backend clears refresh token cookie)
  // const handleLogout = async () => {
  //   try {
  //     // await api.post('/users/logout');
  //     sessionStorage.clear();

  //   } catch (e) {
  //     console.error('Logout error:', e);
  //   } finally {
  //     navigate('/');
  //   }
  // };


const handleLogout = () => {
  try {
    // Clear everything from sessionStorage
    sessionStorage.clear();

    // Optionally also clear localStorage if you ever stored data there
    localStorage.clear();
  } catch (err) {
    console.error('Error clearing storage:', err);
  } finally {
    // Navigate to login/home page
    navigate('/');

    // Force reload so all React state & interceptors reset
    window.location.reload();
  }
};

  // UI Rendering
  if (loading) return <div>Loading dashboard...</div>;
  if (!user) return <div>Unauthorized or user not found.</div>;

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
          onClick={() => setProfileOpen(!profileOpen)
            
          }
        >
          👤 Profile
          {profileOpen && (
            <div className="profile-dropdown">
              <button onClick={() => setActiveComponent('personalInfo')}>
                Personal Info
              </button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`sidebar ${menuOpen ? 'open' : ''}`}
        style={{
          top: headerRef.current?.offsetHeight || 80,
          height: `calc(100% - ${(headerRef.current?.offsetHeight || 80)}px)`
        }}
      >
        <button onClick={() => {setActiveComponent('home'); setMenuOpen(false);}}>🏠 Home</button>
        <button onClick={() => {setActiveComponent('timesheets');setMenuOpen(false);}}>📅 Timesheets</button>
        <button onClick={() => {setActiveComponent('projects');setMenuOpen(false);}}>📁 Projects</button>
        {role === 'ADMIN' && (
          <>
            <button onClick={() => {setActiveComponent('ManageTimesheets');setMenuOpen(false);}}>🗓️ Manage Timesheets</button>
            <button onClick={() => {setActiveComponent('adminReports');setMenuOpen(false);}}>📊 Admin Reports</button>
          </>
        )}
      </div>

      {/* Main Content */}
      {activeComponent === 'personalInfo' && <PersonalInfo user={user} />}
      {activeComponent === 'projects' && <Projects userId={userId}/>}
      {activeComponent === 'timesheets' && <Timesheets userId={userId} />}
      {activeComponent === 'ManageTimesheets' && role === 'ADMIN' && <ManageTimesheets />}

      {activeComponent === 'home' && (
        <div className="home-dashboard">
          <button
            className={`oval-clock-btn ${isClockedIn ? 'clocked-in' : 'clocked-out'}`}
            onClick={handleClock}
          >
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </button>
         <div className="cards-container">
      <GlowingCards />
    </div>
  </div>
      )}
    </div>
  );
};

export default Dashboard;
