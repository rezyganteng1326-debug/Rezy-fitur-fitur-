export default {
   command: ['spam', 'spammsg'],
   category: 'owner',
   description: 'Kirim pesan berulang (bisa ke luar kontak)',
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
            await m.reply(`📤 Target: ${number}`)
         } else if (args.length >= 2) {
            count = parseInt(args[0]) || 1
            msg = args.slice(1).join('|').trim()
         } else {
            msg = text
         }

         if (count > 30) return m.reply('⚠️ Maks 30 pesan.')
         if (count < 1) return m.reply('⚠️ Min 1 pesan.')
         if (!msg) return m.reply(`⚠️ Format: ${isPrefix}spam 3|Halo`)

         await m.reply(`⏳ Mengirim ${count} pesan...`)

         for (let i = 0; i < count; i++) {
            // KIRIM PAKAI MENTIONS (biar dianggap dari kontak)
            await sock.sendMessage(target, { 
               text: msg,
               mentions: [m.sender] // Mention pengirim biar WA anggap personal
            })
            await new Promise(resolve => setTimeout(resolve, 3000))
         }

         await m.reply(`✅ Selesai kirim ${count} pesan!`)

      } catch (error) {
         await m.reply(`❌ Error: ${error.message}`)
         console.error(error)
      }
   },
   owner: true
}
