import '@fontsource/bebas-neue/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import {Composition, continueRender, delayRender} from 'remotion';
import {Reel} from './Reel';
import timeline from './timeline.json';

const fontsReady = delayRender('fonts');
Promise.all([
  document.fonts.load('400 100px "Bebas Neue"'),
  document.fonts.load('600 40px "Inter"'),
  document.fonts.load('800 40px "Inter"'),
]).then(() => continueRender(fontsReady));

export const Root = () => (
  <Composition
    id="Reel"
    component={Reel}
    width={1080}
    height={1920}
    fps={timeline.fps}
    durationInFrames={timeline.totalFrames}
    defaultProps={{audio: true}}
  />
);
