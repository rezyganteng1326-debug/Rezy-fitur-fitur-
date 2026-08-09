export default {
   command: ['buatlink', 'bl'],
   category: 'owner',
   description: 'Buat link tracking manual (buka browser)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (!text) {
            return m.reply(
               `⚠️ *Format Salah!*\n\n` +
               `📌 ${isPrefix}buatlink https://youtube.com|Judul\n\n` +
               `📌 Cara pakai:\n` +
               `1. Buka https://grabify.link di browser\n` +
               `2. Paste URL tujuan\n` +
               `3. Copy link pendek\n` +
               `4. Kirim ke target\n` +
               `5. Cek di ${isPrefix}track [kode]`
            )
         }

         const parts = text.split('|')
         if (parts.length < 2) {
            return m.reply(`⚠️ Format: ${isPrefix}buatlink https://youtube.com|Judul`)
         }

         const url = parts[0].trim()
         const title = parts.slice(1).join('|').trim() || 'Link'

         await m.reply(
            `📌 *LINK TRACKING MANUAL*\n\n` +
            `🔗 Buka browser: https://grabify.link\n` +
            `📌 Paste URL: ${url}\n` +
            `📌 Title: ${title}\n\n` +
            `📋 Setelah bikin link, cek dengan:\n` +
            `${isPrefix}track [kode]`
         )

      } catch (error) {
         console.error('Error:', error)
         await m.reply(`❌ Error: ${error.message}`)
      }
   },
   owner: true
}
