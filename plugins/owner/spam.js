export default {
   command: ['spam', 'spammsg'],
   category: 'owner',
   description: 'Kirim pesan berulang (2 nomor bergantian)',
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

         // Batas 1000
         if (count > 1000) return m.reply('⚠️ Maksimal 1000 pesan.')
         if (count < 1) return m.reply('⚠️ Jumlah minimal 1.')
         if (!msg) return m.reply('⚠️ Pesan kosong.')

         // ===== AMBIL SEMUA DEVICE =====
         const devices = global.devices || []
         if (devices.length < 2) {
            return m.reply('⚠️ Butuh minimal 2 device di config!')
         }

         await m.reply(`⏳ Mengirim ${count} pesan dari ${devices.length} nomor...`)

         let berhasil = 0
         let gagal = 0
         let deviceIndex = 0
         const gagalList = []

         // ===== LOOPING SPAM =====
         for (let i = 0; i < count; i++) {
            // Pilih device bergantian (round-robin)
            const currentDevice = devices[deviceIndex % devices.length]
            deviceIndex++

            try {
               // Kirim dari device yang dipilih
               await global.sockMap?.[currentDevice.id]?.sendMessage(target, { text: msg })
               berhasil++
            } catch (e) {
               gagal++
               gagalList.push(i + 1)
               console.log(`[${currentDevice.id}] Pesan ke-${i+1} gagal:`, e.message)
            }

            // Jeda 1 detik
            await new Promise(resolve => setTimeout(resolve, 1000))
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
