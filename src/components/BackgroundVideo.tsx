import React, { useEffect, useRef } from 'react';
import Background from '../assets/background.mp4';

export default function BackgroundVideo(): JSX.Element {

  const homeBg = useRef<HTMLVideoElement>(null);

  useEffect((): void => {
    if (homeBg && homeBg.current) {
      homeBg.current.playbackRate = 0.7;
    }
  }, []);

  return (
    <video ref={homeBg} className="fixed-full bg-video" autoPlay={true} muted={true} loop={true}>
      <source src={Background} type="video/mp4" />
    </video>
  );
}
