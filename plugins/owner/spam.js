export default {
   command: ['spam', 'spammsg'],
   category: 'owner',
   description: 'Kirim pesan berulang (auto retry kalo gagal)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (!text) {
            return m.reply(
               `⚠️ *Format Salah!*\n\n` +
               `📌 Kirim ke chat ini:\n` +
               `${isPrefix}spam 3|Halo\n\n` +
               `📌 Kirim ke nomor lain:\n` +
               `${isPrefix}spam 6281234567890|3|Halo`
            )
         }

         const parts = text.split('|')
         if (parts.length < 2) {
            return m.reply(`⚠️ Format: ${isPrefix}spam 3|Halo`)
         }

         let target = m.from
         let count = 1
         let msg = ''

         const firstPart = parts[0].trim()
         const isNumber = /^[0-9]+$/.test(firstPart) && firstPart.length > 5

         if (isNumber && parts.length >= 3) {
            let number = firstPart.replace(/\D/g, '')
            if (number.startsWith('0')) number = '62' + number.slice(1)
            if (!number.startsWith('62')) number = '62' + number
            target = number + '@s.whatsapp.net'
            count = parseInt(parts[1].trim()) || 1
            msg = parts.slice(2).join('|').trim()
            await m.reply(`📤 Target: ${number}`)
         } else {
            count = parseInt(parts[0].trim()) || 1
            msg = parts.slice(1).join('|').trim()
         }

         // Batas 1000 (sesuai request)
         if (count > 1000) return m.reply('⚠️ Maksimal 1000 pesan.')
         if (count < 1) return m.reply('⚠️ Jumlah minimal 1.')
         if (!msg) return m.reply('⚠️ Pesan kosong.')

         await m.reply(`⏳ Mengirim ${count} pesan... (butuh ±${count * 2} detik)`)

         let berhasil = 0
         let gagal = 0
         const gagalList = []

         for (let i = 0; i < count; i++) {
            try {
               await sock.sendMessage(target, { text: msg })
               berhasil++
               await new Promise(resolve => setTimeout(resolve, 100)) // 2 detik
            } catch (e) {
               gagal++
               gagalList.push(i + 1)
               console.log(`Pesan ke-${i+1} gagal:`, e.message)
               
               // Coba ulang 1x kalo gagal
               try {
                  await sock.sendMessage(target, { text: msg })
                  berhasil++
                  gagal--
                  gagalList.pop()
               } catch (e2) {
                  console.log(`Retry ke-${i+1} tetap gagal`)
               }
            }
         }

         let pesanHasil = `✅ Selesai!\n\n📨 Berhasil: ${berhasil} pesan\n❌ Gagal: ${gagal} pesan`
         if (gagalList.length > 0) {
            pesanHasil += `\n\n⚠️ Pesan gagal: #${gagalList.join(', #')}`
         }

         await m.reply(pesanHasil)

      } catch (error) {
         console.error(error)
         await m.reply(`❌ Error: ${error.message}`)
      }
   },
   owner: true
                  }
