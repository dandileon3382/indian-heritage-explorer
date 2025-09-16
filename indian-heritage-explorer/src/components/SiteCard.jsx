import React from 'react';
import { Link } from 'react-router-dom';

function SiteCard({ site }) {
  return (
    <Link 
      to={`/sites/${site.id}`} 
      className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
    >
      <img 
        src={site.images[0] || '/placeholder.jpg'} 
        alt={site.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4 text-white">
        <h3 className="text-xl font-semibold">{site.name}</h3>
        <p className="text-sm text-gray-400 mt-1">{site.location.state}</p>
      </div>
    </Link>
  );
}

export default SiteCard;