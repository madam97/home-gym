import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackgroundVideo from '../components/BackgroundVideo';
import { useTheme } from '../hooks/useTheme';

type ErrorProps = {
  code: number
};

export default function Error({ code }: ErrorProps): JSX.Element {

  const theme = useTheme();

  useEffect(() => {
    theme.setNavTransparent(true);

    return (): void => {
      theme.setNavTransparent(false);
    }
  }, []);

  return (
    <>
      <BackgroundVideo />

      <section className="section fixed-full flex-center pt-header">
        <div className="t-center">
          <h1 className="mb-2 f-white f-5">{code}</h1>

          {code === 404 && <p className="mb-5 f-white f-2">Ooops, something went wrong...</p>}

          <Link className="btn btn-outline-white" to="/">Home page</Link>
        </div>
      </section>
    </>
  );
}
