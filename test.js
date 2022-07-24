const { createClient } = require('redis');

const client = createClient();

client.on('error', (err) => console.log('Redis Client Error', err));

async function test() {
    await client.connect();

const s = await client.set('key', 'value');

console.log(s)

}

test();