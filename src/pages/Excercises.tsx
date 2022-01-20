import { ChangeEventHandler, useState } from 'react';
import useFetch from '../hooks/useFetch';

type ExcercisesProps = {
  
}

export default function Excercises({}: ExcercisesProps): JSX.Element {

  const [filterExcerciseName, setFilterExcerciseName] = useState<string>('');
  const [filterExcerciseType, setFilterExcerciseType] = useState<number>(0);
  const [orderExcercises, setOrderExcercises] = useState<number>(1);

  const { data: excercises, error, loading } = useFetch<IExcercise>('/excercises');
  const { data: excerciseTypes, error: error2, loading: loading2 } = useFetch<IExcercise>('/excerciseTypes');

  const getExcercises = (): IExcercise[] => {
    // Filter
    const data = filterExcerciseName === '' && filterExcerciseType === 0 ? excercises.slice() : excercises.filter((item) => {
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

                {excerciseTypes.map((item) => (
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
          {getExcercises().map((item) => (
            <div key={item.id} className="col sm-6 md-4 lg-3">
              <div className="card">
                {item.excerciseTypes && 
                  <p className="subtitle">
                    {item.excerciseTypes.map((item, index) => `${index > 0 ? ', ' : ''}${item.name}`)}
                  </p>
                }
                <p className="title">{item.name}</p>
                <p className="para-hidden-3">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
