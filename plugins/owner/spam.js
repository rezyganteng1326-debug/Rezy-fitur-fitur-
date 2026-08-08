// plugins/owner/spam.js
export const name = 'spam';
export const description = 'Kirim pesan berulang';

export async function execute(client, message, args) {
    const count = parseInt(args[0]) || 1;
    const text = args.slice(1).join(' ') || 'Hai';

    if (count > 30) {
        return message.reply('⚠️ Maksimal 20 pesan sekali jalan.');
    }

    for (let i = 0; i < count; i++) {
        await client.sendMessage(message.from, text);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
