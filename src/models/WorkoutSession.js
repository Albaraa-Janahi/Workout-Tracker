/**
 * WorkoutSession model for the Workout Tracker app
 * Represents a single workout session with exercise tracking
 */
export class WorkoutSession {
  constructor(id, workoutId, date, exercises = []) {
    this.id = id;
    this.workoutId = workoutId;
    this.date = date; // ISO string
    this.exercises = exercises; // Array of exercise session data
    this.duration = 0; // in minutes
    this.completed = false;
    this.createdAt = new Date().toISOString();
  }

  // Static method to create workout session from object
  static fromObject(obj) {
    const session = new WorkoutSession(
      obj.id,
      obj.workoutId,
      obj.date,
      obj.exercises || []
    );
    session.duration = obj.duration || 0;
    session.completed = obj.completed || false;
    session.createdAt = obj.createdAt;
    return session;
  }

  // Add or update exercise data in the session
  updateExerciseData(exerciseId, sets) {
    const existingIndex = this.exercises.findIndex(ex => ex.exerciseId === exerciseId);
    const exerciseData = {
      exerciseId,
      sets: sets, // Array of SetData objects
      completed: true,
      completedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.exercises[existingIndex] = exerciseData;
    } else {
      this.exercises.push(exerciseData);
    }
  }

  // Mark exercise as completed
  markExerciseCompleted(exerciseId) {
    const exercise = this.exercises.find(ex => ex.exerciseId === exerciseId);
    if (exercise) {
      exercise.completed = true;
      exercise.completedAt = new Date().toISOString();
    }
  }

  // Get completion percentage
  getCompletionPercentage(totalExercises) {
    if (totalExercises === 0) return 0;
    const completedExercises = this.exercises.filter(ex => ex.completed).length;
    return Math.round((completedExercises / totalExercises) * 100);
  }

  // Get total volume (total reps across all sets)
  getTotalVolume() {
    return this.exercises.reduce((total, ex) => {
      if (ex.sets && Array.isArray(ex.sets)) {
        return total + ex.sets.reduce((setTotal, set) => setTotal + (set.reps || 0), 0);
      }
      return total;
    }, 0);
  }

  // Check if session is complete
  isComplete(totalExercises) {
    return this.exercises.length === totalExercises && 
           this.exercises.every(ex => ex.completed);
  }

  // Get exercise data for a specific exercise
  getExerciseData(exerciseId) {
    return this.exercises.find(ex => ex.exerciseId === exerciseId);
  }
}

/**
 * SetData model for tracking individual set performance
 */
export class SetData {
  constructor(reps = 0, level = '', completed = false) {
    this.reps = reps;
    this.level = level;
    this.completed = completed;
    this.completedAt = null;
  }

  // Static method to create from object
  static fromObject(obj) {
    const setData = new SetData(
      obj.reps || 0,
      obj.level || '',
      obj.completed || false
    );
    setData.completedAt = obj.completedAt;
    return setData;
  }

  // Mark set as completed
  markCompleted() {
    this.completed = true;
    this.completedAt = new Date().toISOString();
  }
}

/**
 * ExerciseSessionData model for tracking individual exercise performance
 */
export class ExerciseSessionData {
  constructor(exerciseId, sets = [], previousSets = []) {
    this.exerciseId = exerciseId;
    this.sets = sets; // Array of SetData objects
    this.previousSets = previousSets; // Array of previous SetData objects
    this.completed = false;
    this.completedAt = null;
  }

  // Static method to create from object
  static fromObject(obj) {
    const data = new ExerciseSessionData(
      obj.exerciseId,
      obj.sets ? obj.sets.map(set => SetData.fromObject(set)) : [],
      obj.previousSets ? obj.previousSets.map(set => SetData.fromObject(set)) : []
    );
    data.completed = obj.completed || false;
    data.completedAt = obj.completedAt;
    return data;
  }

  // Add a new set
  addSet(reps = 0, level = '') {
    this.sets.push(new SetData(reps, level));
  }

  // Remove a set by index
  removeSet(index) {
    if (index >= 0 && index < this.sets.length) {
      this.sets.splice(index, 1);
    }
  }

  // Update a set
  updateSet(index, reps, level) {
    if (index >= 0 && index < this.sets.length) {
      this.sets[index].reps = reps;
      this.sets[index].level = level;
    }
  }

  // Get total reps across all sets
  getTotalReps() {
    return this.sets.reduce((total, set) => total + set.reps, 0);
  }

  // Get number of sets
  getSetCount() {
    return this.sets.length;
  }

  // Get completed sets count
  getCompletedSetsCount() {
    return this.sets.filter(set => set.completed).length;
  }

  // Check if all sets are completed
  areAllSetsCompleted() {
    return this.sets.length > 0 && this.sets.every(set => set.completed);
  }

  // Check if current performance is better than previous
  isImproved() {
    const currentVolume = this.getTotalReps();
    const previousVolume = this.previousSets.reduce((total, set) => total + set.reps, 0);
    return currentVolume > previousVolume;
  }

  // Get improvement percentage
  getImprovementPercentage() {
    const currentVolume = this.getTotalReps();
    const previousVolume = this.previousSets.reduce((total, set) => total + set.reps, 0);
    
    if (previousVolume === 0) return currentVolume > 0 ? 100 : 0;
    
    return Math.round(((currentVolume - previousVolume) / previousVolume) * 100);
  }
}