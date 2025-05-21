import React from 'react';
import ReactDOM from 'react-dom/client';

const SimpleTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>Simple React Test</h1>
      <p>This is a simple React component to test rendering.</p>
    </div>
  );
};

// Render directly to the DOM
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <SimpleTest />
    </React.StrictMode>
  );
}

export default SimpleTest;
