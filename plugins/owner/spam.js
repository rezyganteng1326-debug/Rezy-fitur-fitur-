export const name = 'spam';
export const alias = ['spammsg'];
export const category = 'owner';
export const description = 'Kirim pesan berulang kali';
export const isOwner = true;

export async function run(client, message, args) {
    const count = parseInt(args[0]) || 1;
    const text = args.slice(1).join(' ') || 'Hai';

    if (count > 20) {
        return message.reply('⚠️ Maksimal 20 pesan sekali jalan.');
    }

    if (count < 1) {
        return message.reply('Gunakan: .spam <jumlah> <pesan>');
    }

    // Kirim pesan
    for (let i = 0; i < count; i++) {
        await client.sendMessage(message.from, { text: text });
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    await message.reply(`✅ Berhasil kirim ${count} pesan!`);
}
