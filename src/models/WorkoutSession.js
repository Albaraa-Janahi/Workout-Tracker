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
  updateExerciseData(exerciseId, sets, reps) {
    const existingIndex = this.exercises.findIndex(ex => ex.exerciseId === exerciseId);
    const exerciseData = {
      exerciseId,
      sets: parseInt(sets) || 0,
      reps: parseInt(reps) || 0,
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

  // Get total volume (sets * reps)
  getTotalVolume() {
    return this.exercises.reduce((total, ex) => {
      return total + (ex.sets * ex.reps);
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
 * ExerciseSessionData model for tracking individual exercise performance
 */
export class ExerciseSessionData {
  constructor(exerciseId, sets = 0, reps = 0, previousSets = 0, previousReps = 0) {
    this.exerciseId = exerciseId;
    this.sets = sets;
    this.reps = reps;
    this.previousSets = previousSets;
    this.previousReps = previousReps;
    this.completed = false;
    this.completedAt = null;
  }

  // Static method to create from object
  static fromObject(obj) {
    const data = new ExerciseSessionData(
      obj.exerciseId,
      obj.sets || 0,
      obj.reps || 0,
      obj.previousSets || 0,
      obj.previousReps || 0
    );
    data.completed = obj.completed || false;
    data.completedAt = obj.completedAt;
    return data;
  }

  // Check if current performance is better than previous
  isImproved() {
    const currentVolume = this.sets * this.reps;
    const previousVolume = this.previousSets * this.previousReps;
    return currentVolume > previousVolume;
  }

  // Get improvement percentage
  getImprovementPercentage() {
    const currentVolume = this.sets * this.reps;
    const previousVolume = this.previousSets * this.previousReps;
    
    if (previousVolume === 0) return currentVolume > 0 ? 100 : 0;
    
    return Math.round(((currentVolume - previousVolume) / previousVolume) * 100);
  }
}