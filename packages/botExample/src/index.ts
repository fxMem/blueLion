import { Bootstrapper } from 'dbb/lib/bootstrapper'
import config from './config.json';
import { Config } from 'dbb/lib/Config';
import { registerCommonCommands } from 'dbb-commands/lib/common';
import { registerTwitchCommands } from 'dbb-commands/lib/twitch';

const bootstrapper = new Bootstrapper().withConfig(config as Config);
registerTwitchCommands(bootstrapper);
registerCommonCommands(bootstrapper);

bootstrapper.run();
