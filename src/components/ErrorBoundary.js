import React, { useState, useEffect } from "react";

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      React.Children.only(children);
    } catch (err) {
      setHasError(true);
      setError(err);
    }
  }, [children]);

  if (hasError) {
    return <div>Something went wrong: {error.message}</div>;
  }

  return children;
}

export default ErrorBoundary;
