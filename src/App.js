import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

// Import screens
import ExerciseScreen from './screens/ExerciseScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import ProfileScreen from './screens/ProfileScreen';
import SessionScreen from './screens/SessionScreen';

// Import sample data initialization
import { initializeSampleData } from './utils/sampleData';

/**
 * Main App component for the Workout Tracker
 * Handles routing and navigation between different screens
 */
function App() {
  // Initialize sample data on first load
  useEffect(() => {
    initializeSampleData();
  }, []);

  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ExerciseScreen />} />
            <Route path="/exercises" element={<ExerciseScreen />} />
            <Route path="/workouts" element={<WorkoutScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/session/:workoutId" element={<SessionScreen />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

/**
 * Navigation component for the app
 * Provides navigation between different screens
 */
function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/exercises', label: 'Exercises', icon: '💪' },
    { path: '/workouts', label: 'Workouts', icon: '🏋️' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <nav className="nav">
      <div className="container">
        <div className="nav-brand">
          <h1>🏋️ Workout Tracker</h1>
        </div>
        <ul className="nav-list">
          {navItems.map(item => (
            <li key={item.path} className="nav-item">
              <Link 
                to={item.path} 
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default App;