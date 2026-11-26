const cv = document.getElementById('c'); cv.width = 1080; cv.height = 1920;
const T = (await import('./times.js')).T;
await document.fonts.load('96px Anton'); await document.fonts.load('italic 900 28px Montserrat');
const film = await import(T.kind === 'wall' ? './wall.js' : './cable.js');
const f = film.build(cv, T, T.lang);
window.DUR = T.dur; window.EV = []; window.TEXTS = () => [];
window.render = t => f.render(t);
window.READY = true;
