import useFetch from '../hooks/useFetch';

type ExcercisesProps = {
  
}

export default function Excercises({}: ExcercisesProps): JSX.Element {

  const { data, error, loading } = useFetch<IExcercise>('/excercises?_expand=excerciseType');

  return (
    <div className="section">
      <div className="row">
        {data.map((item) => (
          <div key={item.id} className="col sm-6 md-4 lg-3">
            <div className="card">
              {item.excerciseType && <p className="subtitle">{item.excerciseType.name}</p>}
              <p className="title">{item.name}</p>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
