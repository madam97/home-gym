import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Background from '../assets/home-background.mp4';
import { useAuth } from '../hooks/useAuth';

type HomeProps = {
  
}

export default function Home({}: HomeProps): JSX.Element {

  const auth = useAuth();

  const homeBg = useRef<HTMLVideoElement>(null);

  useEffect((): void => {
    if (homeBg && homeBg.current) {
      homeBg.current.playbackRate = 0.7;
    }
  }, []);

  return (
    <>
      <video ref={homeBg} className="fixed-full filter-grayscale" autoPlay={true} muted={true} loop={true}>
        <source src={Background} type="video/mp4" />
      </video>

      <section className="section fixed-full flex-center pt-header">
        <div className="row row-space-between">
          <div className="col sm-6 md-5">
            <Link to="/excercises">
              <div className="card card-dark card-simple">
                <h2 className="mb-1">Excercises</h2>
                <p>Browse through exercises and choose the ones that work for you</p>
              </div>
            </Link>
          </div>
          <div className="col sm-6 md-5">
            {!auth.user && 
              <Link to="/login">
                <div className="card card-dark card-simple">
                  <h2 className="mb-1">Login</h2>
                  <p>Login with your HomeGym account to start building your workout plan</p>
                </div>
              </Link>
            }
            {auth.user && 
              <Link to="/my-workout">
                <div className="card card-dark card-simple">
                  <h2 className="mb-1">My workout plan</h2>
                  <p>View your workout plan and organize the excercises of your workout week</p>
                </div>
              </Link>
            }
          </div>
        </div>
      </section>
    </>
  )
}
