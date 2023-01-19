import * as Discord from "./types.ts";
import { crypto_check } from "https://deno.land/x/monocypher@v3.1.2-4/mod.ts";

export * from "./types.ts";
export default abstract class DiscordAPI {
  static readonly baseURL = "https://discord.com/api/v10/";

  constructor(private publicKey: string) {
    this.publicKey = publicKey;
  }

  /**
   * @param req The request from the Discord
   * @returns The response to send back to Discord
   */
  async requestHandler(req: Request): Promise<Response> {
    // Verify that the request is from Discord
    const sig = req.headers.get("X-Signature-Ed25519");
    const timestamp = req.headers.get("X-Signature-Timestamp");
    const message = await req.text();

    if (sig === null || timestamp === null) {
      return new Response("Forbidden", { status: 403 });
    }

    const enc = new TextEncoder();
    const isVerified = crypto_check(
      enc.encode(sig),
      enc.encode(this.publicKey),
      enc.encode(timestamp + message),
    );
    if (!isVerified) {
      return new Response("Invalid request signature", { status: 401 });
    }

    const data = JSON.parse(message) as Discord.Interaction;

    // Handle PING which is used by Discord to verify the endpoint
    if (data.type === Discord.InteractionType.PING) {
      return new Response(
        JSON.stringify({ type: Discord.InteractionResponseType.PONG }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Handle the interaction
    try {
      const res = await this.interactionHandler(data);
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
   * @param interaction The interaction from Discord
   * @returns An interaction response to send back to Discord
   */
  abstract interactionHandler(interaction: Discord.Interaction): Discord.InteractionResponse | Promise<Discord.InteractionResponse>;

  // REST API

  static Interaction = class {
    constructor(private appId: string, private token: string) {
      this.appId = appId;
      this.token = token;
    }

    private async fetch(endpoint: string, options?: RequestInit) {
      const res = await fetch(DiscordAPI.baseURL + endpoint, options);
      if (!res.ok) throw new Error(res.statusText);
      return res;
    }

    /**
     * Clear all commands and register the new commands
     * @param guildId The guild to register the command in
     * @param commands An array of commands to register
     * @returns The registered commands
     */
    async bulkOverwriteGuildCommands(
      guildId: string,
      commands: Discord.NewApplicationCommand[],
    ) {
      const res = await this.fetch(
        `${DiscordAPI.baseURL}/applications/${this.appId}/guilds/${guildId}/commands`,
        {
          method: "PUT",
          body: JSON.stringify(commands),
        },
      );
      return await res.json() as Discord.ApplicationCommand[];
    }

    async editOriginalInteractionResponse(msg: Discord.InteractionResponseData) {
      const res = await this.fetch(
        `${DiscordAPI.baseURL}/webhooks/${this.appId}/${this.token}/messages/@original`,
        {
          method: "PATCH",
          body: JSON.stringify(msg),
        },
      );
      return await res.json() as Discord.Message;
    }

    async deleteOriginalInteractionResponse() {
      await this.fetch(
        `${DiscordAPI.baseURL}/webhooks/${this.appId}/${this.token}/messages/@original`,
        {
          method: "DELETE",
        },
      );
    }

    async getOriginalInteractionResponse() {
      const res = await this.fetch(
        `${DiscordAPI.baseURL}/webhooks/${this.appId}/${this.token}/messages/@original`,
      );
      return await res.json() as Discord.Message;
    }
  };

  static Bot = class {
    constructor(private token: string) {
      this.token = token;
    }

    /**
     * Fetch wrapper for the Discord API endpoints that require bot authorization
     */
    private async fetch(endpoint: string, options?: RequestInit) {
      const res = await fetch(DiscordAPI.baseURL + endpoint, {
        ...options,
        headers: {
          "Authorization": "Bot " + this.token,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(res.statusText);
      return res;
    }

    /**
     * Send a message to a channel
     * @param channelId The id of the channel to send the message to
     * @param msg The message to send
     */
    async sendMessage(channelId: string, msg: string | Discord.NewMessage) {
      const data = typeof msg === "string" ? { content: msg } : msg;
      const res = await this.fetch(`channels/${channelId}/messages`, {
        method: "POST",
        body: JSON.stringify({ data }),
      });
      return await res.json() as Discord.Message;
    }

    /**
     * Create a DM channel with a user
     * @param userId The id of the user to create the DM with
     * @returns A channel
     */
    async createDM(userId: string) {
      const res = await this.fetch(`users/${userId}/channels`, {
        method: "POST",
      });
      return await res.json() as Discord.Channel;
    }

    /**
     * Add a role to a guild member. Requires the `MANAGE_ROLES` permission.
     * @param userId The id of the user to add the role to
     * @param guildId The id of the guild the user is in
     */
    async giveRole(userId: string, guildId: string, roleId: string) {
      const res = await this.fetch(
        `guilds/${guildId}/members/${userId}/roles/${roleId}`,
        {
          method: "PUT",
        },
      );
      return await res.json() as Discord.Role;
    }
  };
}
