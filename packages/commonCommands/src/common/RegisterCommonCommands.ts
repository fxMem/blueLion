import { Bootstrapper } from "dbb/lib/bootstrapper";
import { LanguageCommand, HiCommand, RollCommand, HelpCommand } from ".";

export function registerCommonCommands(bootstrapper: Bootstrapper) {
    return bootstrapper.addCommands([
            new LanguageCommand(),
            new HiCommand(),
            new RollCommand()
        ]
    ).updateCommands(
        allCommands => [
            ...allCommands, 
            new HelpCommand(allCommands)
        ]
    );
}