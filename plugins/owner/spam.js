export default {
   command: ['spam', 'spammsg'],
   category: 'owner',
   description: 'Kirim pesan berulang ke nomor tujuan',
   async run(m, { sock, isPrefix, command, text }) {
      if (!text) {
         return m.reply(
            `👉🏻 *Example 1 (ke chat ini)*: ${isPrefix + command} 5|Halo semua!\n\n` +
            `👉🏻 *Example 2 (ke nomor lain)*: ${isPrefix + command} 6281234567890|5|Halo!\n\n` +
            `⚠️ Maksimal 20 pesan sekali jalan.`
         )
      }

      const parts = text.split('|')
      let target = m.from // default: kirim ke chat ini
      let count = 1
      let message = ''

      // Cek format: nomor|jumlah|pesan
      if (parts.length >= 3) {
         const number = parts[0].replace(/\D/g, '')
         if (number.startsWith('0')) {
            target = '62' + number.slice(1) + '@s.whatsapp.net'
         } else if (number.startsWith('62')) {
            target = number + '@s.whatsapp.net'
         } else {
            target = '62' + number + '@s.whatsapp.net'
         }
         count = parseInt(parts[1]) || 1
         message = parts.slice(2).join('|').trim()
      } 
      // Format: jumlah|pesan (kirim ke chat ini)
      else if (parts.length === 2) {
         count = parseInt(parts[0]) || 1
         message = parts[1].trim()
      } 
      // Format: pesan doang (kirim 1 kali)
      else {
         message = text
      }

      // Validasi
      if (count > 20) {
         return m.reply('⚠️ Maksimal 20 pesan sekali jalan untuk keamanan akun.')
      }

      if (count < 1) {
         return m.reply('❌ Jumlah pesan minimal 1.')
      }

      if (!message) {
         return m.reply('❌ Pesan tidak boleh kosong.')
      }

      const targetDisplay = target === m.from ? 'chat ini' : target.replace('@s.whatsapp.net', '')
      m.reply(`⏳ Mengirim ${count} pesan ke ${targetDisplay}...`)

      try {
         for (let i = 0; i < count; i++) {
            await sock.sendMessage(target, {
               text: message
            })
            // Jeda 3 detik biar aman
            await new Promise(resolve => setTimeout(resolve, 3000))
         }

         m.reply(
            `✅ *Berhasil kirim ${count} pesan!*\n\n` +
            `📱 Target: ${targetDisplay}\n` +
            `💬 Pesan: ${message}`
         )
      } catch (error) {
         console.error(error)
         m.reply(
            `❌ Gagal mengirim pesan.\n${error?.message || error}`
         )
      }
   },
   owner: true
}
