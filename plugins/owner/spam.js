// plugins/spamPlugin.js
module.exports = {
    id: 'spamPlugin',
    plugin: function() {
        // this = instance wabot
        this.onMessage(async (message) => {
            if (message.body.startsWith('!spam')) {
                const args = message.body.split(' ');
                const count = parseInt(args[1]) || 1;
                const text = args.slice(2).join(' ') || 'Halo';
                for (let i = 0; i < count; i++) {
                    await this.sendText(message.from, text);
                    await this.delay(1000); // jeda 3 detik
                }
            }
        });
    }
};
