/**
 * Sample data for initializing the Workout Tracker app
 * This provides some example exercises and workouts to get started
 */

import { Exercise } from '../models/Exercise';
import { Workout } from '../models/Workout';

// Sample exercises for calisthenics
export const sampleExercises = [
  new Exercise('1', 'Push-ups', 'Main', 'Chest', 'Arms', [
    'Standard Push-ups',
    'Low Decline Push-ups',
    'Medium Decline Push-ups',
    'High Decline Push-ups',
    'Diamond Push-ups',
    'Archer Push-ups'
  ]),
  new Exercise('2', 'Pull-ups', 'Main', 'Back', 'Arms', [
    'Assisted Pull-ups',
    'Standard Pull-ups',
    'Wide Grip Pull-ups',
    'Close Grip Pull-ups',
    'L-Sit Pull-ups',
    'Archer Pull-ups'
  ]),
  new Exercise('3', 'Squats', 'Main', 'Legs', 'Glutes', [
    'Standard Squats',
    'Jump Squats',
    'Pistol Squats (Assisted)',
    'Pistol Squats',
    'Shrimp Squats',
    'Dragon Squats'
  ]),
  new Exercise('4', 'Plank', 'Main', 'Core', '', [
    'Standard Plank',
    'Forearm Plank',
    'Side Plank',
    'Plank to Push-up',
    'Plank Jacks',
    'One-Arm Plank'
  ]),
  new Exercise('5', 'Burpees', 'Main', 'Full Body', 'Cardio', [
    'Half Burpees',
    'Standard Burpees',
    'Burpee with Push-up',
    'Burpee with Jump',
    'Burpee with Tuck Jump',
    'Burpee with 360° Jump'
  ]),
  new Exercise('6', 'Mountain Climbers', 'Warmup', 'Full Body', 'Cardio', ['Standard']),
  new Exercise('7', 'Arm Circles', 'Warmup', 'Shoulders', '', ['Standard']),
  new Exercise('8', 'Leg Swings', 'Warmup', 'Legs', '', ['Standard']),
  new Exercise('9', 'Hip Flexor Stretch', 'Stretching', 'Legs', '', ['Standard']),
  new Exercise('10', 'Shoulder Stretch', 'Stretching', 'Shoulders', '', ['Standard']),
  new Exercise('11', 'Dips', 'Main', 'Arms', 'Chest', [
    'Assisted Dips',
    'Standard Dips',
    'Weighted Dips',
    'Ring Dips',
    'L-Sit Dips',
    'Korean Dips'
  ]),
  new Exercise('12', 'Lunges', 'Main', 'Legs', 'Glutes', [
    'Standard Lunges',
    'Walking Lunges',
    'Jumping Lunges',
    'Bulgarian Split Squats',
    'Reverse Lunges',
    'Lateral Lunges'
  ]),
  new Exercise('13', 'Pike Push-ups', 'Main', 'Shoulders', 'Arms', [
    'Standard Pike Push-ups',
    'Elevated Pike Push-ups',
    'Handstand Push-ups (Assisted)',
    'Handstand Push-ups',
    'Freestanding Handstand Push-ups',
    'One-Arm Handstand Push-ups'
  ]),
  new Exercise('14', 'Hollow Body Hold', 'Main', 'Core', '', [
    'Hollow Body Hold (Bent Legs)',
    'Standard Hollow Body Hold',
    'Hollow Body Rocks',
    'Hollow Body V-ups',
    'Hollow Body Pull-ups',
    'Hollow Body Press to Handstand'
  ]),
  new Exercise('15', 'Jumping Jacks', 'Warmup', 'Full Body', 'Cardio', ['Standard']),
  new Exercise('16', 'Cat-Cow Stretch', 'Stretching', 'Back', 'Core', ['Standard']),
  new Exercise('17', 'Calf Raises', 'Main', 'Legs', '', [
    'Standard Calf Raises',
    'Single Leg Calf Raises',
    'Jump Calf Raises',
    'Pistol Calf Raises',
    'Weighted Calf Raises',
    'One-Leg Calf Raises'
  ]),
  new Exercise('18', 'Tricep Dips', 'Main', 'Arms', '', ['Standard']),
  new Exercise('19', 'High Knees', 'Warmup', 'Legs', 'Cardio', ['Standard']),
  new Exercise('20', 'Child\'s Pose', 'Stretching', 'Back', 'Shoulders', ['Standard'])
];

// Sample workouts
export const sampleWorkouts = [
  new Workout('1', 'Upper Body Strength', ['1', '2', '11', '13', '18'], 'Monday'),
  new Workout('2', 'Lower Body Power', ['3', '12', '17', '5'], 'Wednesday'),
  new Workout('3', 'Full Body HIIT', ['5', '1', '3', '14', '2'], 'Friday'),
  new Workout('4', 'Core Focus', ['4', '14', '1', '3'], 'Tuesday'),
  new Workout('5', 'Active Recovery', ['6', '15', '19', '9', '10', '16', '20'], 'Sunday')
];

// Function to initialize sample data
export const initializeSampleData = () => {
  // Check if data already exists
  const existingExercises = localStorage.getItem('workout_tracker_exercises');
  const existingWorkouts = localStorage.getItem('workout_tracker_workouts');
  
  if (!existingExercises || JSON.parse(existingExercises).length === 0) {
    localStorage.setItem('workout_tracker_exercises', JSON.stringify(sampleExercises));
    console.log('Sample exercises loaded');
  }
  
  if (!existingWorkouts || JSON.parse(existingWorkouts).length === 0) {
    // Update muscles covered for sample workouts
    sampleWorkouts.forEach(workout => {
      workout.updateMusclesCovered(sampleExercises);
    });
    
    localStorage.setItem('workout_tracker_workouts', JSON.stringify(sampleWorkouts));
    console.log('Sample workouts loaded');
  }
};

// Function to clear all data and reload samples
export const resetToSampleData = () => {
  localStorage.removeItem('workout_tracker_exercises');
  localStorage.removeItem('workout_tracker_workouts');
  localStorage.removeItem('workout_tracker_sessions');
  
  initializeSampleData();
  console.log('Reset to sample data complete');
};