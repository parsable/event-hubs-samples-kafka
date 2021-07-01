const {Command, flags} = require('@oclif/command');
const DataFeedConsumer = require('consumer');
const {cli} = require('cli-ux')

class ConsumeCommand extends Command {
    async run() {
        const {flags} = this.parse(ConsumeCommand);
        const dataFeedConsumer = new DataFeedConsumer(
            flags.namespace,
            flags.hub,
            flags.tenant,
            flags.client,
            flags.secret
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

ConsumeCommand.description = `Data Feed consumer
...
A simple consumer which allows performing sanity checks. It connects to an Event Hub and listens for new messages.
Messages logged to the console.
`

ConsumeCommand.flags = {
    namespace: flags.string({char: 'n', description: 'Event Hubs namespace', required: true}),
    hub: flags.string({char: 'h', description: 'Event hub name', required: true}),
    tenant: flags.string({char: 't', description: 'Tenant ID', required: true}),
    client: flags.string({char: 'c', description: 'Client ID', required: true}),
    secret: flags.string({char: 's', description: 'Client secret', required: true}),
    group: flags.string({char: 'g', description: 'Consumer group'}),
}

module.exports = ConsumeCommand
