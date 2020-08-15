import { CommandBase, required, build, mention } from "dbb/lib/commands";
import { redditLocalization } from "./RedditLocalization";

export class ExtractMediaCommand extends CommandBase {
    name = 'extract';
    description = redditLocalization.extractMedia;

    argumentsMap = [];
    doInvoke() {
        // TODO: use this command as a tool to configure reddit media extractor hook
    }
}
