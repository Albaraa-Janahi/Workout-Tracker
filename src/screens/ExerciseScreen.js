import React, { useState, useEffect } from 'react';
import { Exercise } from '../models/Exercise';
import { exerciseStorage } from '../utils/localStorage';

/**
 * Exercise Screen component
 * Handles creating, editing, and deleting exercises
 */
function ExerciseScreen() {
  const [exercises, setExercises] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Main',
    targetMuscle: '',
    secondaryMuscle: '',
    levels: ['Standard'] // Default level
  });
  const [errors, setErrors] = useState([]);

  // Load exercises on component mount
  useEffect(() => {
    loadExercises();
  }, []);

  // Load exercises from localStorage
  const loadExercises = () => {
    const loadedExercises = exerciseStorage.getAll();
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

  // Handle level management
  const handleAddLevel = () => {
    setFormData(prev => ({
      ...prev,
      levels: [...prev.levels, '']
    }));
  };

  const handleLevelChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.map((level, i) => i === index ? value : level)
    }));
  };

  const handleRemoveLevel = (index) => {
    // Prevent removing the last level
    if (formData.levels.length <= 1) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = Exercise.validate(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (editingExercise) {
      // Update existing exercise
      const filteredLevels = formData.levels.filter(level => level.trim() !== '');
      const levels = filteredLevels.length > 0 ? filteredLevels : ['Standard']; // Ensure at least one level
      
      const updatedExercise = {
        ...editingExercise,
        ...formData,
        levels
      };
      
      if (exerciseStorage.update(editingExercise.id, updatedExercise)) {
        loadExercises();
        resetForm();
      }
    } else {
      // Create new exercise
      const filteredLevels = formData.levels.filter(level => level.trim() !== '');
      const levels = filteredLevels.length > 0 ? filteredLevels : ['Standard']; // Ensure at least one level
      
      const newExercise = new Exercise(
        Date.now().toString(), // Simple ID generation
        formData.name,
        formData.type,
        formData.targetMuscle,
        formData.secondaryMuscle,
        levels
      );
      
      if (exerciseStorage.add(newExercise)) {
        loadExercises();
        resetForm();
      }
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Main',
      targetMuscle: '',
      secondaryMuscle: '',
      levels: ['Standard'] // Default level
    });
    setEditingExercise(null);
    setShowForm(false);
    setErrors([]);
  };

  // Handle edit exercise
  const handleEdit = (exercise) => {
    setFormData({
      name: exercise.name,
      type: exercise.type,
      targetMuscle: exercise.targetMuscle,
      secondaryMuscle: exercise.secondaryMuscle,
      levels: exercise.levels && exercise.levels.length > 0 ? exercise.levels : ['Standard']
    });
    setEditingExercise(exercise);
    setShowForm(true);
  };

  // Handle delete exercise
  const handleDelete = (exerciseId) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      if (exerciseStorage.delete(exerciseId)) {
        loadExercises();
      }
    }
  };

  // Get exercises by type
  const getExercisesByType = (type) => {
    return exercises.filter(exercise => exercise.type === type);
  };

  return (
    <div className="container">
      <div className="screen-header">
        <h1>💪 Exercise Management</h1>
        <p>Create and manage your calisthenics exercises</p>
      </div>

      {/* Add/Edit Exercise Form */}
      {showForm && (
        <div className="card">
          <div className="form-header">
            <h2>{editingExercise ? 'Edit Exercise' : 'Add New Exercise'}</h2>
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
                Exercise Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Push-ups, Pull-ups, Squats"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type" className="form-label">
                Exercise Type *
              </label>
              <select
                id="type"
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                {Exercise.getTypes().map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="targetMuscle" className="form-label">
                Target Muscle *
              </label>
              <select
                id="targetMuscle"
                name="targetMuscle"
                className="form-select"
                value={formData.targetMuscle}
                onChange={handleInputChange}
                required
              >
                <option value="">Select target muscle</option>
                {Exercise.getMuscleGroups().map(muscle => (
                  <option key={muscle} value={muscle}>
                    {muscle}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="secondaryMuscle" className="form-label">
                Secondary Muscle
              </label>
              <select
                id="secondaryMuscle"
                name="secondaryMuscle"
                className="form-select"
                value={formData.secondaryMuscle}
                onChange={handleInputChange}
              >
                <option value="">Select secondary muscle (optional)</option>
                {Exercise.getMuscleGroups().map(muscle => (
                  <option key={muscle} value={muscle}>
                    {muscle}
                  </option>
                ))}
              </select>
            </div>

            {/* Exercise Levels */}
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label">
                  Exercise Levels (for progression)
                </label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddLevel}
                >
                  ➕ Add Level
                </button>
              </div>
              <div className="levels-container">
                {formData.levels.map((level, index) => (
                  <div key={index} className="level-input-group">
                    <div className="level-number">Level {index + 1}:</div>
                    <input
                      type="text"
                      className="form-control level-input"
                      value={level}
                      onChange={(e) => handleLevelChange(index, e.target.value)}
                      placeholder={`e.g., ${index === 0 ? 'Standard' : index === 1 ? 'Low Decline' : index === 2 ? 'Medium Decline' : 'High Decline'}`}
                    />
                    <button
                      type="button"
                      className={`btn btn-sm level-remove ${formData.levels.length <= 1 ? 'btn-secondary' : 'btn-danger'}`}
                      onClick={() => handleRemoveLevel(index)}
                      disabled={formData.levels.length <= 1}
                      title={formData.levels.length <= 1 ? 'At least one level is required' : 'Remove level'}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                {formData.levels.length === 1 && (
                  <div className="levels-help-message">
                    <p><em>💡 Tip: Add more levels to create exercise progressions (e.g., Standard → Low Decline → Medium Decline → High Decline)</em></p>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingExercise ? 'Update Exercise' : 'Add Exercise'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exercise List */}
      <div className="card">
        <div className="card-header">
          <h2>Your Exercises ({exercises.length})</h2>
          {!showForm && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              ➕ Add Exercise
            </button>
          )}
        </div>

        {exercises.length === 0 ? (
          <div className="empty-state">
            <p>No exercises created yet. Add your first exercise to get started!</p>
          </div>
        ) : (
          <div className="exercises-grid">
            {/* Main Exercises */}
            {getExercisesByType('Main').length > 0 && (
              <div className="exercise-category">
                <h3>🏋️ Main Exercises ({getExercisesByType('Main').length})</h3>
                <div className="exercise-list">
                  {getExercisesByType('Main').map(exercise => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Warmup Exercises */}
            {getExercisesByType('Warmup').length > 0 && (
              <div className="exercise-category">
                <h3>🔥 Warmup Exercises ({getExercisesByType('Warmup').length})</h3>
                <div className="exercise-list">
                  {getExercisesByType('Warmup').map(exercise => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stretching Exercises */}
            {getExercisesByType('Stretching').length > 0 && (
              <div className="exercise-category">
                <h3>🤸 Stretching Exercises ({getExercisesByType('Stretching').length})</h3>
                <div className="exercise-list">
                  {getExercisesByType('Stretching').map(exercise => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Exercise Card component
 * Displays individual exercise information with edit/delete actions
 */
function ExerciseCard({ exercise, onEdit, onDelete }) {
  return (
    <div className="exercise-card">
      <div className="exercise-info">
        <h4 className="exercise-name">{exercise.name}</h4>
        <div className="exercise-details">
          <span className="exercise-type">{exercise.type}</span>
          <span className="exercise-muscle">🎯 {exercise.targetMuscle}</span>
          {exercise.secondaryMuscle && (
            <span className="exercise-muscle secondary">💪 {exercise.secondaryMuscle}</span>
          )}
        </div>
        {exercise.levels && exercise.levels.length > 0 && (
          <div className="exercise-levels">
            <div className="levels-label">📈 Levels:</div>
            <div className="levels-list">
              {exercise.levels.map((level, index) => (
                <span key={index} className="level-badge">
                  Level {index + 1}: {level}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="exercise-actions">
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(exercise)}
        >
          ✏️ Edit
        </button>
        <button 
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(exercise.id)}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

export default ExerciseScreen;