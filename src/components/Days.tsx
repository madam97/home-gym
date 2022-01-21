import moment from 'moment';
import '../scss/components/days.scss';

type DaysProps = {
  activeDay: number,
  setActiveDay(activeDay: number): void
};

export default function Days({activeDay, setActiveDay}: DaysProps): JSX.Element {
  
  const days: JSX.Element[] = [];
  for (let i = 1; i <= 7; ++i) {
    const day = moment().weekday(i);

    days.push((
      <button 
        key={i}
        className={`btn btn-outline-black ${i === activeDay ? 'active' : ''}`}
        onClick={(): void => setActiveDay(i)}
      >
        <span>{day.format('YYYY.MM.DD.')}</span>
        <span>{day.format('dddd')}</span>
      </button>
    ));
  }

  return (
    <div className="container-days">
      <div>{days}</div>
    </div>
  )
}