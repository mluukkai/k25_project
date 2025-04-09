
const { connect } = require("@nats-io/transport-node");
const { Webhook, MessageBuilder } = require('discord-webhook-node');

const NATS_URI = process.env.NATS_URI || 'nats://localhost:4222';
const WEBHOOK = process.env.WEBHOOK || 'https://study.cs.helsinki.fi/discord/webhooks/1264842173619109949';

const hook = new Webhook(WEBHOOK);

const main =  async () => {
  console.log(`Broadcaster runnig`);

  const nc = await connect({'servers': [ NATS_URI ]})
  const sub = nc.subscribe("todo");
  (async () => {
    for await (const m of sub) {
      try {
        const object = JSON.parse(m.string());

        const embed = new MessageBuilder()
        .setAuthor('Todo app broadcaster')
        .setTitle('DevOps with Kubernetes')
        .addField(`todo ${object.action}`, object.todo.content)
        .setColor('#00b0f4')
        .setURL('https://devopswithkubernetes.com/')
        .setTimestamp();
        
        await hook.send(embed);
      }
      catch (err) {
        if (err.toString().includes("Error: Error sending webhook: 200 status code. Response: Webhook sent successfully")) {
          console.log("Webhook sent successfully");
        } else {
          console.log(err);
        }
      }

    }
    console.log("subscription closed");
  })();
}

main()