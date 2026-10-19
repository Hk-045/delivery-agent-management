import { Link, useRouteError } from 'react-router-dom';

const NotFoundPage = () => {
  const error = useRouteError();
  const isNotFound = error?.status === 404;

  return (
    <div className="container">
      <h2>{isNotFound ? 'Page not found' : 'Something went wrong'}</h2>
      <p className="muted">
        {isNotFound ? 'This page does not exist.' : 'Please try again or go back to the list.'}
      </p>
      <Link to="/">Go back to agents</Link>
    </div>
  );
};

export default NotFoundPage;