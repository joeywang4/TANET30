import React, { useRef } from 'react';

const useAudio = (src) => {
  const tagRef = useRef();

  const play = () => {
    //tagRef.current.load();
    tagRef.current.play();
  }

  const audioTag = <audio ref={tagRef} src={src} preload="auto" type="audio" />;

  return [audioTag, play];
}

export default useAudio;