import { AggregateCommandBase } from "dbb/lib/commands";
import { redditLocalization } from "./RedditLocalization";
import { ExtractMediaCommand } from "./ExtractMediaCommand";

export class RedditCommand extends AggregateCommandBase {
    name = 'reddit';
    description = redditLocalization.redditCommandDescription;

    subCommands = [new ExtractMediaCommand()];
}
