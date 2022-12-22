import {
  ApplicationCommand,
  Channel,
  CreateApplicationCommand,
  CreateMessage,
  Interaction,
  InteractionResponse,
  InteractionResponseData,
  InteractionType,
} from "./types.ts";
import * as ed from "npm:@noble/ed25519";

export class Discord {
  publicKey: string;
  applicationId: string;
  private token: string;
  private readonly discordApiUrl = "https://discord.com/api/v10/";

  /** The parameters are the same as the ones in the Discord Developer Portal */
  constructor(
    { token, publicKey, applicationId }: {
      token: string;
      publicKey: string;
      applicationId: string;
    },
  ) {
    this.publicKey = publicKey;
    this.applicationId = applicationId;
    this.token = token;
  }

  /**
   * Handles a interaction callbacks from Discord
   * @param req The request from the Discord
   * @returns The response to send back to Discord
   */
  async handleDiscordRequest(req: Request): Promise<Response> {
    // Verify that the request is from Discord
    const signature = req.headers.get("X-Signature-Ed25519");
    const timestamp = req.headers.get("X-Signature-Timestamp");
    const message = await req.text();

    if (signature === null || timestamp === null) {
      return new Response("Forbidden", { status: 403 });
    }

    const isVerified = await ed.verify(
      signature,
      new TextEncoder().encode(timestamp + message),
      this.publicKey,
    );
    if (!isVerified) {
      return new Response("Invalid request signature", { status: 401 });
    }

    const data = JSON.parse(message) as Interaction;
    // Handle PING which is used by Discord to verify the endpoint
    if (data.type === InteractionType.PING) {
      console.log("PING from Discord!");
      return new Response(JSON.stringify({ type: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const res = await this.handleInteraction(data);
      return new Response(JSON.stringify(res), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error(e);
      return new Response("Internal server error", { status: 500 });
    }
  }

  /**
   * This is the default handler for interactions which will import the command or component and execute it.
   * You can modify this to your own needs. For example, you can add a switch case for each command or component.
   * @param i The interaction to handle
   * @returns An InteractionResponse to send back to Discord
   */
  handleInteraction(
    i: Interaction,
  ): Promise<InteractionResponse> {
    const response: InteractionResponse = {
      type: 4,
      data: {
        content:
          "This is the default handler. You should modify it to your own needs.",
      },
    };
    return Promise.resolve(response);
  }

  // REST API methods
  /**
   * Fetch wrapper specific for the Discord API
   * @param endpoint The endpoint to fetch from the Discord API in the form of `channels/${channelId}/messages`
   * @param options The options to pass to the fetch function
   * @returns The response from the Discord API
   */
  private async fetch(endpoint: string, options?: RequestInit) {
    const res = await fetch(this.discordApiUrl + endpoint, {
      ...options,
      headers: {
        "Authorization": "Bot " + this.token,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error((await res.json()).message);
      return Promise.reject("Discord API error: " + res.statusText);
    }
    return res;
  }

  /**
   * Clears all commands and registers the new commands
   * @param guildId The guild to register the command in
   * @param commands The command(s) to register
   * @returns The registered command(s)
   */
  async bulkOverwriteGuildCommands(
    guildId: string,
    commands: CreateApplicationCommand[],
  ) {
    const res = await this.fetch(
      `applications/${this.applicationId}/guilds/${guildId}/commands`,
      {
        method: "PUT",
        body: JSON.stringify(commands),
      },
    );
    return await res.json() as ApplicationCommand;
  }

  /**
   * Sends a message to a channel
   * @param channelId The channel to send the message to
   * @param content The content of the message
   */
  async sendMessage(channelId: string, msg: string | CreateMessage) {
    const data = typeof msg === "string" ? { content: msg } : msg;
    return await this.fetch(`channels/${channelId}/messages`, {
      method: "POST",
      body: JSON.stringify({ data }),
    });
  }
  /**
   * Create a DM channel with a user
   * @param userId The user to create a DM channel with
   * @returns The channel object
   */
  async createDM(userId: string): Promise<Channel> {
    const res = await this.fetch(`users/${userId}/channels`, {
      method: "POST",
    });
    return await res.json();
  }

  async editOriginalInteractionResponse(
    token: string,
    data: InteractionResponseData,
  ) {
    return await this.fetch(
      `webhooks/${this.applicationId}/${token}/messages/@original`,
      {
        method: "PATCH",
        body: JSON.stringify({
          data,
        }),
      },
    );
  }
  /**
   * Adds a role to a guild member. Requires the `MANAGE_ROLES` permission.
   */
  async giveRole(userId: string, guildId: string, roleId: string) {
    return await this.fetch(
      `guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: "PUT",
      },
    );
  }
}
