interface IExcerciseType {
  id: number,
  name: string
};

interface IExcercise {
  id: number,
  excerciseTypeId: number,
  name: string,
  desc: string,
  excerciseType?: IExcerciseType
};