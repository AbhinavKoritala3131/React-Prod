// src/components/Dashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import logo from '../assets/v.png';

import PersonalInfo from './personalInfo';
import Projects from './Projects';
import Timesheets from './Timesheets';



const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showTimesheets, setShowTimesheets] = useState(false);
  const [activeComponent, setActiveComponent] = useState('welcome'); 
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);
const menuButtonRef = useRef(null);

  const navigate = useNavigate();

  const userId = Number(localStorage.getItem('userId'));
  
    

  useEffect(() => {
  if (!userId) {
    navigate('/');
    return;
  }

  const updateHeaderHeight = () => {
    requestAnimationFrame(() => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
        console.log('Header height set to:', height); // For debugging
      }
    });
  };

  updateHeaderHeight(); // Initial height
  window.addEventListener('resize', updateHeaderHeight); // On resize
 
   

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8081/users/fetch/${userId}`);
        const data = await response.json();
        if (response.ok) {
          setUser(data);
          setActiveComponent('home');
        } else {
          console.error('Failed to fetch user details');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
      return () =>    { window.removeEventListener('resize', updateHeaderHeight);

 };
}, [userId, navigate]);
  // close outside click
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
  //  Clickoutside closed

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (!user) {
    return <div className="dashboard-error">User not found.</div>;
  }

  return (
    
    <div className="dashboard-container">
      {/* Header */}
      <div ref={headerRef} className="dashboard-header">
        <div className="left-section">
          <div ref={menuButtonRef} className="menu-icon" onClick={() => setMenuOpen((prev) => !prev) } >
            ☰
          </div>
          <img className="logoheader" src={logo} alt="Vectrolla Logo" />
          <h1 className="comp-name">vectrolla</h1>
        </div>
        <div ref={profileRef} className="profile-icon" onClick={() => setProfileOpen(!profileOpen)}>
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
              <button onClick={() => alert('Redirect to bug report page')}>Report a Bug</button>
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
            height: `calc(100% - ${headerHeight || 80}px)`,

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
        </div>
      

      {/* Floating Welcome Block */}
      {activeComponent === 'home' && (
        <div className="floating-welcome">
          <h2>👋 Welcome, {user.fName}!</h2>
          <p>Keep Up-to-date with your Projects!</p>
          <button className="primary-btn" onClick={() => setActiveComponent('projects')}>
            Go to Projects
          </button>
        </div>
      )}

      {/* Conditional Rendering */}
      {activeComponent === 'personalInfo' && <PersonalInfo user={user} />}
      {activeComponent === 'projects' && <Projects />}
      {activeComponent === 'timesheets' && <Timesheets />}
    </div>
  );
};
export default Dashboard;
