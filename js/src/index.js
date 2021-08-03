const {Command, flags} = require('@oclif/command');
const {cli} = require('cli-ux');
const msal = require('@azure/msal-node');
const {Kafka} = require('kafkajs');

class DataFeedConsumer {
    namespace;
    topic;
    tenantId;
    clientId;
    clientSecret;
    tokenRequest;
    fromBeginning;

    constructor(namespace, topic, tenantId, clientId, clientSecret, group, fromBeginning) {
        this.namespace = namespace;
        this.topic = topic;
        this.tenantId = tenantId;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.tokenRequest = {
            scopes: ['https://' + this.namespace + '.servicebus.windows.net/.default'],
        };
        this.group = group ? group : 'data-feed-cli-consumer';
        this.fromBeginning = fromBeginning;
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
        return kafka.consumer({groupId: this.group});
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
        await consumer.subscribe({topic: this.topic, fromBeginning: this.fromBeginning});

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


class ConsumeCommand extends Command {
    async run() {
        const {flags} = this.parse(ConsumeCommand);
        const dataFeedConsumer = new DataFeedConsumer(
            flags.namespace,
            flags.hub,
            flags.tenant,
            flags.client,
            flags.secret,
            flags.group,
            flags['from-beginning']
        );

        try {
            cli.action.start('Starting consumer');
            await dataFeedConsumer.start();
            cli.action.stop();
        } catch (e) {
            console.log(e);
        }
    }
}

ConsumeCommand.description = `Data Feed Consumer
A simple consumer which allows performing sanity checks. It connects to an Event Hub and listens for new messages.
Messages logged to the console.
`

ConsumeCommand.flags = {
    namespace: flags.string({char: 'n', description: 'Event Hubs namespace', required: true}),
    hub: flags.string({char: 'h', description: 'Event hub name', required: true}),
    tenant: flags.string({char: 't', description: 'Tenant ID', required: true}),
    client: flags.string({char: 'c', description: 'Client ID', required: true}),
    secret: flags.string({char: 's', description: 'Client secret', required: true}),
    group: flags.string({char: 'g', description: 'Consumer group', default: 'data-feed-cli-consumer'}),
    'from-beginning': flags.boolean({char: 'b', description: 'Read topic from the beginning', default: false})
}

ConsumeCommand.examples = [
    'datafeedconsumer -n my-eventhubs-namespace -h my-hub-name -t 793f32ca-fc7a-499a-ae14-eb5adee63165 -c 8742ab2d-6652-4d1b-a946-ed571f2bd39a -s my-client-secret --from-beginning'
];

module.exports = ConsumeCommand
