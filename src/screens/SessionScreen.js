import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkoutSession, ExerciseSessionData } from '../models/WorkoutSession';
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
      let previousSets = 0;
      let previousReps = 0;

      if (latestSession) {
        const exerciseData = latestSession.getExerciseData(exercise.id);
        if (exerciseData) {
          previousSets = exerciseData.sets;
          previousReps = exerciseData.reps;
        }
      }

      exerciseDataMap[exercise.id] = new ExerciseSessionData(
        exercise.id,
        0,
        0,
        previousSets,
        previousReps
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

  // Handle exercise data updates
  const handleExerciseDataChange = (exerciseId, field, value) => {
    setExerciseData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: parseInt(value) || 0
      }
    }));
  };

  // Handle exercise completion
  const handleExerciseComplete = (exerciseId) => {
    const data = exerciseData[exerciseId];
    if (data.sets > 0 && data.reps > 0) {
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
      alert('Please enter both sets and reps before completing the exercise');
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
        reps: data.reps,
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
      return total + (ex.sets * ex.reps);
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
              <th>Type</th>
              <th>Previous</th>
              <th>Sets</th>
              <th>Reps</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise, index) => {
              const data = exerciseData[exercise.id];
              const isCurrent = index === currentExerciseIndex;
              const isCompleted = data.completed;
              
              return (
                <tr 
                  key={exercise.id}
                  className={`${isCurrent ? 'exercise-current' : ''} ${isCompleted ? 'exercise-completed' : ''}`}
                >
                  <td className="exercise-name-cell">
                    {exercise.name}
                    {isCurrent && <span style={{ marginLeft: '10px', color: '#007bff' }}>👈 Current</span>}
                  </td>
                  <td>
                    <span className={`exercise-type-cell exercise-type-${exercise.type.toLowerCase()}`}>
                      {exercise.type}
                    </span>
                  </td>
                  <td>
                    {data.previousSets > 0 && data.previousReps > 0 ? (
                      <span className="text-muted">
                        {data.previousSets} × {data.previousReps}
                      </span>
                    ) : (
                      <span className="text-muted">First time</span>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      className="exercise-input"
                      value={data.sets}
                      onChange={(e) => handleExerciseDataChange(exercise.id, 'sets', e.target.value)}
                      min="0"
                      disabled={isCompleted}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="exercise-input"
                      value={data.reps}
                      onChange={(e) => handleExerciseDataChange(exercise.id, 'reps', e.target.value)}
                      min="0"
                      disabled={isCompleted}
                    />
                  </td>
                  <td>
                    <div className="exercise-actions">
                      <button
                        className="complete-btn"
                        onClick={() => handleExerciseComplete(exercise.id)}
                        disabled={isCompleted || data.sets === 0 || data.reps === 0}
                      >
                        {isCompleted ? '✅ Done' : '✓ Complete'}
                      </button>
                    </div>
                  </td>
                </tr>
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