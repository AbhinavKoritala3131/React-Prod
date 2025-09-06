import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../styles/AuthPage.css';

const AuthPage = () => {
  const [activeForm, setActiveForm] = useState('signup');
  const [submitError, setSubmitError] = useState(null);

const navigate = useNavigate(); 
  // Register form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: '',
    mobile: '',
    ssn: '',
    dob: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [registerResponse, setRegisterResponse] = useState(null); // { success: bool, message: string }

  // Sign In form state
  const [signinData, setSigninData] = useState({
    email: '',
    password: ''
  });
  const [signinResponse, setSigninResponse] = useState(null);

  const countryCodes = {
    India: '+91',
    USA: '+1',
    UK: '+44',
    Canada: '+1',
    Australia: '+61',
    Germany: '+49',
    France: '+33',
  };

  const showForm = (formName) => {
    setActiveForm(formName);
    setFormErrors({});
    setRegisterResponse(null);
    setSigninResponse(null);
  };

  // ========== Register Form Handlers ==========

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
    setRegisterResponse(null);
  };

  const validateRegisterForm = () => {
    const errors = {};

    // firstName, lastName: min 2 chars, letters only
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2 || /\d/.test(formData.firstName)) {
      errors.firstName = 'First name must be at least 2 letters and contain no numbers';
    }
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2 || /\d/.test(formData.lastName)) {
      errors.lastName = 'Last name must be at least 2 letters and contain no numbers';
    }

    // email required and basic format check
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // password: min 8 chars, 1 uppercase, 1 lowercase, 1 number
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (
      formData.password.length < 8 ||
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password)
    ) {
      errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, and a number';
    }

    // country required
    if (!formData.country) {
      errors.country = 'Country is required';
    }

    // mobile: exactly 10 digits, digits only
    if (!formData.mobile) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      errors.mobile = 'Mobile number must be exactly 10 digits';
    }

    // ssn: 4 digits only
    if (!formData.ssn) {
      errors.ssn = 'SSN is required';
    } else if (!/^\d{9}$/.test(formData.ssn)) {
      errors.ssn = 'SSN must be exactly 9 digits';
    }

    // dob required
    if (!formData.dob) {
      errors.dob = 'Date of Birth is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    

    if (!validateRegisterForm()) {
      setSubmitError('Please fix the errors to register.');
    return;
     
    }   setSubmitError(null);

    // prepend country code if not present
    let fullMobile = formData.mobile;
    const countryCode = countryCodes[formData.country] || '';
    if (!fullMobile.startsWith('+')) {
      fullMobile = countryCode + fullMobile;
    }

    const payload = {
      fname: formData.firstName,
      lname: formData.lastName,
      email: formData.email,
      password: formData.password,
      country: formData.country,
      mobile: fullMobile,
      ssn: formData.ssn,
      dob: formData.dob
    };

    try {
      const response = await fetch('http://localhost:8081/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setRegisterResponse({ success: true, message: data.message || 'User registered successfully!' });
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          country: '',
          mobile: '',
          ssn: '',
          dob: ''
        });
        setFormErrors({});
      } else {
        setRegisterResponse({ success: false, message: data.message || 'Failed to register user.' });
      }
    } catch (error) {
      setRegisterResponse({ success: false, message: 'Something went wrong. Please try again.' });
    }
  };

  // ========== Sign In Handlers ==========

  const handleSigninChange = (e) => {
    const { name, value } = e.target;
    setSigninData((prev) => ({ ...prev, [name]: value }));
    setSigninResponse(null);
  };

  const handleSigninSubmit = async (e) => {
    e.preventDefault();

    if (!signinData.email || !signinData.password) {
      setSigninResponse({ success: false, message: 'Please enter email and password' });
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinData),
      });

      const data = await response.json();

      if (response.ok) {
         localStorage.setItem('userId', data.userId);
        setSigninResponse({ success: true, message: data.message || 'Login successful!' });
        setSigninData({ email: '', password: '' });
        setTimeout(() => {
    navigate('/Dashboard'); // 🔁 redirect to dashboard
  }, 1000);
      } else {
        setSigninResponse({ success: false, message: data.message || 'Invalid credentials' });
      }
    } catch (error) {
      setSigninResponse({ success: false, message: 'Network error. Please try again.' });
    }
  };

  // ======== Helpers for UI ========

  // Add floating red border if error present, also add title for hover tooltip
  const getInputProps = (field) => ({
    className: formErrors[field] ? 'input-error' : '',
    title: formErrors[field] || '',
  });

  // Add dark red shadow to auth-container if any error on register form or signin error
  const hasRegisterErrors = Object.keys(formErrors).length > 0;
  const hasSigninError = signinResponse && !signinResponse.success;

  return (
    <div className="auth-page">
      <div
  className={`auth-container ${
    (hasRegisterErrors || hasSigninError)
      ? 'error-shadow'
      : (signinResponse?.success || registerResponse?.success)
      ? 'success-shadow'
      : ''
  }`}
>

        <div className="header">My Enterprise</div>
        <p className="tagline">User Portal</p>
        <h1 className="title">Welcome to User Portal</h1>

        {activeForm === 'signup' && (
          <div id="signup-form" className="form-card">
            <h2>Sign In</h2>
            <form id="form-signup" noValidate onSubmit={handleSigninSubmit}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={signinData.email}
                onChange={handleSigninChange}
                required
                title={!signinData.email ? 'Email is required' : ''}
                className={!signinData.email && hasSigninError ? 'input-error' : ''}
              />

              <label>Password</label>
              <input
                type="password"
                name="password"
                value={signinData.password}
                onChange={handleSigninChange}
                required
                title={!signinData.password ? 'Password is required' : ''}
                className={!signinData.password && hasSigninError ? 'input-error' : ''}
              />

              <button type="submit" className="submit-btn">
                Sign In
              </button>
            </form>

            {/* Dynamic Sign In response */}
            {signinResponse && (
              <div
                className={`response-message ${signinResponse.success ? 'success' : 'error'}`}
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold',
                  color: signinResponse.success ? 'white' : 'red',
                }}
              >
                {signinResponse.success ? (
                  <span style={{ color: 'white', fontSize: '20px' }}>✅</span>
                ) : (
                  <span style={{ color: 'red', fontSize: '20px' }}>❌</span>
                )}
                <span>{signinResponse.message}</span>
              </div>
            )}

            <p className="switch-link">
              New user?{' '}
              <button className="link-btn" onClick={() => showForm('register')}>
                Create account
              </button>
            </p>
          </div>
        )}

        {activeForm === 'register' && (
          <div id="register-form" className="form-card">
            <h2>Register</h2>
            <form id="form-register" noValidate onSubmit={handleRegisterSubmit}>
            {submitError && (
    <div className="submit-error-message" style={{ color: 'red', marginBottom: '10px' }}>
      {submitError}
    </div>
  )}
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                pattern="^[A-Za-z\s]+$"
                value={formData.firstName}
                onChange={handleChange}
                {...getInputProps('firstName')}
              />

              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                pattern="^[A-Za-z\s]+$"
                value={formData.lastName}
                onChange={handleChange}
                {...getInputProps('lastName')}
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                {...getInputProps('email')}
              />

              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                {...getInputProps('password')}
              />

              <label htmlFor="register-country" className="form-label">Country</label>
              <select
                name="country"
                className={`styled-select ${formErrors.country ? 'input-error' : ''}`}
                value={formData.country}
                onChange={handleChange}
                required
                title={formErrors.country || ''}
              >
                <option value="">Select your country</option>
                <option value="India">🇮🇳 India</option>
                <option value="USA">🇺🇸 USA</option>
                <option value="UK">🇬🇧 UK</option>
                <option value="Canada">🇨🇦 Canada</option>
                <option value="Australia">🇦🇺 Australia</option>
                <option value="Germany">🇩🇪 Germany</option>
                <option value="France">🇫🇷 France</option>
              </select>

              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                placeholder="10-digit number"
                maxLength="10"
                value={formData.mobile}
                onChange={handleChange}
                {...getInputProps('mobile')}
              />

              <label>SSN Last Four Digits</label>
              <input
                type="password"
                name="ssn"
                maxLength="9"
                minLength="9"
                value={formData.ssn}
                onChange={handleChange}
                {...getInputProps('ssn')}
                placeholder="***-**-****"
              />

              <label>Date Of Birth</label>
              <input
                type="date"
                name="dob"
                min="1925-01-01"
                max="2007-12-31"
                value={formData.dob}
                onChange={handleChange}
                {...getInputProps('dob')}
              />

              {/* Register response message */}
              {registerResponse && (
                <div
                  className={`response-message ${registerResponse.success ? 'success' : 'error'}`}
                  style={{
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 'bold',
                    color: registerResponse.success ? 'white' : 'red',
                  }}
                >
                  {registerResponse.success ? (
                    <span style={{ color: 'white', fontSize: '30px' }}>✅</span>
                  ) : (
                    <span style={{ color: 'red', fontSize: '30px' }}>❌</span>
                  )}
                  <span>{registerResponse.message}</span>
                </div>
              )}

              <div className="centered-btn-wrapper">
    <button type="submit" className="submit-btn">Register</button>
  </div>
            </form>
            <p className="switch-link">
              Already have an account?{' '}
              <button className="link-btn" onClick={() => showForm('signup')}>
                Sign in
              </button>
            </p>
          </div>
        )}

        <div className="footer">© 2025 MyCompany. All rights reserved.</div>
      </div>
    </div>
  );
};

export default AuthPage;
