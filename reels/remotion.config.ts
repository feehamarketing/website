import {Config} from '@remotion/cli/config';

// Cloud sessions cannot download Remotion's own Chrome: use the one that is
// already installed. Override with REMOTION_CHROME on another machine.
Config.setBrowserExecutable(
  process.env.REMOTION_CHROME ??
    '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
);
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
