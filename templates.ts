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

// Utility classes
export class EphemeralResponse implements InteractionResponse {
  type: InteractionResponseType =
    InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE;
  data: InteractionResponseData;

  constructor(data: InteractionResponseData, type?: InteractionResponseType) {
    this.data = data;
    this.data.flags = MessageFlags.EPHEMERAL;
    if (type !== undefined) {
      this.type = type;
    }
  }
}
