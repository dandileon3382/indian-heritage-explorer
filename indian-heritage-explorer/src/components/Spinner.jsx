import React from 'react';

function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-solid rounded-full animate-spin"></div>
    </div>
  );
}

export default Spinner;