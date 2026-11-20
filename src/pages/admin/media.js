// Pictures for the Site content tab: made small in the browser, then stored on the server (the same store as the team photos).
import { api, errorText } from './kit';

export const BIG = { sides: [1400, 1200, 1000, 800, 640], types: ['image/webp', 'image/jpeg'], quality: 0.84, max: 400 * 1024, fill: '#0d1016' };
export const GALLERY = { sides: [1400, 1200, 1000, 800, 640], types: ['image/webp', 'image/jpeg'], quality: 0.82, max: 300 * 1024, fill: '#0d1016' };

/* A photo from a phone can be 5 MB. This makes it small in the browser before it is uploaded. Returns { data, ratio } (ratio = width / height). */
export async function shrink(file, o) {
  if (!/^image\//.test(file.type)) throw new Error('Please choose an image file (JPG, PNG or WebP).');
  if (file.size > 25 * 1024 * 1024) throw new Error('That image is larger than 25 MB. Choose a smaller one.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('This image could not be read. Try a JPG or PNG.'));
      el.src = url;
    });
    if (!img.naturalWidth || !img.naturalHeight) throw new Error('This image could not be read. Try a JPG or PNG.');
    for (const side of o.sides) {
      const k = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.naturalWidth * k));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * k));
      const ctx = canvas.getContext('2d');
      if (o.fill) { ctx.fillStyle = o.fill; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      for (const type of o.types) {
        const out = canvas.toDataURL(type, o.quality);
        if (out.startsWith(`data:${type}`) && out.length * 0.75 < o.max) return { data: out, ratio: Math.round((canvas.width / canvas.height) * 1000) / 1000 };
      }
    }
    throw new Error('Could not make this image small enough. Try a smaller picture.');
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* shrink + upload. Returns { ok, version, ratio } or { ok: false, error }. Never throws. */
export async function uploadPicture(file, id, preset) {
  try {
    const { data, ratio } = await shrink(file, preset);
    const r = await api('/api/admin/people', { action: 'photo', id, data });
    if (!r.ok || !r.json.photo) return { ok: false, error: errorText(r, 'The picture could not be uploaded.') };
    return { ok: true, version: r.json.photo, ratio };
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : 'The picture could not be used.' };
  }
}
