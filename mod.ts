import {
  ApplicationCommand,
  Channel,
  CreateApplicationCommand,
  Interaction,
  InteractionResponse,
  InteractionResponseData,
  InteractionType,
} from "./types.ts";
import { Command, Component } from "./utils.ts";
import { ed25519Verify } from "https://deno.land/x/polkadot@0.2.19/util-crypto/mod.ts";

export default class Discord {
  publicKey: string;
  applicationId: string;
  private auth: Headers;
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
    this.auth = new Headers({
      "Authorization": "Bot " + token,
    });
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

    const isVerified = await ed25519Verify(
      timestamp + message,
      signature,
      this.publicKey,
    );
    if (!isVerified) {
      return new Response("Invalid request signature", { status: 401 });
    }

    const data = await req.json() as Interaction;
    // Handle PING which is used by Discord to verify the endpoint
    if (data.type === InteractionType.PING) {
      return new Response(JSON.stringify({ type: 1 }), { status: 200 });
    }

    try {
      const res = await this.handleInteraction(data);
      return new Response(JSON.stringify(res), { status: 200 });
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
    switch (i.type) {
      case InteractionType.APPLICATION_COMMAND:
        return import(
          `./commands/${i.data.name}.ts`
        ).then((c: Command) => c.exec(i));
      case InteractionType.MESSAGE_COMPONENT || InteractionType.MODAL_SUBMIT:
        return import(
          `./components/${i.data.custom_id}.ts`
        ).then((c: Component<any>) => c.exec(i));
      case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE:
        return import(
          `./commands/${i.data.name}.ts`
        ).then((c: Command) => c.autocomplete!(i));
      default:
        throw new Error("Unknown interaction type");
    }
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
        ...this.auth,
        ...options?.headers,
      },
    });

    if (!res.ok) {
      console.error((await res.json()).message);
      return Promise.reject("Discord API error: " + res.statusText);
    }
    return res;
  }

  /**
   * Registers guild-scoped commands. This will overwrite any existing commands with the same name.
   * @param guildId The guild to register the command in
   * @param commands The command(s) to register
   * @returns The registered command(s)
   */
  registerGuildCommands(
    guildId: bigint,
    commands: CreateApplicationCommand[],
  ) {
    return Promise.all(commands.map(async (c) => {
      const res = await this.fetch(
        `applications/${this.applicationId}/guilds/${guildId}/commands`,
        {
          method: "POST",
          body: JSON.stringify(c),
        },
      );
      return await res.json() as ApplicationCommand;
    }));
  }

  /**
   * Sends a message to a channel
   * @param channelId The channel to send the message to
   * @param content The content of the message
   */
  async sendMessage(channelId: string, content: string) {
    return await this.fetch(`channels/${channelId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content: content,
      }),
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
  async giveRole(userId: bigint, guildId: bigint, roleId: bigint) {
    return await this.fetch(
      `guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: "PUT",
      },
    );
  }
}
