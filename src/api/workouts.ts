import api from './client';
import { NewProgram, NewWorkout, Program, Workout } from './types';

export async function getWorkouts(): Promise<Workout[]> {
  const { data } = await api.get<Workout[]>('/workouts');
  return data;
}

export async function createWorkout(workout: NewWorkout): Promise<Workout> {
  const { data } = await api.post<Workout>('/workouts', workout);
  return data;
}

export async function getPrograms(): Promise<Program[]> {
  const { data } = await api.get<Program[]>('/programs');
  return data;
}

export async function createProgram(program: NewProgram): Promise<Program> {
  const { data } = await api.post<Program>('/programs', program);
  return data;
}
