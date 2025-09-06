// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AuthPage from './components/AuthPage.jsx';
import Dashboard from './components/Dashboard.jsx'; 
import PersonalInfo from './components/personalInfo.jsx';
import Timesheets from './components/Timesheets.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/personalInfo" element={<PersonalInfo />} />
        <Route path="/timesheets" element={<Timesheets />} />


      </Routes>
    </Router>
  );
};

export default App;
