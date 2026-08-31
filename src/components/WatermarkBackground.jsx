import React from 'react';
import radhaKrishna from '../assets/radha_krishna_landscape.png';

/**
 * Full-viewport background using the new landscape Radha Krishna image.
 *
 * Uses `background-size: cover` so the image always fully fits the screen 
 * (filling all space) without distortion.
 */
export default function WatermarkBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage: `url(${radhaKrishna})`,
          backgroundSize: 'cover',        /* fully fits the screen */
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
        }}
      />

      {/*
        Translucent white overlay — softens the image slightly
        so content cards on top remain crisp and readable.
      */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 2,
          pointerEvents: 'none',
          backgroundColor: 'rgba(255, 252, 248, 0.42)',
        }}
      />
    </>
  );
}

