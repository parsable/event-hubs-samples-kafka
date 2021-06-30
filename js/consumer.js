const msal = require('@azure/msal-node');
const {Kafka} = require('kafkajs');

const clusterVarName = 'DATA_FEED_CLUSTER';
const topicVarName = 'DATA_FEED_TOPIC';
const tenantVarName = 'DATA_FEED_TENANT_ID';
const clientVarName = 'DATA_FEED_CLIENT_ID';
const secretVarName = 'DATA_FEED_CLIENT_SECRET';


class DataFeedConsumer {
    namespace;
    topic;
    tenantId;
    clientId;
    clientSecret;
    tokenRequest;

    constructor() {
        this.initFromEnv();
    }

    initFromEnv() {
        this.namespace = process.env[clusterVarName];
        this.topic = process.env[topicVarName];
        this.tenantId = process.env[tenantVarName];
        this.clientId = process.env[clientVarName];
        this.clientSecret = process.env[secretVarName];
        this.tokenRequest = {
            scopes: ['https://' + this.namespace + '.servicebus.windows.net/.default'],
        };
    }

    createKafka() {
        return new Kafka({
            clientId: 'test-js-consumer',
            brokers: [this.namespace + '.servicebus.windows.net:9093'],
            // authenticationTimeout: 1000,
            // reauthenticationThreshold: 10000,
            ssl: true,
            sasl: {
                mechanism: 'oauthbearer',
                oauthBearerProvider: async () => {
                    let authenticationResult = await this.azureAuth();
                    return {
                        value: authenticationResult.accessToken
                    };
                }
            },
        });
    }

    createConsumer() {
        const kafka = this.createKafka();
        return kafka.consumer({groupId: 'test-js-consumer'});
    }

    async azureAuth() {
        let token = await this.cca.acquireTokenByClientCredential(this.tokenRequest);
        console.log("Azure token acquired")
        return token;
    }

    async start() {
        this.validate();
        this.initClientApp();

        const consumer = this.createConsumer();
        await consumer.connect();
        await consumer.subscribe({topic: this.topic});

        await consumer.run({
            eachMessage: async ({topic, partition, message}) => {
                console.log({
                    key: message.key,
                    value: message.value.toString(),
                    headers: message.headers,
                });
            },
        });
    }

    validate() {
        if (!this.namespace) {
            throw `Error: Empty namespace. Set env var: ${clusterVarName}`;
        }
        if (!this.topic) {
            throw `Error: Empty topic. Set env var: ${topicVarName}`;
        }
        if (!this.tenantId) {
            throw `Error: Empty tenant id. Set env var: ${tenantVarName}`;
        }
        if (!this.clientId) {
            throw `Error: Empty clientId. Set env var: ${clientVarName}`;
        }
        if (!this.clientSecret) {
            throw `Error: Empty client secret. Set env var: ${secretVarName}`;
        }
    }

    initClientApp() {
        let msalConfig = {
            auth: {
                authority: 'https://login.microsoftonline.com/' + this.tenantId,
                clientId: this.clientId,
                clientSecret: this.clientSecret,
            }
        };
        this.cca = new msal.ConfidentialClientApplication(msalConfig);
    }
}

async function startConsuming() {
    const dataFeedConsumer = new DataFeedConsumer();

    try {
        await dataFeedConsumer.start();
    } catch (e) {
        console.log(e);
    }
}

module.exports = DataFeedConsumer;

startConsuming();
