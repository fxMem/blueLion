import { Bootstrapper } from 'dbb/lib/bootstrapper'
import config from './config.json';
import { Config } from 'dbb/lib/Config';
import { registerCommonCommands } from 'dbb-commands/lib/common';
import { registerTwitchCommands } from 'dbb-commands/lib/twitch';
import { registerRedditCommands } from 'dbb-commands/lib/reddit';

const bootstrapper = new Bootstrapper().withConfig(config as Config);
registerTwitchCommands(bootstrapper);
registerCommonCommands(bootstrapper);
registerRedditCommands(bootstrapper);

bootstrapper.run();
