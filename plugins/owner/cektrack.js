export default {
   command: ['cektrack', 'ct'],
   category: 'owner',
   description: 'Cek hasil tracking link',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (!text) {
            return m.reply(
               `⚠️ *Format Salah!*\n\n` +
               `📌 ${isPrefix}cektrack [kode]\n` +
               `📌 Contoh: ${isPrefix}cektrack ABC123`
            )
         }

         const code = text.trim().toUpperCase()
         const data = global.trackLinks?.[code]

         if (!data) {
            return m.reply(
               `❌ Kode ${code} tidak ditemukan.\n\n` +
               `📌 Buat link dulu pake:\n` +
               `${isPrefix}track https://link.com|Judul`
            )
         }

         const clicks = data.clicks || []
         let result = `📊 *HASIL TRACKING*\n\n`
         result += `🔗 Kode: ${code}\n`
         result += `📌 Title: ${data.title}\n`
         result += `🖱️ Total Klik: ${clicks.length}\n\n`

         if (clicks.length === 0) {
            result += `📭 Belum ada yang klik link ini.\n`
            result += `📌 Kirim link ke target.`
         } else {
            const recent = clicks.slice(-5).reverse()
            result += `📋 *${recent.length} Klik Terakhir:*\n`
            
            for (const click of recent) {
               result += `\n🔹 *Klik #${click.id}*\n`
               if (click.ip) result += `   📍 IP: ${click.ip}\n`
               if (click.device) result += `   📱 Perangkat: ${click.device}\n`
               if (click.os) result += `   🖥️ OS: ${click.os}\n`
               if (click.browser) result += `   🌐 Browser: ${click.browser}\n`
               if (click.time) result += `   🕐 Waktu: ${click.time}\n`
            }
         }

         await m.reply(result)

      } catch (error) {
         console.error('Error:', error)
         await m.reply(`❌ Error: ${error.message}`)
      }
   },
   owner: true
           }
