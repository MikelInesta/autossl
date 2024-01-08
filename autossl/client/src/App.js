import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://autossl.mikelinesta.com/node') 
      .then(response => response.json())
      .then(data => setData(data));
  }, []);

  return (
    <div>
      <p>{data ? JSON.stringify(data) : 'loading'}</p>
    </div>
  );
}

export default App;
