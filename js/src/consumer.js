const msal = require('@azure/msal-node');
const {Kafka} = require('kafkajs');

class DataFeedConsumer {
    namespace;
    topic;
    tenantId;
    clientId;
    clientSecret;
    tokenRequest;

    constructor(namespace, topic, tenantId, clientId, clientSecret) {
        this.namespace = namespace;
        this.topic = topic;
        this.tenantId = tenantId;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
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
            throw `Error: Empty namespace.`;
        }
        if (!this.topic) {
            throw `Error: Empty topic.`;
        }
        if (!this.tenantId) {
            throw `Error: Empty tenant id.`;
        }
        if (!this.clientId) {
            throw `Error: Empty clientId.`;
        }
        if (!this.clientSecret) {
            throw `Error: Empty client secret.`;
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

module.exports = DataFeedConsumer;
