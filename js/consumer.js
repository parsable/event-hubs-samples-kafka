const msal = require('@azure/msal-node');
const {Kafka} = require('kafkajs');

const namespace = "<REPLACE WITH YOUR EVENT HUBS NAMESPACE>";
const tenantId = "<REPLACE WITH YOUR TENANT ID>";
const msalConfig = {
    auth: {
        authority: "https://login.microsoftonline.com/" + tenantId,
        clientId: "<REPLACE WITH YOUR CLIENT ID>",
        clientSecret: "<REPLACE WITH YOUR CLIENT SECRET>",
    }
};

const cca = new msal.ConfidentialClientApplication(msalConfig)

const tokenRequest = {
    scopes: ['https://' + namespace + '.servicebus.windows.net/.default'],
};

async function azureAuth() {
    let token = await cca.acquireTokenByClientCredential(tokenRequest);
    console.log("Azure token acquired")
    console.log(token)
    return token;
}

const kafka = new Kafka({
    clientId: 'test-js-consumer',
    brokers: [namespace + '.servicebus.windows.net:9093'],
    // authenticationTimeout: 1000,
    // reauthenticationThreshold: 10000,
    ssl: true,
    sasl: {
        mechanism: 'oauthbearer',
        oauthBearerProvider: async () => {
            let authenticationResult = await azureAuth();
            return {
                value: authenticationResult.accessToken
            };
        }
    },
});

const consumer = kafka.consumer({groupId: 'test-js-consumer'})

async function startConsuming() {
    await consumer.connect();
    await consumer.subscribe({topic: 'test'})

    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            console.log({
                key: message.key,
                value: message.value.toString(),
                headers: message.headers,
            });
        },
    })
}

startConsuming();
