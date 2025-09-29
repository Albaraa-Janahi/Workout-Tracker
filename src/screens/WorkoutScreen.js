import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Workout } from '../models/Workout';
import { workoutStorage, exerciseStorage } from '../utils/localStorage';

/**
 * Workout Screen component
 * Handles creating, editing, and deleting workouts
 */
function WorkoutScreen() {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    exercises: [],
    recommendedDay: ''
  });
  const [errors, setErrors] = useState([]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load workouts and exercises from localStorage
  const loadData = () => {
    const loadedWorkouts = workoutStorage.getAll();
    const loadedExercises = exerciseStorage.getAll();
    
    // Convert plain objects back to Workout class instances
    const workoutInstances = loadedWorkouts.map(workoutData => 
      Workout.fromObject(workoutData)
    );
    
    setWorkouts(workoutInstances);
    setExercises(loadedExercises);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Handle exercise selection
  const handleExerciseToggle = (exerciseId) => {
    setFormData(prev => {
      const newExercises = prev.exercises.includes(exerciseId)
        ? prev.exercises.filter(id => id !== exerciseId)
        : [...prev.exercises, exerciseId];
      
      return {
        ...prev,
        exercises: newExercises
      };
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = Workout.validate(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (editingWorkout) {
      // Update existing workout
      const updatedWorkout = {
        ...editingWorkout,
        ...formData
      };
      
      // Update muscles covered based on selected exercises
      updatedWorkout.updateMusclesCovered(exercises);
      
      if (workoutStorage.update(editingWorkout.id, updatedWorkout)) {
        loadData();
        resetForm();
      }
    } else {
      // Create new workout
      const newWorkout = new Workout(
        Date.now().toString(), // Simple ID generation
        formData.name,
        formData.exercises,
        formData.recommendedDay
      );
      
      // Update muscles covered based on selected exercises
      newWorkout.updateMusclesCovered(exercises);
      
      if (workoutStorage.add(newWorkout)) {
        loadData();
        resetForm();
      }
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      exercises: [],
      recommendedDay: ''
    });
    setEditingWorkout(null);
    setShowForm(false);
    setErrors([]);
  };

  // Handle edit workout
  const handleEdit = (workout) => {
    setFormData({
      name: workout.name,
      exercises: [...workout.exercises],
      recommendedDay: workout.recommendedDay
    });
    setEditingWorkout(workout);
    setShowForm(true);
  };

  // Handle delete workout
  const handleDelete = (workoutId) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      if (workoutStorage.delete(workoutId)) {
        loadData();
      }
    }
  };

  // Handle start workout session
  const handleStartWorkout = (workoutId) => {
    // Navigate to session screen
    window.location.href = `/session/${workoutId}`;
  };

  // Get exercises by type for display
  const getExercisesByType = (type) => {
    return exercises.filter(exercise => exercise.type === type);
  };

  // Get selected exercises for display
  const getSelectedExercises = () => {
    return exercises.filter(exercise => formData.exercises.includes(exercise.id));
  };

  return (
    <div className="container">
      <div className="screen-header">
        <h1>🏋️ Workout Management</h1>
        <p>Create and manage your workout routines</p>
      </div>

      {/* Add/Edit Workout Form */}
      {showForm && (
        <div className="card">
          <div className="form-header">
            <h2>{editingWorkout ? 'Edit Workout' : 'Add New Workout'}</h2>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Display validation errors */}
            {errors.length > 0 && (
              <div className="error-messages">
                {errors.map((error, index) => (
                  <div key={index} className="error-message">
                    {error}
                  </div>
                ))}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Workout Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Upper Body Strength, Full Body HIIT"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="recommendedDay" className="form-label">
                Recommended Day
              </label>
              <select
                id="recommendedDay"
                name="recommendedDay"
                className="form-select"
                value={formData.recommendedDay}
                onChange={handleInputChange}
              >
                <option value="">Select day (optional)</option>
                {Workout.getDaysOfWeek().map(day => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Select Exercises * ({formData.exercises.length} selected)
              </label>
              
              {exercises.length === 0 ? (
                <div className="empty-state">
                  <p>No exercises available. <Link to="/exercises">Create some exercises first</Link>.</p>
                </div>
              ) : (
                <div className="exercise-selection">
                  {/* Main Exercises */}
                  {getExercisesByType('Main').length > 0 && (
                    <div className="exercise-category">
                      <h4>🏋️ Main Exercises</h4>
                      {getExercisesByType('Main').map(exercise => (
                        <ExerciseOption
                          key={exercise.id}
                          exercise={exercise}
                          isSelected={formData.exercises.includes(exercise.id)}
                          onToggle={handleExerciseToggle}
                        />
                      ))}
                    </div>
                  )}

                  {/* Warmup Exercises */}
                  {getExercisesByType('Warmup').length > 0 && (
                    <div className="exercise-category">
                      <h4>🔥 Warmup Exercises</h4>
                      {getExercisesByType('Warmup').map(exercise => (
                        <ExerciseOption
                          key={exercise.id}
                          exercise={exercise}
                          isSelected={formData.exercises.includes(exercise.id)}
                          onToggle={handleExerciseToggle}
                        />
                      ))}
                    </div>
                  )}

                  {/* Stretching Exercises */}
                  {getExercisesByType('Stretching').length > 0 && (
                    <div className="exercise-category">
                      <h4>🤸 Stretching Exercises</h4>
                      {getExercisesByType('Stretching').map(exercise => (
                        <ExerciseOption
                          key={exercise.id}
                          exercise={exercise}
                          isSelected={formData.exercises.includes(exercise.id)}
                          onToggle={handleExerciseToggle}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Exercises Summary */}
              {formData.exercises.length > 0 && (
                <div className="selected-exercises">
                  <h4>Selected Exercises ({formData.exercises.length})</h4>
                  <div className="muscle-tags">
                    {getSelectedExercises().map(exercise => (
                      <span key={exercise.id} className="muscle-tag">
                        {exercise.name} ({exercise.type})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingWorkout ? 'Update Workout' : 'Add Workout'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workout List */}
      <div className="card">
        <div className="card-header">
          <h2>Your Workouts ({workouts.length})</h2>
          {!showForm && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              ➕ Add Workout
            </button>
          )}
        </div>

        {workouts.length === 0 ? (
          <div className="empty-state">
            <p>No workouts created yet. Add your first workout to get started!</p>
          </div>
        ) : (
          <div className="workout-grid">
            {workouts.map(workout => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                exercises={exercises}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStart={handleStartWorkout}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Exercise Option component for workout form
 */
function ExerciseOption({ exercise, isSelected, onToggle }) {
  return (
    <div 
      className={`exercise-option ${isSelected ? 'selected' : ''}`}
      onClick={() => onToggle(exercise.id)}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(exercise.id)}
      />
      <div className="exercise-option-info">
        <div className="exercise-option-name">{exercise.name}</div>
        <div className="exercise-option-details">
          {exercise.type} • 🎯 {exercise.targetMuscle}
          {exercise.secondaryMuscle && ` • 💪 ${exercise.secondaryMuscle}`}
        </div>
      </div>
    </div>
  );
}

/**
 * Workout Card component
 * Displays individual workout information with actions
 */
function WorkoutCard({ workout, exercises, onEdit, onDelete, onStart }) {
  // Get exercise details for this workout
  const workoutExercises = exercises.filter(ex => workout.exercises.includes(ex.id));
  const exerciseCounts = workout.getExerciseCountByType(exercises);

  return (
    <div className="workout-card">
      <div className="workout-header">
        <h3 className="workout-name">{workout.name}</h3>
        {workout.recommendedDay && (
          <span className="workout-day">{workout.recommendedDay}</span>
        )}
      </div>

      <div className="workout-stats">
        <span>📊 {workoutExercises.length} exercises</span>
        <span>🏋️ {exerciseCounts.Main} main</span>
        <span>🔥 {exerciseCounts.Warmup} warmup</span>
        <span>🤸 {exerciseCounts.Stretching} stretching</span>
      </div>

      {workout.musclesCovered.length > 0 && (
        <div className="workout-muscles">
          <h4>Muscles Covered</h4>
          <div className="muscle-tags">
            {workout.musclesCovered.map(muscle => (
              <span key={muscle} className="muscle-tag">
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="workout-actions">
        <button 
          className="btn btn-success btn-sm"
          onClick={() => onStart(workout.id)}
        >
          ▶️ Start Workout
        </button>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(workout)}
        >
          ✏️ Edit
        </button>
        <button 
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(workout.id)}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

export default WorkoutScreen;