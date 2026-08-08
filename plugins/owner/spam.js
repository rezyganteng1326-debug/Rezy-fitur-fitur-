// plugins/owner/spam.js (ES Module version)
export const name = 'spam';
export const alias = ['spammsg', 'spamchat'];
export const category = 'owner';
export const description = 'Kirim pesan berulang kali (⚠️ berisiko banned)';
export const isOwner = true; // khusus owner

export async function run(client, message, args) {
    // Format: .spam 5 Halo semua!
    const count = parseInt(args[0]) || 1;
    const text = args.slice(1).join(' ') || 'Hai';

    // Batas aman
    if (count > 50) {
        return message.reply('⚠️ Maksimal 20 pesan sekali jalan.');
    }

    if (count < 1) {
        return message.reply('Gunakan: .spam <jumlah> <pesan>');
    }

    // Kirim pesan
    for (let i = 0; i < count; i++) {
        await client.sendMessage(message.from, { text: text });
        // Jeda 3 detik biar aman
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await message.reply(`✅ Berhasil kirim ${count} pesan!`);
}
