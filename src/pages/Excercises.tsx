import { useState } from 'react';
import Excercise from '../components/Excercise';
import useFetch from '../hooks/useFetch';

type ExcercisesProps = {
  
}

export default function Excercises({}: ExcercisesProps): JSX.Element {

  const [filterExcerciseName, setFilterExcerciseName] = useState<string>('');
  const [filterExcerciseType, setFilterExcerciseType] = useState<number>(0);
  const [orderExcercises, setOrderExcercises] = useState<number>(1);

  const { data: excercises } = useFetch<IExcercise[]>('/excercises');
  const { data: excerciseTypes } = useFetch<IExcerciseType[]>('/excerciseTypes');

  const getExcercises = (): IExcercise[] => {
    if (excercises === undefined) {
      return [];
    }

    let data: IExcercise[] = [];

    // Return all
    if (filterExcerciseName === '' && filterExcerciseType === 0) {
      data = excercises.slice();
    } 
    // Filter
    else {
      data = excercises.filter((item) => {
        let ok = true;
        
        // Filter by name
        if (filterExcerciseName !== '' && !item.name.match(new RegExp(filterExcerciseName, 'i'))) {
          ok = false;
        }
  
        // Filter by excercise type
        if (ok && filterExcerciseType !== 0 && item.excerciseTypes) {
          ok = false;
          for (const type of item.excerciseTypes) {
            if (type.id === filterExcerciseType) {
              ok = true;
              break;
            }
          }
        }
          
        return ok;
      });
    }

    // Order
    const dataSorted = data.sort((a, b) => orderExcercises * a.name.localeCompare(b.name));

    return dataSorted;
  }

  // -------------------------------------------

  return (
    <>
      <section className="section">
        <h1>Excercises</h1>
      </section>

      <section className="section bg-gray pt-2 pb-1 mb-2">
        <form onSubmit={(event): void => event.preventDefault()}>
          <div className="row">
            <div className="col sm-4">
              <input className={`input ${filterExcerciseName !== '' ? 'active' : ''}`} type="text" value={filterExcerciseName} onChange={(event): void => setFilterExcerciseName(event.currentTarget.value)} placeholder="Filter by name"/>
            </div>
            <div className="col sm-4">
              <select className={`input ${filterExcerciseType !== 0 ? 'active' : ''}`} value={filterExcerciseType} onChange={(event): void => setFilterExcerciseType(parseInt(event.currentTarget.value))}>
                <option value={0}>All excercise types</option>

                {excerciseTypes && excerciseTypes.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="col sm-4">
              <select className="input" value={orderExcercises} onChange={(event): void => setOrderExcercises(parseInt(event.currentTarget.value))}>
                <option value={1}>Ascending order by name</option>
                <option value={-1}>Descending order by name</option>
              </select>
            </div>
          </div>

        </form>
      </section>

      <section className="section">
        <div className="row">
          {getExcercises().map((excercise) => (
            <div key={excercise.id} className="col sm-6 md-4 lg-3">
              <Excercise excercise={excercise} />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
