import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test App - React is Working!</h1>
      <p>If you can see this, React is loading correctly.</p>
      <button onClick={() => alert('Button clicked!')}>Test Button</button>
    </div>
  );
};

export default TestApp;
