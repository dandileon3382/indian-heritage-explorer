import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import heritageSites from '../data/heritageSites.json';
import ModelViewer from '../components/ModelViewer';
import AudioPlayer from '../components/AudioPlayer';
import LanguageSelector from '../components/LanguageSelector';
import ARButton from '../components/ARButton';
import { isMobile } from 'react-device-detect';

function SiteDetailsPage() {
  const { id } = useParams();
  const site = heritageSites.find(s => s.id === id);

  const [language, setLanguage] = useState('en');
  const [mode, setMode] = useState('3d'); // '3d' or 'street-view'

  if (!site) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Site Not Found</h1>
        <p className="text-gray-400 mb-4">The heritage site you are looking for does not exist.</p>
        <Link to="/" className="text-blue-500 hover:underline">Go back to the map</Link>
      </div>
    );
  }

  const historyText = site.history[language] || site.history.en;
  const audioSrc = site.audio?.[language] || site.audio?.en || null;
  const regionalLanguageCode = Object.keys(site.history).find(lang => lang !== 'en' && lang !== 'hi' && lang !== 'te');
  const availableLanguages = ['en', 'hi', 'te', regionalLanguageCode].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="flex flex-col items-center">
        <Link to="/" className="self-start text-blue-500 hover:underline mb-4">← Back to Map</Link>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{site.name}</h1>
        <LanguageSelector selected={language} onSelect={setLanguage} languages={availableLanguages} />
      </div>
      
      <div className="flex justify-center my-4 space-x-4">
        <button 
          onClick={() => setMode('3d')} 
          className={`px-4 py-2 rounded-full font-semibold ${mode === '3d' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
          3D Model
        </button>
        <button 
          onClick={() => setMode('street-view')} 
          className={`px-4 py-2 rounded-full font-semibold ${mode === 'street-view' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
          360° View
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Visualizer Section (3D Model or Street View) */}
        <div className="w-full h-80 md:h-96 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {mode === '3d' ? (
            <ModelViewer modelUrl={site.model} />
          ) : (
            <iframe 
              src={site.streetViewUrl} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade" 
              className="w-full h-full"
            ></iframe>
          )}
        </div>

        {/* History and AR Section */}
        <div className="flex flex-col">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-4">
            <h2 className="text-2xl font-semibold mb-2">History</h2>
            <p className="text-gray-300">{historyText}</p>
            <div className="mt-4 flex items-center space-x-4">
              {audioSrc ? (
                <AudioPlayer audioSrc={audioSrc} />
              ) : (
                <p className="text-gray-400">No audio available.</p>
              )}
              {isMobile && site.model && <ARButton modelUrl={site.model} />}
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Necessary Images</h2>
            <div className="flex flex-wrap gap-4 mt-4">
              {site.images.map((image, index) => (
                <img key={index} src={image} alt={`${site.name} ${index + 1}`} className="w-24 h-24 object-cover rounded-lg shadow-md"/>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SiteDetailsPage;
