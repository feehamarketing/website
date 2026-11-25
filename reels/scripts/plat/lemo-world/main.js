const cv = document.getElementById('c'); cv.width = 1080; cv.height = 1920;
const g = cv.getContext('2d');
await document.fonts.load('400 200px Anton', 'LE MEILLEUR PLAT INVISIBLE ÊÉ');
const film = await import('./film.js');
window.DUR = film.DUR; window.EV = film.events(); window.TEXTS = film.texts;
window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; film.render(g, t); };
window.READY = true;
