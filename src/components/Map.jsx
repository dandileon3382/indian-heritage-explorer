import React from 'react';
import { useNavigate } from 'react-router-dom';
import IndiaMapSvg from '/assets/images/india-map.svg';

function Map({ sites }) {
  const navigate = useNavigate();

  // Bounding box for India (approximate)
  const latMin = 6;
  const latMax = 37;
  const lonMin = 68;
  const lonMax = 97;

  const handleStateClick = (stateId) => {
    const site = sites.find(
      (s) =>
        s.location.state.replace(/\s/g, '').toLowerCase() ===
        stateId.replace(/\s/g, '').toLowerCase()
    );

    if (site) {
      navigate(`/sites/${site.id}`);
    } else {
      alert(`No heritage site data available for this state.`);
    }
  };

  const getPosition = ([lat, lon]) => {
    const top = ((latMax - lat) / (latMax - latMin)) * 100;
    const left = ((lon - lonMin) / (lonMax - lonMin)) * 100;
    return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto p-4">
      <img src={IndiaMapSvg} alt="India Map" className="w-full h-auto" />

      {sites.map((site) => {
        const { top, left } = getPosition(site.location.coordinates);

        return (
          <div
            key={site.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
            style={{ top, left }}
            onClick={() => handleStateClick(site.location.state)}
          >
            <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse-marker"></div>
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-800 text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {site.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default Map;
