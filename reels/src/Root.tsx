import '@fontsource/bebas-neue/400.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/space-mono/700.css';
import {Composition, continueRender, delayRender} from 'remotion';
import {Reel} from './Reel';
import {Feeha} from './feeha/Feeha';
import snatch from './timeline.json';
import feeha from './feeha/timeline.json';

const fontsReady = delayRender('fonts');
Promise.all([
  document.fonts.load('400 100px "Bebas Neue"'),
  document.fonts.load('400 40px "Inter"'),
  document.fonts.load('500 40px "Inter"'),
  document.fonts.load('600 40px "Inter"'),
  document.fonts.load('800 40px "Inter"'),
  document.fonts.load('850 100px "Archivo Variable"'),
  document.fonts.load('700 30px "Space Mono"'),
]).then(() => continueRender(fontsReady));

export const Root = () => (
  <>
    <Composition
      id="Feeha"
      component={Feeha}
      width={1080}
      height={1920}
      fps={feeha.fps}
      durationInFrames={feeha.totalFrames}
      defaultProps={{audio: true}}
    />
    <Composition
      id="Reel"
      component={Reel}
      width={1080}
      height={1920}
      fps={snatch.fps}
      durationInFrames={snatch.totalFrames}
      defaultProps={{audio: true}}
    />
  </>
);
