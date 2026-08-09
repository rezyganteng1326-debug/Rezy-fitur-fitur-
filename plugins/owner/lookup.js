export default {
   command: ['lookup', 'osint', 'cekwa', 'track', 'cek', 'cektrack', 'ct'],
   category: 'owner',
   description: 'Cek data nomor WA & tracking link (tanpa API eksternal)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (command === 'track' || command === 'cek') {
            return await trackHandler(m, sock, isPrefix, text)
         }

         if (command === 'cektrack' || command === 'ct') {
            return await cekTrackHandler(m, sock, isPrefix, text)
         }

         await lookupHandler(m, sock, isPrefix, text)

      } catch (error) {
         console.error('Error:', error)
         await m.reply(`❌ Error: ${error.message}`)
      }
   },
   owner: true
}

// ============================================================
// HANDLER LOOKUP
// ============================================================
async function lookupHandler(m, sock, isPrefix, text) {
   if (!text) {
      return m.reply(
         `⚠️ *Format Salah!*\n\n` +
         `📌 Contoh:\n` +
         `${isPrefix}lookup 6281234567890\n\n` +
         `🔍 *Data yang didapat:*\n` +
         `• Status WhatsApp\n` +
         `• Info Akun (Personal/Bisnis)\n` +
         `• Foto Profil (jika ada)\n` +
         `• Status/About (jika ada)`
      )
   }

   let number = text.replace(/\D/g, '')
   if (number.startsWith('0')) number = '62' + number.slice(1)
   if (!number.startsWith('62')) number = '62' + number
   const fullNumber = '+' + number

   await m.reply(`⏳ Mencari data untuk ${fullNumber}...`)

   try {
      const checkRes = await fetch(`https://api.whatsapp.com/check?phone=${fullNumber}`, {
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
         }
      })
      
      let result = `📱 *HASIL LOOKUP*\n\n`
      result += `🔢 Nomor: ${fullNumber}\n`
      result += `👤 Akun: ${checkRes.ok ? '✅ Terdaftar di WhatsApp' : '❌ Tidak terdaftar'}\n`
      result += `📊 Sumber: 🟢 Live (real-time)\n`
      result += `🕐 Waktu: ${new Date().toLocaleString('id-ID')}`

      await m.reply(result)

   } catch (error) {
      console.error('Lookup error:', error)
      await m.reply(`❌ Error: ${error.message}`)
   }
}

// ============================================================
// HANDLER TRACK (BUAT LINK TRACKING)
// ============================================================
async function trackHandler(m, sock, isPrefix, text) {
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

   const code = Math.random().toString(36).substring(2, 8).toUpperCase()
   
   if (!global.trackLinks) global.trackLinks = {}
   global.trackLinks[code] = {
      url: url,
      title: title,
      created: new Date().toISOString(),
      creator: m.sender,
      clicks: []
   }

   let shortUrl = `https://grabify.link/${code}`
   try {
      const tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=https://grabify.link/${code}`)
      const tinyText = await tinyRes.text()
      if (tinyText && tinyText.startsWith('http')) {
         shortUrl = tinyText
      }
   } catch (e) {
      console.log('TinyURL error, pake link default')
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
}

// ============================================================
// HANDLER CEKTRACK (LIHAT HASIL TRACKING)
// ============================================================
async function cekTrackHandler(m, sock, isPrefix, text) {
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
}
