import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => console.log('Backend says:', data))
      .catch(err => console.error('Error:', err));
  }, []);

  return <div>Survey App Frontend</div>;
}
export default App;
