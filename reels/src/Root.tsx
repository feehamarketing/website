import '@fontsource/bebas-neue/400.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/archivo/wdth-italic.css';
import '@fontsource/space-mono/700.css';
import '@fontsource/anton/400.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import {Composition, continueRender, delayRender} from 'remotion';
import {Feeha} from './feeha/Feeha';
import {MA} from './ma/MA';
import {MA2} from './ma2/MA2';
import {Panels} from './panels/Panels';
import {Expo} from './expo/Expo';
import {Hiver} from './hiver/Hiver';
import {Vente} from './vente/Vente';
import {FeehaPanel} from './feehapanel/FeehaPanel';
import {FeehaAnim} from './anim/FeehaAnim';
import {FeehaBrand} from './brand/Brand';
import {FeehaStory} from './story/Story';
import {FeehaVitrine} from './vitrine/Vitrine';
import {FeehaNumero} from './numero/Numero';
import {FeehaBirdBoyz} from './birdboyz/BB';
import {FeehaProcess} from './process/Process';
import {FeehaPromo, PROMO_FRAMES} from './promo/Promo';
import {FeehaPlat, PLAT_FRAMES} from './plat/Plat';
import {FeehaArches, ARCHES_FRAMES} from './arches/Arches';
import {FeehaTest3s, T3S_FRAMES} from './t3s/Test3s';
import feeha from './feeha/timeline.json';
import ma from './ma/timeline.json';
import ma2 from './ma2/timeline.json';
import panels from './panels/timeline.json';
import expo from './expo/timeline.json';
import hiver from './hiver/timeline.json';
import vente from './vente/timeline.json';
import feehapanel from './feehapanel/timeline.json';
import anim from './anim/timeline.json';
import brand from './brand/timeline.json';
import story from './story/timeline.json';
import vitrine from './vitrine/timeline.json';
import numero from './numero/timeline.json';
import birdboyz from './birdboyz/timeline.json';

const fontsReady = delayRender('fonts');
Promise.all([
  document.fonts.load('400 100px "Bebas Neue"'),
  document.fonts.load('400 40px "Inter"'),
  document.fonts.load('500 40px "Inter"'),
  document.fonts.load('600 40px "Inter"'),
  document.fonts.load('800 40px "Inter"'),
  document.fonts.load('850 100px "Archivo Variable"'),
  document.fonts.load('italic 900 100px "Archivo Variable"'),
  document.fonts.load('700 30px "Space Mono"'),
  document.fonts.load('400 100px "Anton"'),
  document.fonts.load('800 40px "Montserrat"'),
  document.fonts.load('900 40px "Montserrat"'),
]).then(() => continueRender(fontsReady));

export const Root = () => (
  <>
    <Composition
      id="FeehaTest3s"
      component={FeehaTest3s}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={T3S_FRAMES}
      defaultProps={{audio: true}}
    />
    <Composition
      id="FeehaArches"
      component={FeehaArches}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={ARCHES_FRAMES}
      defaultProps={{audio: true}}
    />
    <Composition
      id="FeehaPlat"
      component={FeehaPlat}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={PLAT_FRAMES}
      defaultProps={{audio: true}}
    />
    <Composition
      id="FeehaPromo"
      component={FeehaPromo}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={PROMO_FRAMES}
      defaultProps={{audio: true}}
    />
    <Composition
      id="FeehaProcess"
      component={FeehaProcess}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={240}
      defaultProps={{}}
    />
    <Composition
      id="FeehaBirdBoyz"
      component={FeehaBirdBoyz}
      width={1080}
      height={1920}
      fps={birdboyz.fps}
      durationInFrames={birdboyz.totalFrames}
      defaultProps={{audio: true}}
    />
    <Composition
      id="FeehaNumero"
      component={FeehaNumero}
      width={1080}
      height={1920}
      fps={numero.fps}
      durationInFrames={numero.totalFrames}
      defaultProps={{audio: true}}
    />
    <Composition
      id="FeehaVitrine"
      component={FeehaVitrine}
      width={1080}
      height={1920}
      fps={vitrine.fps}
      durationInFrames={vitrine.totalFrames}
      defaultProps={{audio: true}}
    />
    <Composition
      id="FeehaStory"
      component={FeehaStory}
      width={1080}
      height={1920}
      fps={story.fps}
      durationInFrames={story.totalFrames}
      defaultProps={{audio: true}}
    />
    <Composition
      id="FeehaBrand"
      component={FeehaBrand}
      width={1080}
      height={1920}
      fps={brand.fps}
      durationInFrames={brand.totalFrames}
      defaultProps={{audio: true}}
    />
    <Composition
      id="FeehaAnim"
      component={FeehaAnim}
      width={1080}
      height={1920}
      fps={anim.fps}
      durationInFrames={anim.totalFrames}
      defaultProps={{audio: true}}
    />
    <Composition
      id="FeehaPanel"
      component={FeehaPanel}
      width={1080}
      height={1920}
      fps={feehapanel.fps}
      durationInFrames={feehapanel.totalFrames}
      defaultProps={{audio: true}}
    />
    <Composition
      id="Vente"
      component={Vente}
      width={1080}
      height={1920}
      fps={vente.fps}
      durationInFrames={vente.totalFrames}
      defaultProps={{audio: true}}
    />
    <Composition
      id="Hiver"
      component={Hiver}
      width={1080}
      height={1920}
      fps={hiver.fps}
      durationInFrames={hiver.totalFrames}
      defaultProps={{audio: true}}
    />
    <Composition
      id="Expo"
      component={Expo}
      width={1080}
      height={1920}
      fps={expo.fps}
      durationInFrames={expo.totalFrames}
      defaultProps={{audio: true}}
    />
    <Composition
      id="Panels"
      component={Panels}
      width={1080}
      height={1920}
      fps={panels.fps}
      durationInFrames={panels.totalFrames}
      defaultProps={{audio: true}}
    />
    <Composition
      id="MA2"
      component={MA2}
      width={1080}
      height={1920}
      fps={ma2.fps}
      durationInFrames={ma2.totalFrames}
      defaultProps={{audio: true}}
    />
    <Composition
      id="MA"
      component={MA}
      width={1080}
      height={1920}
      fps={ma.fps}
      durationInFrames={ma.totalFrames}
      defaultProps={{audio: true}}
    />
    <Composition
      id="Feeha"
      component={Feeha}
      width={1080}
      height={1920}
      fps={feeha.fps}
      durationInFrames={feeha.totalFrames}
      defaultProps={{audio: true}}
    />
  </>
);
