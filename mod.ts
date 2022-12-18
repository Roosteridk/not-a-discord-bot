import {
  ApplicationCommandData,
  Channel,
  Interaction,
  InteractionResponse,
  InteractionType,
  MessageComponentData,
  InteractionResponseData
} from "./types.ts";
import { Command, Component } from "./templates.ts";
import { ed25519Verify } from "https://deno.land/x/polkadot@0.2.19/util-crypto/mod.ts";

export default class Discord {
  publicKey: string;
  applicationId: bigint;
  private auth: Headers;
  private readonly discordApiUrl = "https://discord.com/api/v8/";
  middleware?;
  /**
   * Creates a new Discord instance
   * @param publicKey The public key of the application (found in the Discord Developer Portal)
   */
  constructor(
    token: string,
    publicKey: string,
    applicationId: bigint,
    middleware?: (i: Interaction) => Promise<unknown | InteractionResponse>,
  ) {
    this.publicKey = publicKey;
    this.applicationId = applicationId;
    this.auth = new Headers({
      "Authorization": "Bot " + token,
    });
    this.middleware = middleware;
  }

  /**
   * Handles a interaction callbacks from Discord
   * @param req The request from the Discord
   * @returns The response to send back to Discord
   */
  async handleDiscordRequest(req: Request): Promise<Response> {
    // Verify the request
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
   * This maps the interaction type to the correct execution function.
   * Might make this abstract in the future...
   * @param i The interaction to handle
   * @returns An InteractionResponse to send back to Discord
   */
  private async handleInteraction(
    i: Interaction,
  ): Promise<InteractionResponse> {
    let middlewareRes: unknown;
    // Middleware can be used to intercept the interaction before it is handled
    // This is useful for things like logging or checking permissions
    // The result of the middleware is passed to the command or component
    if (this.middleware !== undefined) {
      middlewareRes = await this.middleware(i);
    }
    // If the middleware returns an InteractionResponse, we can just return that
    if(middlewareRes instanceof Promise<InteractionResponse>) {
      return middlewareRes;
    }

    switch (i.type) {
      case InteractionType.APPLICATION_COMMAND:
        return import(
          `./commands/${(i.data as ApplicationCommandData).name}.ts`
        )
          .then((c: Command) => c.exec(i, middlewareRes));
      case InteractionType.MESSAGE_COMPONENT || InteractionType.MODAL_SUBMIT:
        return import(
          `./components/${(i.data as MessageComponentData).custom_id}.ts`
        )
          .then((c: Component) => c.exec(i, middlewareRes));
      case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE:
        return import(
          `./commands/${(i.data as ApplicationCommandData).name}.ts`
        )
          .then((c: Command) => c.autocomplete!(i, middlewareRes));
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
  
  async editOriginalInteractionResponse(token: string, content: InteractionResponseData) {
    return await this.fetch(`webhooks/${this.applicationId}/${token}/messages/@original`, {
      method: "PATCH",
      body: JSON.stringify({
        content,
      }),
    });
  }
}