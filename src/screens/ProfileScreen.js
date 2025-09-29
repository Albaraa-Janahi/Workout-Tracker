import React, { useState, useEffect } from 'react';
import { userStorage, dataUtils, sessionStorage, workoutStorage, exerciseStorage } from '../utils/localStorage';
import { resetToSampleData } from '../utils/sampleData';

/**
 * Profile Screen component
 * Displays user profile and workout statistics
 */
function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({
    name: ''
  });

  // Load user data and statistics on component mount
  useEffect(() => {
    loadUserData();
    loadStatistics();
  }, []);

  // Load user profile data
  const loadUserData = () => {
    const userData = userStorage.get();
    setUser(userData);
    setEditForm({ name: userData.name });
  };

  // Load workout statistics
  const loadStatistics = () => {
    const overallStats = dataUtils.getOverallStats();
    setStats(overallStats);
  };

  // Handle profile update
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    
    if (editForm.name.trim() === '') {
      alert('Name cannot be empty');
      return;
    }

    const updatedUser = {
      ...user,
      name: editForm.name.trim()
    };

    if (userStorage.update(updatedUser)) {
      setUser(updatedUser);
      setShowEditForm(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle reset to default data
  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset to default data? This will replace all your exercises and workouts with the original sample data.')) {
      if (window.confirm('This will delete ALL your current exercises, workouts, and sessions. Are you absolutely sure?')) {
        resetToSampleData();
        // Reload the page to refresh all data
        window.location.reload();
      }
    }
  };

  // Get recent workout sessions
  const getRecentSessions = () => {
    const sessions = sessionStorage.getAll();
    return sessions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  // Get workout statistics by workout
  const getWorkoutStats = () => {
    const workouts = workoutStorage.getAll();
    return workouts.map(workout => ({
      ...workout,
      stats: dataUtils.getWorkoutStats(workout.id)
    }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format duration for display
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!user || !stats) {
    return (
      <div className="container">
        <div className="text-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="screen-header">
        <h1>👤 Profile & Statistics</h1>
        <p>Track your progress and view workout insights</p>
      </div>

      {/* User Profile Section */}
      <div className="card">
        <div className="card-header">
          <h2>User Profile</h2>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowEditForm(!showEditForm)}
          >
            {showEditForm ? 'Cancel' : '✏️ Edit Profile'}
          </button>
        </div>

        {showEditForm ? (
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={editForm.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Update Profile
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="profile-details">
              <h3>{user.name}</h3>
              <p className="text-muted">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Overall Statistics */}
      <div className="card">
        <div className="card-header">
          <h2>Overall Statistics</h2>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalWorkouts}</div>
            <div className="stat-label">Total Workouts</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{stats.totalExercises}</div>
            <div className="stat-label">Total Exercises</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{stats.totalSessions}</div>
            <div className="stat-label">Workout Sessions</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{stats.completedSessions}</div>
            <div className="stat-label">Completed Sessions</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{stats.completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{formatDuration(stats.averageDuration)}</div>
            <div className="stat-label">Avg. Duration</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{stats.totalVolume}</div>
            <div className="stat-label">Total Volume</div>
          </div>
        </div>
      </div>

      {/* Workout Performance */}
      <div className="card">
        <div className="card-header">
          <h2>Workout Performance</h2>
        </div>
        
        {getWorkoutStats().length === 0 ? (
          <div className="empty-state">
            <p>No workout data available yet. Start your first workout to see performance metrics!</p>
          </div>
        ) : (
          <div className="workout-performance">
            {getWorkoutStats().map(workout => (
              <div key={workout.id} className="performance-item">
                <div className="performance-header">
                  <h4>{workout.name}</h4>
                  <span className="performance-badge">
                    {workout.stats.totalSessions} sessions
                  </span>
                </div>
                
                <div className="performance-stats">
                  <div className="performance-stat">
                    <span className="stat-label">Completion Rate</span>
                    <span className="stat-value">{workout.stats.completionRate}%</span>
                  </div>
                  <div className="performance-stat">
                    <span className="stat-label">Avg. Duration</span>
                    <span className="stat-value">{formatDuration(workout.stats.averageDuration)}</span>
                  </div>
                  <div className="performance-stat">
                    <span className="stat-label">Total Volume</span>
                    <span className="stat-value">{workout.stats.totalVolume}</span>
                  </div>
                  {workout.stats.lastWorkout && (
                    <div className="performance-stat">
                      <span className="stat-label">Last Workout</span>
                      <span className="stat-value">{formatDate(workout.stats.lastWorkout.date)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2>Recent Activity</h2>
        </div>
        
        {getRecentSessions().length === 0 ? (
          <div className="empty-state">
            <p>No recent workout sessions. Start your first workout to see activity here!</p>
          </div>
        ) : (
          <div className="recent-activity">
            {getRecentSessions().map(session => {
              const workout = workoutStorage.getById(session.workoutId);
              return (
                <div key={session.id} className="activity-item">
                  <div className="activity-icon">
                    {session.completed ? '✅' : '⏸️'}
                  </div>
                  <div className="activity-details">
                    <div className="activity-title">
                      {workout ? workout.name : 'Unknown Workout'}
                    </div>
                    <div className="activity-meta">
                      {formatDate(session.date)} • {formatDuration(session.duration)}
                      {session.completed && (
                        <span className="activity-status completed">Completed</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="card">
        <div className="card-header">
          <h2>Data Management</h2>
        </div>
        
        <div className="data-management">
          <p className="text-muted mb-3">
            Manage your workout data, export options, and reset to default settings.
          </p>
          
          <div className="data-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => {
                const data = {
                  exercises: exerciseStorage.getAll(),
                  workouts: workoutStorage.getAll(),
                  sessions: sessionStorage.getAll(),
                  user: userStorage.get(),
                  exportDate: new Date().toISOString()
                };
                
                const dataStr = JSON.stringify(data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              📥 Export Data
            </button>
            
            <button 
              className="btn btn-warning"
              onClick={handleResetToDefault}
            >
              🔄 Reset to Default
            </button>
            
            <button 
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                  if (window.confirm('This will delete ALL your exercises, workouts, and sessions. Are you absolutely sure?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }
              }}
            >
              🗑️ Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;