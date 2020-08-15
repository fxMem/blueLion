import { Bootstrapper } from "dbb/lib/bootstrapper";
import { RedditExtractMediaMessageHook } from "./RedditExtractMediaMessageHook";
import { RedditCommand } from "./RedditCommand";

export function registerRedditCommands(bootstrapper: Bootstrapper) {
    bootstrapper.addMessageHooks([
        () => new RedditExtractMediaMessageHook()
    ]).addCommands([
        () => new RedditCommand()
    ]);
}