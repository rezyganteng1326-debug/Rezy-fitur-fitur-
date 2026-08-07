export default {
   command: ['pm'],
   category: 'owner',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      if (!text)
         return m.reply(
            `👉🏻 *Example*: ${isPrefix + command} 6281234567890|Halo, ini pesan pribadi`
         )

      const parts = text.split('|')

      if (parts.length < 2)
         return m.reply(
            `❌ Format salah.\n\n👉🏻 *Example*: ${isPrefix + command} 6281234567890|Halo, ini pesan pribadi`
         )

      let number = parts.shift().replace(/\D/g, '')
      const message = parts.join('|').trim()

      if (number.startsWith('0'))
         number = '62' + number.slice(1)

      if (!number)
         return m.reply('❌ Nomor tujuan tidak valid.')

      if (!message)
         return m.reply('❌ Pesan tidak boleh kosong.')

      try {
         const check = await sock.onWhatsApp(number)

         if (!check?.[0]?.exists)
            return m.reply(
               `❌ Nomor ${number} tidak terdeteksi sebagai akun WhatsApp.`
            )

         const jid = check[0].jid || `${number}@s.whatsapp.net`

         await sock.sendMessage(jid, {
            text: message
         })

         m.reply(
            `✅ *Pesan berhasil dikirim!*\n\n` +
            `📱 Nomor: ${number}\n` +
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
