import React from 'react';

function LanguageSelector({ selected, onSelect, languages }) {
  return (
    <div className="flex space-x-2 mb-4">
      {languages.map(lang => (
        <button
          key={lang}
          onClick={() => onSelect(lang)}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
            selected === lang ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default LanguageSelector;