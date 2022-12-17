import Discord from "./mod.ts";
const bot = new Discord(
  Deno.env.get("DISCORD_TOKEN")!,
  Deno.env.get("DISCORD_PUBLIC_KEY")!,
);

Deno.serve((req) => {
  const DISCORD_ROUTE = new URLPattern({ pathname: "/discord" });
  if (DISCORD_ROUTE.test(req.url)) {
    return bot.handleDiscordRequest(req);
  }
  return new Response("Hello World");
});