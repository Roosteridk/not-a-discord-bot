import {
  ApplicationCommand,
  Channel,
  CreateApplicationCommand,
  CreateMessage,
  DiscordRole,
  Interaction,
  InteractionResponse,
  InteractionResponseType,
  InteractionType,
  Message,
} from "./types.ts";
import { crypto_check } from 'https://deno.land/x/monocypher@v3.1.2-4/mod.ts';

export class Discord {
  publicKey: string;
  appId: string;
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
    this.appId = applicationId;
    this.token = token;
  }

  /**
   * Handles a interaction callbacks from Discord
   * @param req The request from the Discord
   * @returns The response to send back to Discord
   */
  async handleDiscordRequest(req: Request): Promise<Response> {
    // Verify that the request is from Discord
    const sig = req.headers.get("X-Signature-Ed25519");
    const timestamp = req.headers.get("X-Signature-Timestamp");
    const message = await req.text();

    if (sig === null || timestamp === null) {
      return new Response("Forbidden", { status: 403 });
    }
    
    const enc = new TextEncoder();
    const isVerified = await crypto_check(
      enc.encode(sig),
      enc.encode(this.publicKey),
      enc.encode(timestamp + message),
    );
    if (!isVerified) {
      return new Response("Invalid request signature", { status: 401 });
    }

    const data = JSON.parse(message) as Interaction;
    // Handle PING which is used by Discord to verify the endpoint
    if (data.type === InteractionType.PING) {
      return new Response(JSON.stringify({ type: InteractionResponseType.PONG }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle the interaction
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
   * This is the default handler for interactions
   * You can modify this to your own needs. For example, you can add a switch case for each command or component.
   * @param _i The interaction to handle
   * @returns An InteractionResponse to send back to Discord
   */
  handleInteraction(
    _i: Interaction,
  ) {
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
   * Fetch wrapper for the Discord API
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
   * Clear all commands and registers the new commands
   * @param guildId The guild to register the command in
   * @param commands The command(s) to register
   * @returns The registered command(s)
   */
  async bulkOverwriteGuildCommands(
    guildId: string,
    commands: CreateApplicationCommand[],
  ) {
    const res = await this.fetch(
      `applications/${this.appId}/guilds/${guildId}/commands`,
      {
        method: "PUT",
        body: JSON.stringify(commands),
      },
    );
    return await res.json() as ApplicationCommand;
  }

  /**
   * Send a message to a channel
   * @param channelId The channel to send the message to
   * @param msg The message to send
   */
  async sendMessage(channelId: string, msg: string | CreateMessage) {
    const data = typeof msg === "string" ? { content: msg } : msg;
    const res = await this.fetch(`channels/${channelId}/messages`, {
      method: "POST",
      body: JSON.stringify({ data }),
    });
    return await res.json() as Message;
  }
  /**
   * Create a DM channel with a user
   * @param userId The user to create a DM channel with
   * @returns The channel object
   */
  async createDM(userId: string) {
    const res = await this.fetch(`users/${userId}/channels`, {
      method: "POST",
    });
    return await res.json() as Channel;
  }

  async editOriginalInteractionResponse(
    interactionToken: string,
    msg: CreateMessage,
  ) {
    const res = await this.fetch(
      `webhooks/${this.appId}/${interactionToken}/messages/@original`,
      {
        method: "PATCH",
        body: JSON.stringify(msg),
      },
    );
    return await res.json() as Message;
  }
  /**
   * Add a role to a guild member. Requires the `MANAGE_ROLES` permission.
   */
  async giveRole(userId: string, guildId: string, roleId: string) {
    const res = await this.fetch(
      `guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: "PUT",
      },
    );
    return await res.json() as DiscordRole;
  }
}
