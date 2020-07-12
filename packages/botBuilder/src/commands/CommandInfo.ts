import { CommandArgument } from "./CommandArgument";

export type InvocationContext = {
    name: string;
    arguments: CommandArgument[];
}