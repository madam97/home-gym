interface IExcerciseType {
  id: number,
  name: string
};

interface IExcercise {
  id: number,
  name: string,
  desc: string,
  useDumbbells: boolean,
  excerciseTypes: IExcerciseType[]
};