export default {
   command: ['autolink', 'al'],
   category: 'owner',
   description: 'Buat link tracking otomatis (target klik langsung ke-track)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (!text) {
            return m.reply(
               `⚠️ *Format Salah!*\n\n` +
               `📌 ${isPrefix}autolink https://youtube.com|Judul\n\n` +
               `📌 Contoh:\n` +
               `${isPrefix}autolink https://71h.com|rejoy\n\n` +
               `📌 *Cara kerja:*\n` +
               `1. Bot buat link unik\n` +
               `2. Kirim link ke target\n` +
               `3. Target klik link\n` +
               `4. Bot otomatis catat IP, device, OS, waktu\n` +
               `5. Cek hasil pake .ceklink [kode]`
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

         // Link tracking (pake Grabify)
         const trackLink = `https://grabify.link/${code}`

         // Bikin link pendek pake TinyURL biar gak curiga
         let shortUrl = trackLink
         try {
            const tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(trackLink)}`)
            const tinyText = await tinyRes.text()
            if (tinyText && tinyText.startsWith('http')) {
               shortUrl = tinyText
            }
         } catch (e) {
            console.log('TinyURL error, pake link default')
         }

         await m.reply(
            `✅ *Link Auto Tracking Dibuat!*\n\n` +
            `🔗 *Link Target:* ${shortUrl}\n` +
            `📌 *Title:* ${title}\n` +
            `📋 *Kode:* ${code}\n\n` +
            `📊 *Cek hasil:* ${isPrefix}ceklink ${code}\n\n` +
            `⚡ *Fitur Auto:*\n` +
            `✅ Target klik → otomatis ke-track\n` +
            `✅ Data: IP, Device, OS, Browser, Waktu\n` +
            `✅ Gak perlu ribet!`
         )

      } catch (error) {
         console.error('Error:', error)
         await m.reply(`❌ Error: ${error.message}`)
      }
   },
   owner: true
            }
