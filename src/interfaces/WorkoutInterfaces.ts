interface IWorkout {
  id: number,
  excerciseId: number,
  weightTypeId: number,
  weight: number,
  repetitions: number[],
  completedRepetition: number,
  day: number,
  orderInd: number,
  excercise?: IExcercise,
  weightType?: IWeightType
};

interface IWeightType {
  id: number,
  name: string,
  zeroWeight: string
};