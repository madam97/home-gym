import React from 'react';
import { GiWeightLiftingUp, GiMuscleUp } from 'react-icons/gi';

type ExcerciseProps = {
  excercise: IExcercise
};

export default function Excercise({ excercise }: ExcerciseProps): JSX.Element {
  return (
    <div className="card">
      <p className="subtitle flex-block">
        {excercise.useDumbbells && <GiWeightLiftingUp className="icon t-space-after" />}
        {!excercise.useDumbbells && <GiMuscleUp className="icon t-space-after" />}

        {excercise.excerciseTypes && 
          <span>
            {excercise.excerciseTypes.map((excerciseType, index) => 
              (index > 0 ? ', ' : '') + excerciseType.name
            )}
          </span>
        }
      </p>
      <p className="title">{excercise.name}</p>
      <p className="para-hidden-3">{excercise.desc}</p>
    </div>
  );
}