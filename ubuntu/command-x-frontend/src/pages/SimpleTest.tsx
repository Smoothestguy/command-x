import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Simple Test Page</h1>
      <p className="text-lg">This is a simple test page to verify routing works.</p>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Backend Status:</h2>
        <p>If you can see this page, routing is working!</p>
      </div>
    </div>
  );
};

export default SimpleTest;
