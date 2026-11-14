// Prints the text to paste into ElevenLabs: the on-screen script with the
// words that must be read differently replaced ("spokenAs" in the config).
//   node scripts/tts-text.mjs configs/feeha.json
import {readFileSync} from 'node:fs';

const cfg = JSON.parse(readFileSync(process.argv[2]));
const map = cfg.spokenAs ?? {};
console.log(
  cfg.script
    .split(' ')
    .map((tok) => {
      const m = tok.match(/^(.*?)([?!.,:;]*)$/);
      return (map[m[1]] ?? m[1]) + m[2];
    })
    .join(' '),
);
