# not-a-discord-bot

## This is not a discord bot, well sort of...

A discord bot without a bot, how is that even possible?! Let me explain. As you
may know, Discord has
[introduced](https://discord.com/blog/slash-commands-are-here) new way to create
commands called interactions which don't require your _bot_ to connect to the
Gateway using WebSockets. Instead, all you need is a web server that can handle
incoming requests from Discord. This allows you to create ~~bots~~ apps (that's
what I will call them now) in a stateless fashion using serverless platforms
such as [Cloudflare Workers](https://workers.cloudflare.com/) or
[Deno Deploy](https://deno.com/deploy). This libarary aim to provide a framework
for simplifying the process of creating, registering, and handling your
interactions.
