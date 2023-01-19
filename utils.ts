import {
  ActionRow,
  Button,
  CreateApplicationCommand,
  Interaction,
  InteractionResponse,
  InteractionResponseData,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  SelectMenu,
  TextInput,
} from "./types.ts";

// These are utility functions and types that you can use in your code to help you write your commands and components

interface CommandOptions extends CreateApplicationCommand {
  exec(
    interaction: Interaction<InteractionType.APPLICATION_COMMAND>,
    ...args: unknown[]
  ): void;
}
// Waiting for https://github.com/microsoft/TypeScript/issues/5326
// deno-lint-ignore no-empty-interface
export interface Command extends CommandOptions {}
export class Command {
  constructor(options: CommandOptions) {
    Object.assign(this, options);
  }
}

// If I use interface insttead of type, I get an error. Why? I don't know. I'm not a typescript expert... This further blurs the line between types and interfaces.
export type Component<T = Button | SelectMenu | TextInput> =
  & {
    [P in keyof T]: T[P];
  }
  & {
    custom_id: string;
    exec(
      interaction: Interaction<InteractionType.MESSAGE_COMPONENT>,
      ...args: unknown[]
    ): Promise<InteractionResponse>;
  };

// Might remove this idk
export function EphemeralResponse(
  message: InteractionResponseData | string,
): InteractionResponse {
  let data = {} as InteractionResponseData;
  if (typeof message === "string") {
    data.content = message;
  }
  if (typeof message === "object") {
    data = message;
  }
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      ...data,
      flags: data.flags
        ? data.flags | MessageFlags.EPHEMERAL
        : MessageFlags.EPHEMERAL,
    },
  };
}

export function ActionRow(
  components: (Button | SelectMenu | TextInput)[],
) {
  return {
    type: 1,
    components,
  } as ActionRow;
}
