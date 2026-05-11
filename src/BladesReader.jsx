import React, { useEffect } from 'react';
import './BladesReader.css';

/**
 * BladesReader — displays a self-contained HTML reference book in a full-screen iframe.
 * The HTML file has its own topbar/sidebar/search. When running inside
 * this iframe it shows a "←" back button that posts a message here,
 * which we catch and forward to onExit().
 *
 * Props:
 *   src     {string}   URL of the HTML file to load (default: Blades '68 reference)
 *   onExit  {function} Called when the user clicks the back button inside the iframe
 */
export default function BladesReader({ src = '/blades_book/blades68_reference.html', onExit }) {
  useEffect(() => {
    function handleMessage(e) {
      // Only accept messages from the same origin — prevents cross-origin injection
      if (e.origin !== window.location.origin) return;
      if (e.data === 'bladesreader:exit') onExit();
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onExit]);

  return (
    <div className="blades-reader">
      <iframe
        src={src}
        className="reader-frame"
        title="Book Reference"
      />
    </div>
  );
}
