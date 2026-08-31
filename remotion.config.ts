import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setChromiumOpenGlRenderer('angle');

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration);
});
