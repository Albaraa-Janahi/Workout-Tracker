/**
 * Local storage utilities for the Workout Tracker app
 * Handles all data persistence using browser's localStorage
 */

// Storage keys
const STORAGE_KEYS = {
  EXERCISES: 'workout_tracker_exercises',
  WORKOUTS: 'workout_tracker_workouts',
  SESSIONS: 'workout_tracker_sessions',
  USER_PROFILE: 'workout_tracker_user_profile'
};

/**
 * Generic storage functions
 */
const storage = {
  // Save data to localStorage
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  // Load data from localStorage
  load: (key, defaultValue = null) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  },

  // Remove data from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  // Clear all app data
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

/**
 * Exercise storage functions
 */
export const exerciseStorage = {
  // Get all exercises
  getAll: () => {
    return storage.load(STORAGE_KEYS.EXERCISES, []);
  },

  // Save all exercises
  saveAll: (exercises) => {
    return storage.save(STORAGE_KEYS.EXERCISES, exercises);
  },

  // Add new exercise
  add: (exercise) => {
    const exercises = exerciseStorage.getAll();
    exercises.push(exercise);
    return exerciseStorage.saveAll(exercises);
  },

  // Update existing exercise
  update: (exerciseId, updatedExercise) => {
    const exercises = exerciseStorage.getAll();
    const index = exercises.findIndex(ex => ex.id === exerciseId);
    
    if (index >= 0) {
      exercises[index] = updatedExercise;
      return exerciseStorage.saveAll(exercises);
    }
    
    return false;
  },

  // Delete exercise
  delete: (exerciseId) => {
    const exercises = exerciseStorage.getAll();
    const filteredExercises = exercises.filter(ex => ex.id !== exerciseId);
    return exerciseStorage.saveAll(filteredExercises);
  },

  // Get exercise by ID
  getById: (exerciseId) => {
    const exercises = exerciseStorage.getAll();
    return exercises.find(ex => ex.id === exerciseId);
  }
};

/**
 * Workout storage functions
 */
export const workoutStorage = {
  // Get all workouts
  getAll: () => {
    return storage.load(STORAGE_KEYS.WORKOUTS, []);
  },

  // Save all workouts
  saveAll: (workouts) => {
    return storage.save(STORAGE_KEYS.WORKOUTS, workouts);
  },

  // Add new workout
  add: (workout) => {
    const workouts = workoutStorage.getAll();
    workouts.push(workout);
    return workoutStorage.saveAll(workouts);
  },

  // Update existing workout
  update: (workoutId, updatedWorkout) => {
    const workouts = workoutStorage.getAll();
    const index = workouts.findIndex(workout => workout.id === workoutId);
    
    if (index >= 0) {
      workouts[index] = updatedWorkout;
      return workoutStorage.saveAll(workouts);
    }
    
    return false;
  },

  // Delete workout
  delete: (workoutId) => {
    const workouts = workoutStorage.getAll();
    const filteredWorkouts = workouts.filter(workout => workout.id !== workoutId);
    return workoutStorage.saveAll(filteredWorkouts);
  },

  // Get workout by ID
  getById: (workoutId) => {
    const workouts = workoutStorage.getAll();
    return workouts.find(workout => workout.id === workoutId);
  }
};

/**
 * Workout session storage functions
 */
export const sessionStorage = {
  // Get all sessions
  getAll: () => {
    return storage.load(STORAGE_KEYS.SESSIONS, []);
  },

  // Save all sessions
  saveAll: (sessions) => {
    return storage.save(STORAGE_KEYS.SESSIONS, sessions);
  },

  // Add new session
  add: (session) => {
    const sessions = sessionStorage.getAll();
    sessions.push(session);
    return sessionStorage.saveAll(sessions);
  },

  // Update existing session
  update: (sessionId, updatedSession) => {
    const sessions = sessionStorage.getAll();
    const index = sessions.findIndex(session => session.id === sessionId);
    
    if (index >= 0) {
      sessions[index] = updatedSession;
      return sessionStorage.saveAll(sessions);
    }
    
    return false;
  },

  // Delete session
  delete: (sessionId) => {
    const sessions = sessionStorage.getAll();
    const filteredSessions = sessions.filter(session => session.id !== sessionId);
    return sessionStorage.saveAll(filteredSessions);
  },

  // Get session by ID
  getById: (sessionId) => {
    const sessions = sessionStorage.getAll();
    return sessions.find(session => session.id === sessionId);
  },

  // Get sessions by workout ID
  getByWorkoutId: (workoutId) => {
    const sessions = sessionStorage.getAll();
    return sessions.filter(session => session.workoutId === workoutId);
  },

  // Get latest session for a workout
  getLatestByWorkoutId: (workoutId) => {
    const sessions = sessionStorage.getByWorkoutId(workoutId);
    return sessions.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  }
};

/**
 * User profile storage functions
 */
export const userStorage = {
  // Get user profile
  get: () => {
    return storage.load(STORAGE_KEYS.USER_PROFILE, {
      id: 'user_1',
      name: 'Workout Tracker User',
      createdAt: new Date().toISOString()
    });
  },

  // Update user profile
  update: (profile) => {
    return storage.save(STORAGE_KEYS.USER_PROFILE, profile);
  }
};

/**
 * Utility functions for data analysis
 */
export const dataUtils = {
  // Get statistics for a specific workout
  getWorkoutStats: (workoutId) => {
    const sessions = sessionStorage.getByWorkoutId(workoutId);
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageDuration: 0,
        totalVolume: 0,
        completionRate: 0,
        lastWorkout: null
      };
    }

    const completedSessions = sessions.filter(session => session.completed);
    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalVolume = sessions.reduce((sum, session) => {
      // Handle both class instances and plain objects
      if (session.getTotalVolume && typeof session.getTotalVolume === 'function') {
        return sum + session.getTotalVolume();
      } else {
        // Calculate volume for plain objects
        const volume = (session.exercises || []).reduce((vol, ex) => {
          if (ex.sets && Array.isArray(ex.sets)) {
            return vol + ex.sets.reduce((setVol, set) => {
              const reps = typeof set.reps === 'number' ? set.reps : 0;
              return setVol + reps;
            }, 0);
          }
          return vol;
        }, 0);
        return sum + volume;
      }
    }, 0);

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      averageDuration: Math.round(totalDuration / sessions.length),
      totalVolume,
      completionRate: Math.round((completedSessions.length / sessions.length) * 100),
      lastWorkout: sessions.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    };
  },

  // Get overall statistics
  getOverallStats: () => {
    const sessions = sessionStorage.getAll();
    const workouts = workoutStorage.getAll();
    const exercises = exerciseStorage.getAll();

    const completedSessions = sessions.filter(session => session.completed);
    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalVolume = sessions.reduce((sum, session) => {
      // Handle both class instances and plain objects
      if (session.getTotalVolume && typeof session.getTotalVolume === 'function') {
        return sum + session.getTotalVolume();
      } else {
        // Calculate volume for plain objects
        const volume = (session.exercises || []).reduce((vol, ex) => {
          if (ex.sets && Array.isArray(ex.sets)) {
            return vol + ex.sets.reduce((setVol, set) => {
              const reps = typeof set.reps === 'number' ? set.reps : 0;
              return setVol + reps;
            }, 0);
          }
          return vol;
        }, 0);
        return sum + volume;
      }
    }, 0);

    return {
      totalWorkouts: workouts.length,
      totalExercises: exercises.length,
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      averageDuration: sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0,
      totalVolume,
      completionRate: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0
    };
  }
};

export default storage;