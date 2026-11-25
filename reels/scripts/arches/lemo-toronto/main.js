const cv = document.getElementById('c'); cv.width = 1080; cv.height = 1920;
const g = cv.getContext('2d');
const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
const IMG = { missed: await load('face-missed.png'), right: await load('face-right.png') };
const film = await import('./film.js');
film.setImages(IMG);
window.DUR = film.DUR; window.EV = film.events(); window.TEXTS = film.texts;
window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; film.render(g, t); };
window.READY = true;
