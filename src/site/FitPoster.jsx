// The membership poster frame on the Home page. The frame takes the shape of the picture, so the whole poster is always visible,
// whether it was put in src/assets with git or uploaded in the dashboard (and whatever its shape: tall, wide or square).
// Only an extreme shape (thinner than 9:20 or wider than 9:5) is held inside those limits, and then it is shown whole, not cropped.
import { useLayoutEffect, useRef, useState } from 'react';
import './FitPoster.css';

const MIN = 0.45;   // width / height
const MAX = 1.8;

export default function FitPoster({ src, alt, ratio, className = '' }) {
  const [r, setR] = useState(ratio);
  const img = useRef(null);
  const read = (el) => {
    if (!el || !el.naturalWidth || !el.naturalHeight) return;
    const n = el.naturalWidth / el.naturalHeight;
    setR((p) => (Math.abs(p - n) > 0.002 ? n : p));
  };
  useLayoutEffect(() => { setR(ratio); read(img.current); }, [src, ratio]);
  const k = Math.min(MAX, Math.max(MIN, r));
  return (
    <div className={`s-join-poster fit-poster ${className}`.trim()} style={{ aspectRatio: String(Math.round(k * 1000) / 1000) }} data-ratio={k.toFixed(3)}>
      <img ref={img} src={src} alt={alt} loading="lazy" decoding="async" onLoad={(e) => read(e.currentTarget)} />
    </div>
  );
}
