import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkoutSession, ExerciseSessionData, SetData } from '../models/WorkoutSession';
import { sessionStorage, workoutStorage, exerciseStorage } from '../utils/localStorage';

/**
 * Session Screen component
 * Handles workout session tracking with timer and exercise management
 */
function SessionScreen() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [session, setSession] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timer, setTimer] = useState(90); // Default 90 seconds (1:30)
  const [timerSlider, setTimerSlider] = useState(90); // Slider value (10s to 300s)
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerFinished, setIsTimerFinished] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [exerciseData, setExerciseData] = useState({});
  
  const timerRef = useRef(null);
  const timerElementRef = useRef(null);
  const audioContextRef = useRef(null);

  // Load workout and exercise data on component mount
  useEffect(() => {
    loadWorkoutData();
  }, [workoutId]);

  // Play notification sound
  const playNotificationSound = () => {
    if (!isSoundEnabled) return;
    
    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure the sound - alternating high/low pattern
      oscillator.type = 'sine';
      
      // Create beeping pattern: high-low-high-low (4 beeps total)
      const beepDuration = 0.3; // Each beep is 0.3 seconds
      const pauseDuration = 0.325; // Pause between beeps is 0.325 seconds
      const totalDuration = (beepDuration + pauseDuration) * 4; // Total: 2.5 seconds
      
      // Set frequencies for high-low pattern
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // High beep 1
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.625); // Low beep 1
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 1.25); // High beep 2
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 1.875); // Low beep 2
      
      // Set volume envelope for beeping pattern
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      
      // Beep 1 (high)
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.25);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      
      // Beep 2 (low)
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.675);
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.875);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.925);
      
      // Beep 3 (high)
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 1.3);
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 1.5);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.55);
      
      // Beep 4 (low)
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 1.925);
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 2.125);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2.175);
      
      // Play the pattern
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + totalDuration);
    } catch (error) {
      console.log('Audio not supported or blocked by browser');
    }
  };

  // Initialize session when workout data is loaded
  useEffect(() => {
    if (workout && exercises.length > 0) {
      initializeSession();
    }
  }, [workout, exercises]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setIsTimerFinished(true);
      // Play notification sound
      playNotificationSound();
      // Auto-scroll to timer when it finishes
      if (timerElementRef.current) {
        timerElementRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerRunning, timer]);

  // Get max reps for a specific level in an exercise (across all workouts)
  const getMaxRepsForLevel = (exerciseId, level) => {
    const allSessions = sessionStorage.getAll();
    let maxReps = 0;
    
    allSessions.forEach(session => {
      if (session.exercises) {
        const exerciseData = session.exercises.find(ex => ex.exerciseId === exerciseId);
        if (exerciseData && exerciseData.sets && Array.isArray(exerciseData.sets)) {
          exerciseData.sets.forEach(set => {
            if (set.level === level && set.reps > maxReps) {
              maxReps = set.reps;
            }
          });
        }
      }
    });
    
    return maxReps;
  };

  // Get last reps for a specific set and level (across all workouts)
  const getLastRepsForSetAndLevel = (exerciseId, setIndex, level) => {
    const allSessions = sessionStorage.getAll();
    
    // Sort sessions by date (most recent first)
    const sortedSessions = allSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (const session of sortedSessions) {
      if (session.exercises) {
        const exerciseData = session.exercises.find(ex => ex.exerciseId === exerciseId);
        if (exerciseData && exerciseData.sets && Array.isArray(exerciseData.sets)) {
          if (exerciseData.sets[setIndex] && exerciseData.sets[setIndex].level === level) {
            return exerciseData.sets[setIndex].reps;
          }
        }
      }
    }
    
    return 0;
  };

  // Load workout and exercise data
  const loadWorkoutData = () => {
    const workoutData = workoutStorage.getById(workoutId);
    const allExercises = exerciseStorage.getAll();
    
    if (!workoutData) {
      alert('Workout not found');
      navigate('/workouts');
      return;
    }

    setWorkout(workoutData);
    
    // Get exercise details for this workout
    const workoutExercises = allExercises.filter(ex => 
      workoutData.exercises.includes(ex.id)
    );
    setExercises(workoutExercises);
  };

  // Initialize new session
  const initializeSession = () => {
    const newSession = new WorkoutSession(
      Date.now().toString(),
      workoutId,
      new Date().toISOString(),
      []
    );

    // Initialize exercise data with previous performance
    const exerciseDataMap = {};
    exercises.forEach(exercise => {
      const latestSession = sessionStorage.getLatestByWorkoutId(workoutId);
      let previousSets = [];
      let defaultSets = [];

      if (latestSession) {
        const exerciseData = latestSession.exercises ? latestSession.exercises.find(ex => ex.exerciseId === exercise.id) : null;
        if (exerciseData && exerciseData.sets) {
          // Convert old format to new format if needed
          if (Array.isArray(exerciseData.sets)) {
            previousSets = exerciseData.sets.map(set => SetData.fromObject(set));
            // Use the last chosen level from previous session, or first available level
            const lastUsedLevel = previousSets.length > 0 ? previousSets[previousSets.length - 1].level : '';
            const defaultLevel = lastUsedLevel || (exercise.levels && exercise.levels.length > 0 ? exercise.levels[0] : '');
            
            // Create default sets with auto-populated reps from last performance across all workouts
            defaultSets = exerciseData.sets.map((set, index) => {
              const lastReps = getLastRepsForSetAndLevel(exercise.id, index, defaultLevel);
              return new SetData(lastReps, defaultLevel);
            });
          } else {
            // Legacy format - convert to new format
            const sets = exerciseData.sets || 0;
            const reps = exerciseData.reps || 0;
            const defaultLevel = exercise.levels && exercise.levels.length > 0 ? exercise.levels[0] : '';
            if (sets > 0) {
              for (let i = 0; i < sets; i++) {
                const setData = new SetData(reps, defaultLevel);
                previousSets.push(setData);
                // Auto-populate reps based on last workout for this set and level
                const lastReps = getLastRepsForSetAndLevel(exercise.id, i, defaultLevel);
                defaultSets.push(new SetData(lastReps, defaultLevel));
              }
            }
          }
        }
      }

      // If no previous data, create 3 default sets
      if (defaultSets.length === 0) {
        const defaultLevel = exercise.levels && exercise.levels.length > 0 ? exercise.levels[0] : '';
        for (let i = 0; i < 3; i++) {
          // Auto-populate reps based on last workout for this set and level
          const lastReps = getLastRepsForSetAndLevel(exercise.id, i, defaultLevel);
          defaultSets.push(new SetData(lastReps, defaultLevel));
        }
      }

      exerciseDataMap[exercise.id] = new ExerciseSessionData(
        exercise.id,
        defaultSets,
        previousSets
      );
    });

    setSession(newSession);
    setExerciseData(exerciseDataMap);
    setSessionStartTime(new Date());
  };

  // Handle timer controls
  const handleTimerStart = () => {
    setIsTimerRunning(true);
    setIsTimerFinished(false);
  };

  const handleTimerPause = () => {
    setIsTimerRunning(false);
  };

  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setIsTimerFinished(false);
    setTimer(timerSlider); // Reset to current slider value
  };

  const handleTimerSet = (seconds) => {
    setIsTimerRunning(false);
    setTimer(seconds);
  };

  const handleTimerSliderChange = (event) => {
    const newValue = parseInt(event.target.value);
    setTimerSlider(newValue);
    if (!isTimerRunning) {
      setTimer(newValue);
      setIsTimerFinished(false);
    }
  };

  const handleSoundToggle = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  // Handle set data updates
  const handleSetDataChange = (exerciseId, setIndex, field, value) => {
    setExerciseData(prev => {
      const newData = { ...prev };
      const exerciseData = { ...newData[exerciseId] };
      const sets = [...exerciseData.sets];
      
      if (sets[setIndex]) {
        sets[setIndex] = { ...sets[setIndex], [field]: value };
        
        // If level changed, auto-populate reps from last workout for this set and level
        if (field === 'level') {
          const lastReps = getLastRepsForSetAndLevel(exerciseId, setIndex, value);
          sets[setIndex].reps = lastReps;
        }
        
        exerciseData.sets = sets;
        newData[exerciseId] = exerciseData;
      }
      
      return newData;
    });
  };

  // Add a new set to an exercise
  const handleAddSet = (exerciseId) => {
    setExerciseData(prev => {
      const newData = { ...prev };
      const exerciseData = { ...newData[exerciseId] };
      const sets = [...exerciseData.sets];
      
      // Get the exercise to find available levels
      const exercise = exercises.find(ex => ex.id === exerciseId);
      const defaultLevel = exercise && exercise.levels && exercise.levels.length > 0 ? exercise.levels[0] : '';
      
      sets.push(new SetData(0, defaultLevel));
      exerciseData.sets = sets;
      newData[exerciseId] = exerciseData;
      
      return newData;
    });
  };

  // Remove a set from an exercise
  const handleRemoveSet = (exerciseId, setIndex) => {
    setExerciseData(prev => {
      const newData = { ...prev };
      const exerciseData = { ...newData[exerciseId] };
      const sets = [...exerciseData.sets];
      
      if (sets.length > 1) { // Don't remove the last set
        sets.splice(setIndex, 1);
        exerciseData.sets = sets;
        newData[exerciseId] = exerciseData;
      }
      
      return newData;
    });
  };

  // Handle exercise completion
  const handleExerciseComplete = (exerciseId) => {
    const data = exerciseData[exerciseId];
    const hasCompletedSets = data.sets.some(set => set.reps > 0);
    
    if (hasCompletedSets) {
      // Update exercise data
      setExerciseData(prev => ({
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          completed: true,
          completedAt: new Date().toISOString()
        }
      }));

      // Move to next exercise
      const nextIndex = currentExerciseIndex + 1;
      if (nextIndex < exercises.length) {
        setCurrentExerciseIndex(nextIndex);
      }
    } else {
      alert('Please complete at least one set with reps before completing the exercise');
    }
  };

  // Handle session completion
  const handleSessionComplete = () => {
    if (!session) return;

    const completedExercises = Object.values(exerciseData).filter(ex => ex.completed);
    
    if (completedExercises.length === 0) {
      alert('Please complete at least one exercise before finishing the session');
      return;
    }

    const endTime = new Date();
    const duration = sessionStartTime ? 
      Math.round((endTime - sessionStartTime) / 60000) : 0; // Duration in minutes

    const completedSession = {
      ...session,
      exercises: Object.values(exerciseData).map(data => ({
        exerciseId: data.exerciseId,
        sets: data.sets,
        completed: data.completed,
        completedAt: data.completedAt
      })),
      duration,
      completed: true
    };

    // Save session to localStorage
    sessionStorage.add(completedSession);

    // Show completion message and navigate back
    alert(`Session completed! Duration: ${duration} minutes`);
    navigate('/workouts');
  };

  // Format timer display
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current exercise
  const getCurrentExercise = () => {
    return exercises[currentExerciseIndex] || null;
  };

  // Get exercise completion percentage
  const getCompletionPercentage = () => {
    const completedCount = Object.values(exerciseData).filter(ex => ex.completed).length;
    return Math.round((completedCount / exercises.length) * 100);
  };

  // Get total volume
  const getTotalVolume = () => {
    return Object.values(exerciseData).reduce((total, ex) => {
      if (ex.sets && Array.isArray(ex.sets)) {
        return total + ex.sets.reduce((setTotal, set) => {
          const reps = typeof set.reps === 'number' ? set.reps : 0;
          return setTotal + reps;
        }, 0);
      }
      return total;
    }, 0);
  };

  if (!workout || !session || exercises.length === 0) {
    return (
      <div className="container">
        <div className="text-center">
          <p>Loading workout session...</p>
        </div>
      </div>
    );
  }

  const currentExercise = getCurrentExercise();

  return (
    <div className="container">
      <div className="session-header">
        <h1>🏋️ Workout Session</h1>
        <p>Track your progress and stay motivated!</p>
      </div>

      {/* Session Info */}
      <div className="session-info">
        <h2>{workout.name}</h2>
        <p>
          Exercise {currentExerciseIndex + 1} of {exercises.length} • 
          {workout.recommendedDay && ` Recommended: ${workout.recommendedDay}`}
        </p>
      </div>

      {/* Timer */}
      <div className={`timer ${isTimerFinished ? 'timer-finished' : ''}`} ref={timerElementRef}>
        <button 
          className="sound-toggle"
          onClick={handleSoundToggle}
          title={isSoundEnabled ? 'Sound On - Click to turn off' : 'Sound Off - Click to turn on'}
        >
          {isSoundEnabled ? '🔊' : '🔇'}
        </button>
        <div className="timer-display">{formatTimer(timer)}</div>
        <div className="timer-controls">
          <button 
            className="btn btn-primary"
            onClick={isTimerRunning ? handleTimerPause : handleTimerStart}
          >
            {isTimerRunning ? '⏸️ Pause' : '▶️ Start'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleTimerReset}
          >
            🔄 Reset
          </button>
        </div>
        <div className="timer-slider-container">
          <label className="timer-slider-label">
            Set Timer Duration: {formatTimer(timerSlider)}
          </label>
          <input
            type="range"
            min="10"
            max="300"
            value={timerSlider}
            onChange={handleTimerSliderChange}
            className="timer-slider"
            disabled={isTimerRunning}
          />
          <div className="timer-slider-labels">
            <span>10s</span>
            <span>5:00</span>
          </div>
        </div>
      </div>

      {/* Session Controls */}
      <div className="session-controls">
        <button 
          className="btn btn-success"
          onClick={handleSessionComplete}
        >
          ✅ Complete Session
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/workouts')}
        >
          🚪 Exit Session
        </button>
      </div>

      {/* Exercise Table */}
      <div className="exercise-table">
        <table className="table">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Set</th>
              <th>Reps</th>
              <th>Max</th>
              <th className="level-header-cell">Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise, index) => {
              const data = exerciseData[exercise.id];
              const isCurrent = index === currentExerciseIndex;
              const isCompleted = data.completed;
              
              return (
                <React.Fragment key={exercise.id}>
                  {/* Set rows */}
                  {data.sets.map((set, setIndex) => (
                    <tr key={`${exercise.id}-set-${setIndex}`} className={`set-row ${isCurrent ? 'exercise-current' : ''} ${isCompleted ? 'exercise-completed' : ''}`}>
                      {setIndex === 0 && (
                        <td className="exercise-name-cell" rowSpan={data.sets.length}>
                          <div className="exercise-header-content">
                            <div className="exercise-name">
                              {exercise.name}
                              {isCurrent && <span className="current-indicator">👈 Current</span>}
                            </div>
                            <span className={`exercise-type exercise-type-${exercise.type.toLowerCase()}`}>
                              {exercise.type}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="set-number">Set {setIndex + 1}</td>
                      <td>
                        <input
                          type="number"
                          className="exercise-input"
                          value={set.reps}
                          onChange={(e) => handleSetDataChange(exercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)}
                          min="0"
                          disabled={isCompleted}
                          placeholder="0"
                        />
                      </td>
                      <td className="max-reps-cell">
                        <div className="max-reps-display">
                          {getMaxRepsForLevel(exercise.id, set.level)}
                        </div>
                      </td>
                      <td className="level-cell">
                        {exercise.levels && exercise.levels.length > 0 ? (
                          <select
                            className="exercise-input"
                            value={set.level}
                            onChange={(e) => handleSetDataChange(exercise.id, setIndex, 'level', e.target.value)}
                            disabled={isCompleted}
                          >
                            {exercise.levels.map((level, levelIndex) => (
                              <option key={levelIndex} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-muted">No levels</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveSet(exercise.id, setIndex)}
                          disabled={isCompleted || data.sets.length <= 1}
                          title="Remove this set"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Exercise controls row */}
                  <tr className={`exercise-controls-row ${isCompleted ? 'exercise-completed' : ''}`}>
                    <td colSpan="6">
                      <div className="exercise-controls">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleAddSet(exercise.id)}
                          disabled={isCompleted}
                          title="Add Set"
                        >
                          ➕ Add Set
                        </button>
                        <span className="set-count">{data.sets.length} sets</span>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveSet(exercise.id, data.sets.length - 1)}
                          disabled={isCompleted || data.sets.length <= 1}
                          title="Remove Last Set"
                        >
                          ➖ Remove Set
                        </button>
                        <button
                          className="complete-btn"
                          onClick={() => handleExerciseComplete(exercise.id)}
                          disabled={isCompleted || !data.sets.some(set => set.reps > 0)}
                        >
                          {isCompleted ? '✅ Done' : 
                           !data.sets.some(set => set.reps > 0) ? 'Complete Exercise' : '✓ Complete Exercise'}
                        </button>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Session Summary */}
      <div className="session-summary">
        <h3>Session Progress</h3>
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="summary-stat-number">{getCompletionPercentage()}%</div>
            <div className="summary-stat-label">Complete</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-number">{Object.values(exerciseData).filter(ex => ex.completed).length}</div>
            <div className="summary-stat-label">Exercises Done</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-number">{getTotalVolume()}</div>
            <div className="summary-stat-label">Total Volume</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-number">{currentExerciseIndex + 1}</div>
            <div className="summary-stat-label">Current Exercise</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionScreen;