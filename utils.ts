import {
  ActionRow,
  ButtonComponent,
  CreateApplicationCommand,
  Interaction,
  InteractionResponse,
  InteractionResponseData,
  InteractionResponseType,
  MessageFlags,
  SelectMenuComponent,
  TextInputComponent,
} from "./types.ts";

// These are utility functions and types that you can use in your code to help you write your commands and components

export interface Command extends CreateApplicationCommand {
  name: string;
  description: string;
  exec: (
    interaction: Interaction,
    ...options: unknown[]
  ) => Promise<InteractionResponse>;
  autocomplete?: (
    interaction: Interaction,
    ...options: unknown[]
  ) => Promise<InteractionResponse>;
}

export interface Component {
  custom_id: string;
  component: ButtonComponent | SelectMenuComponent | TextInputComponent;
  exec: (
    interaction: Interaction,
    ...options: unknown[]
  ) => Promise<InteractionResponse>;
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
  ...components: (ButtonComponent | SelectMenuComponent | TextInputComponent)[]
) {
  return {
    type: 1,
    components,
  } as ActionRow;
}
