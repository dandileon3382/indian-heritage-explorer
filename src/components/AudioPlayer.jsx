import React, { useState, useRef } from 'react';

function AudioPlayer({ audioSrc }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error("Audio play failed:", err));
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <audio ref={audioRef} src={audioSrc} onEnded={() => setIsPlaying(false)} />
      <button
        onClick={togglePlayPause}
        className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 font-semibold transition"
      >
        {isPlaying ? 'Pause' : 'Play Audio'}
      </button>
    </div>
  );
}

export default AudioPlayer;
