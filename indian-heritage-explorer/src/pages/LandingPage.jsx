import React from 'react';
import Map from '../components/Map';
import heritageSites from '../data/heritageSites.json';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-8">INDIAN HERITAGE EXPLORER</h1>
      <Map sites={heritageSites} />
      <p className="mt-8 text-center text-sm">
        Click on a location to explore the heritage site in Augmented Reality.
      </p>
    </div>
  );
}

export default LandingPage;