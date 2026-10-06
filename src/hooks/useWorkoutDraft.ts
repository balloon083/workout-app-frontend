import { NewExercise } from '@/api';
import { useState } from 'react';

/** Form-side set: inputs are strings until the workout is saved. */
export interface DraftSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

export interface DraftExercise {
  id: string;
  exercise_name: string;
  sets: DraftSet[];
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `${Date.now()}-${idCounter}`;
}

const makeSet = (): DraftSet => ({ id: nextId(), weight: '', reps: '', completed: false });

const makeExercise = (name = ''): DraftExercise => ({
  id: nextId(),
  exercise_name: name,
  sets: [makeSet()],
});

function isSetFilledIn(set: DraftSet) {
  return set.weight.trim() !== '' || set.reps.trim() !== '' || set.completed;
}

/** Converts the draft into the API shape, dropping unnamed exercises and blank sets. */
export function draftToExercises(exercises: DraftExercise[]): NewExercise[] {
  return exercises
    .filter((ex) => ex.exercise_name.trim() !== '')
    .map((ex) => ({
      exercise_name: ex.exercise_name,
      sets: ex.sets.filter(isSetFilledIn).map((s) => ({
        weight: s.weight ? parseFloat(s.weight) : null,
        reps: s.reps ? parseInt(s.reps, 10) : null,
        completed: s.completed,
      })),
    }));
}

/** State and edit operations for the in-progress workout form. */
export function useWorkoutDraft() {
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<DraftExercise[]>(() => [makeExercise()]);

  function editExercise(exerciseId: string, edit: (ex: DraftExercise) => DraftExercise) {
    setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? edit(ex) : ex)));
  }

  function editSet(exerciseId: string, setId: string, edit: (s: DraftSet) => DraftSet) {
    editExercise(exerciseId, (ex) => ({
      ...ex,
      sets: ex.sets.map((s) => (s.id === setId ? edit(s) : s)),
    }));
  }

  return {
    notes,
    setNotes,
    exercises,

    /** Clears the form, optionally pre-filling exercise names (e.g. from a program). */
    reset(exerciseNames: string[] = []) {
      setNotes('');
      setExercises(
        exerciseNames.length > 0 ? exerciseNames.map((name) => makeExercise(name)) : [makeExercise()]
      );
    },

    addExercise() {
      setExercises((prev) => [...prev, makeExercise()]);
    },

    removeExercise(exerciseId: string) {
      setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    },

    renameExercise(exerciseId: string, name: string) {
      editExercise(exerciseId, (ex) => ({ ...ex, exercise_name: name }));
    },

    addSet(exerciseId: string) {
      editExercise(exerciseId, (ex) => ({ ...ex, sets: [...ex.sets, makeSet()] }));
    },

    removeSet(exerciseId: string, setId: string) {
      editExercise(exerciseId, (ex) => ({ ...ex, sets: ex.sets.filter((s) => s.id !== setId) }));
    },

    updateSet(exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) {
      editSet(exerciseId, setId, (s) => ({ ...s, [field]: value }));
    },

    toggleSet(exerciseId: string, setId: string) {
      editSet(exerciseId, setId, (s) => ({ ...s, completed: !s.completed }));
    },
  };
}

export type WorkoutDraft = ReturnType<typeof useWorkoutDraft>;
