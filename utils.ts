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

export function EphemeralResponse(
  data: InteractionResponseData,
  type = InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
) {
  return {
    type,
    data: {
      ...data,
      flags: MessageFlags.EPHEMERAL,
    },
  } as InteractionResponse;
}

export function ActionRow(
  ...components: (ButtonComponent | SelectMenuComponent | TextInputComponent)[]
) {
  return {
    type: 1,
    components,
  } as ActionRow;
}