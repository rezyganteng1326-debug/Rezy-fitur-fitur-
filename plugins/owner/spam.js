export default {
   command: ['spam', 'spammsg'],
   category: 'owner',
   description: 'Kirim pesan berulang (debug mode)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         const args = text.split('|')
         let target = m.from
         let count = 1
         let msg = ''

         const firstArg = args[0] || ''
         const isNumber = /^[0-9]+$/.test(firstArg) && firstArg.length > 5

         if (isNumber && args.length >= 3) {
            let number = firstArg.replace(/\D/g, '')
            if (number.startsWith('0')) number = '62' + number.slice(1)
            if (!number.startsWith('62')) number = '62' + number
            target = number + '@s.whatsapp.net'
            count = parseInt(args[1]) || 1
            msg = args.slice(2).join('|').trim()
         } else if (args.length >= 2) {
            count = parseInt(args[0]) || 1
            msg = args.slice(1).join('|').trim()
         } else {
            msg = text
         }

         if (count > 30) return m.reply('Maks 30 pesan.')
         if (count < 1) return m.reply('Min 1 pesan.')
         if (!msg) return m.reply('Format: .spam 3|Halo')

         // DEBUG: tampilkan info sebelum kirim
         await m.reply(
            `📋 *DEBUG INFO*\n` +
            `Target: ${target}\n` +
            `Jumlah: ${count}\n` +
            `Pesan: ${msg}\n\n` +
            `⏳ Mulai mengirim...`
         )

         for (let i = 0; i < count; i++) {
            await sock.sendMessage(target, { text: msg })
            await new Promise(resolve => setTimeout(resolve, 3000))
         }

         await m.reply(`✅ Selesai kirim ${count} pesan!`)

      } catch (error) {
         // Tampilkan error detail
         await m.reply(
            `❌ *ERROR DETAIL*\n\n` +
            `Message: ${error.message}\n` +
            `Stack: ${error.stack?.slice(0, 200) || 'Tidak ada'}`
         )
         console.error(error)
      }
   },
   owner: true
}
