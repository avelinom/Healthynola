import { useEffect, useState } from 'react';

export default function DebugAPI() {
  const [apiUrl, setApiUrl] = useState('');
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mostrar la URL que está usando
    const url = process.env.NEXT_PUBLIC_API_URL || 'https://healthynola-backend.onrender.com/api';
    setApiUrl(url);
    
    // Probar la API
    fetch(`${url}/products`)
      .then(res => res.json())
      .then(data => {
        console.log('API Response:', data);
        setProducts(data);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError(err.message);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug API</h1>
      <p><strong>API URL:</strong> {apiUrl}</p>
      <p><strong>Products:</strong> {products ? JSON.stringify(products, null, 2) : 'Loading...'}</p>
      {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
    </div>
  );
}
