// plugins/owner/Grabify.js - Versi Servsly (Alternatif Grabify)

export default {
   command: ['grabify', 'track', 'grab'],
   category: 'owner',
   description: 'Buat link tracking (Servsly - alternatif Grabify)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (!text) {
            return m.reply(
               `⚠️ *Format Salah!*\n\n` +
               `📌 Buat link baru:\n` +
               `${isPrefix}grabify https://youtube.com|NamaKamu\n\n` +
               `📌 Cek hasil tracking:\n` +
               `${isPrefix}track [kode]`
            )
         }

         const parts = text.split('|')
         if (parts.length < 2) {
            return m.reply(`⚠️ Format: ${isPrefix}grabify https://youtube.com|NamaKamu`)
         }

         const url = parts[0].trim()
         const title = parts.slice(1).join('|').trim() || 'Link'

         if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return m.reply('⚠️ URL harus dimulai dengan http:// atau https://')
         }

         await m.reply(`⏳ Membuat link tracking di Servsly...`)

         // Pake Servsly API (gratis, ga perlu API key)
         const payload = {
            url: url,
            title: title
         }

         const res = await fetch('https://servsly.com/api/create', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
         })

         const data = await res.json()

         if (!data || !data.shortcode) {
            return m.reply(`❌ Gagal membuat link.\nError: ${data?.message || 'Unknown'}`)
         }

         await m.reply(
            `✅ *Link Tracking Berhasil Dibuat!*\n\n` +
            `🔗 Link: ${data.link}\n` +
            `📌 Title: ${title}\n` +
            `📋 Kode: ${data.shortcode}\n\n` +
            `📊 Cek hasil: ${isPrefix}track ${data.shortcode}`
         )

      } catch (error) {
         console.error('Servsly error:', error)
         await m.reply(`❌ Error: ${error.message}`)
      }
   },
   owner: true
}
