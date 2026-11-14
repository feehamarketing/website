// Colours measured on the Feeha footage and logo.
export const F = {
  ink: '#120606',
  wine: '#3d0b0a',
  red: '#A50F14', // logo red
  coral: '#F85848', // highlight colour of the site's titles
  white: '#FFFFFF',
  paper: '#F4F1EC',
  blue: '#2D4BE0', // "Business services"
  amber: '#F2A516', // "Illuminated"
};
export const DISPLAY = '"Archivo Variable", sans-serif';
export const MONO = '"Space Mono", monospace';
// Wide, heavy cut that echoes the site's headings.
export const wide = {fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 850} as const;
export const BEAT = 15; // 120 BPM at 30 fps
