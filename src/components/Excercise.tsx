import { GiWeightLiftingUp, GiMuscleUp } from 'react-icons/gi';

type ExcerciseProps = {
  excercise: IExcercise
};

export default function Excercise({ excercise }: ExcerciseProps): JSX.Element {
  return (
    <div className="card">
      <p className="subtitle container-float">
        {excercise.excerciseTypes && 
          <span>
            {excercise.excerciseTypes.map((excerciseType, index) => 
              (index > 0 ? ', ' : '') + excerciseType.name
            )}
          </span>
        }
        
        {excercise.useDumbbells && <GiWeightLiftingUp className="icon float-right" />}
        {!excercise.useDumbbells && <GiMuscleUp className="icon float-right" />}
      </p>
      <p className="title">{excercise.name}</p>
      <p className="para-hidden-3">{excercise.desc}</p>
    </div>
  );
}