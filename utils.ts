import {
  ActionRow,   
  CreateApplicationCommand,
  Interaction,
  InteractionResponse,
  InteractionResponseData,
  InteractionResponseType,
  MessageFlags,
  Button,
  SelectMenu,
  TextInput,
} from "./types.ts";

// These are utility functions and types that you can use in your code to help you write your commands and components

export interface Command extends CreateApplicationCommand {
  name: string;
  description: string;
  exec (
    interaction: Interaction,
    ...args: unknown[]
  ): Promise<InteractionResponse>;
  autocomplete?(
    interaction: Interaction,
    ...args: unknown[]
  ): Promise<InteractionResponse>;
}

// If I use interface insttead of type, I get an error. Why? I don't know. I'm not a typescript expert. This further blurs the line between types and interfaces.
export type Component<T extends Button | SelectMenu | TextInput> = {
  [P in keyof T]: T[P];
} & {
  custom_id: string;
  exec(interaction: Interaction, ...args: unknown[]): Promise<InteractionResponse>;
}

export function EphemeralResponse(message: InteractionResponseData | string): InteractionResponse {
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
      flags: MessageFlags.EPHEMERAL,
    },
  };
}

export function ActionRow(
  components: (Button | SelectMenu | TextInput)[]
) {
  return {
    type: 1,
    components,
  } as ActionRow;
}
