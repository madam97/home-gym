interface IWorkout {
  id: number,
  excerciseId: number,
  repetitions: number[],
  completedRepetition: number,
  days: number[],
  orderInd: number,
  excercise?: IExcercise
};