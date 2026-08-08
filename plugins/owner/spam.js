export default {
   command: ['spam', 'spammsg'],
   category: 'owner',
   description: 'Kirim pesan berulang ke nomor tujuan',
   async run(m, { sock, isPrefix, command, text }) {
      // Format: .spam 628xxxx|5|pesan
      // Atau: .spam 5|pesan (kirim ke chat ini)
      
      const args = text.split('|')
      let target = m.from
      let count = 1
      let msg = ''

      // Cek apakah ada nomor
      const firstArg = args[0] || ''
      const isNumber = /^[0-9]+$/.test(firstArg) && firstArg.length > 5

      if (isNumber && args.length >= 3) {
         // Format: nomor|jumlah|pesan
         let number = firstArg.replace(/\D/g, '')
         if (number.startsWith('0')) number = '62' + number.slice(1)
         if (!number.startsWith('62')) number = '62' + number
         target = number + '@s.whatsapp.net'
         count = parseInt(args[1]) || 1
         msg = args.slice(2).join('|').trim()
      } else if (args.length >= 2) {
         // Format: jumlah|pesan (kirim ke chat ini)
         count = parseInt(args[0]) || 1
         msg = args.slice(1).join('|').trim()
      } else {
         // Format: pesan doang
         msg = text
      }

      // Validasi
      if (count > 20) {
         return m.reply('Maksimal 20 pesan sekali jalan.')
      }
      if (count < 1) {
         return m.reply('Jumlah minimal 1.')
      }
      if (!msg) {
         return m.reply('Format: .spam 5|Halo atau .spam 628xxx|5|Halo')
      }

      const targetName = target === m.from ? 'chat ini' : target.replace('@s.whatsapp.net', '')
      await m.reply(`Mengirim ${count} pesan ke ${targetName}...`)

      try {
         for (let i = 0; i < count; i++) {
            await sock.sendMessage(target, { text: msg })
            await new Promise(resolve => setTimeout(resolve, 3000))
         }
         await m.reply(`Berhasil kirim ${count} pesan!`)
      } catch (e) {
         await m.reply(`Error: ${e.message}`)
      }
   },
   owner: true
            }
