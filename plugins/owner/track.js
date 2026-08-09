export default {
   command: ['autolink', 'al'],
   category: 'owner',
   description: 'Buat link tracking (target reply "udah" ke bot)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (!text) {
            return m.reply(
               `⚠️ *Format Salah!*\n\n` +
               `📌 ${isPrefix}autolink https://youtube.com|Judul\n\n` +
               `📌 Contoh:\n` +
               `${isPrefix}autolink https://71h.com|rejoy\n\n` +
               `📌 *Cara pakai:*\n` +
               `1. Kirim link ke target\n` +
               `2. Target klik link\n` +
               `3. Target reply ke bot: "udah" atau "klik"\n` +
               `4. Bot catat data (IP, device, OS, waktu)\n` +
               `5. Cek pake .ceklink [kode]`
            )
         }

         const parts = text.split('|')
         if (parts.length < 2) {
            return m.reply(`⚠️ Format: ${isPrefix}autolink https://youtube.com|Judul`)
         }

         const url = parts[0].trim()
         const title = parts.slice(1).join('|').trim() || 'Link'

         if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return m.reply('⚠️ URL harus dimulai dengan http:// atau https://')
         }

         const code = Math.random().toString(36).substring(2, 8).toUpperCase()
         
         if (!global.trackLinks) global.trackLinks = {}
         global.trackLinks[code] = {
            url: url,
            title: title,
            created: new Date().toISOString(),
            creator: m.sender,
            clicks: []
         }

         // Bikin link pendek pake TinyURL
         let shortUrl = url
         try {
            const tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
            const tinyText = await tinyRes.text()
            if (tinyText && tinyText.startsWith('http')) {
               shortUrl = tinyText
            }
         } catch (e) {
            console.log('TinyURL error, pake link asli')
         }

         await m.reply(
            `✅ *Link Tracking Dibuat!*\n\n` +
            `🔗 *Link Target:* ${shortUrl}\n` +
            `📌 *Title:* ${title}\n` +
            `📋 *Kode:* ${code}\n\n` +
            `📌 *Kirim link ke target!*\n` +
            `📌 *Target klik link, lalu reply ke bot:*\n` +
            `   "udah" atau "klik" atau "done"\n\n` +
            `📊 *Cek hasil:* ${isPrefix}ceklink ${code}`
         )

      } catch (error) {
         console.error('Error:', error)
         await m.reply(`❌ Error: ${error.message}`)
      }
   },
   owner: true
}
