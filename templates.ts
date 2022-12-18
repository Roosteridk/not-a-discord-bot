import {
  CreateApplicationCommand,
  ButtonComponent,
  Interaction,
  InteractionResponse,
  InteractionResponseData,
  InteractionResponseType,
  MessageFlags,
  SelectMenuComponent,
  TextInputComponent,
} from "./types.ts";

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

// Utility functions
export function EphemeralResponse(data: InteractionResponseData, type = InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE) {
  return {
    type,
    data: {
      ...data,
      flags: MessageFlags.EPHEMERAL,
    },
  } as InteractionResponse;
}