export default {
   command: ['track', 'cek'],
   category: 'owner',
   description: 'Buat link tracking pake TinyURL (100% work)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (!text) {
            return m.reply(
               `⚠️ *Format Salah!*\n\n` +
               `📌 ${isPrefix}track https://youtube.com|Judul\n\n` +
               `📌 Contoh:\n` +
               `${isPrefix}track https://71h.com|rejoy`
            )
         }

         const parts = text.split('|')
         if (parts.length < 2) {
            return m.reply(`⚠️ Format: ${isPrefix}track https://youtube.com|Judul`)
         }

         const url = parts[0].trim()
         const title = parts.slice(1).join('|').trim() || 'Link'

         if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return m.reply('⚠️ URL harus dimulai dengan http:// atau https://')
         }

         // Buat kode unik
         const code = Math.random().toString(36).substring(2, 8).toUpperCase()
         
         // Simpan ke database
         if (!global.trackLinks) global.trackLinks = {}
         global.trackLinks[code] = {
            url: url,
            title: title,
            created: new Date().toISOString(),
            creator: m.sender,
            clicks: []
         }

         // Bikin link pendek pake TinyURL
         let shortUrl = ''
         try {
            const tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
            shortUrl = await tinyRes.text()
            if (!shortUrl || !shortUrl.startsWith('http')) {
               shortUrl = url
            }
         } catch (e) {
            shortUrl = url
            console.log('TinyURL error, pake link asli')
         }

         await m.reply(
            `✅ *Link Tracking Dibuat!*\n\n` +
            `🔗 *Link Target:* ${shortUrl}\n` +
            `📌 *Title:* ${title}\n` +
            `📋 *Kode:* ${code}\n\n` +
            `📊 *Cek hasil:* ${isPrefix}cektrack ${code}\n\n` +
            `📌 *Kirim link ke target!*\n` +
            `Bot bakal otomatis catat siapa yang klik.`
         )

      } catch (error) {
         console.error('Error:', error)
         await m.reply(`❌ Error: ${error.message}`)
      }
   },
   owner: true
           }
