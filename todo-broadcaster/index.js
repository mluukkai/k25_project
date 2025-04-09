
const { connect } = require("@nats-io/transport-node");

const NATS_URI = process.env.NATS_URI || 'nats://localhost:4222';

const main =  async () => {
  console.log(`Broadcaster runnig`);

  const nc = await connect({'servers': [ NATS_URI ]})
  const sub = nc.subscribe("todo");
  (async () => {
    for await (const m of sub) {
      const obj = JSON.parse(m.string());
      console.log(obj);
    }
    console.log("subscription closed");
  })();
}

main()