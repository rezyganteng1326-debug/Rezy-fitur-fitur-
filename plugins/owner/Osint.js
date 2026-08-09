export default {
   command: ['osint', 'lookupwa', 'cekwa'],
   category: 'owner',
   description: 'OSINT WhatsApp - Cek data publik nomor (RapidAPI)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (!text) {
            return m.reply(
               `⚠️ *Format Salah!*\n\n` +
               `📌 ${isPrefix}osint 6281234567890\n\n` +
               `🔍 *Data yang didapat:*\n` +
               `• Status/About\n` +
               `• Foto Profil (base64)\n` +
               `• Akun Bisnis\n` +
               `• Perangkat Terhubung\n` +
               `• Status Pesan\n` +
               `• Pengaturan Privasi`
            )
         }

         // Bersihkan nomor
         let number = text.replace(/\D/g, '')
         if (number.startsWith('0')) number = '62' + number.slice(1)
         if (!number.startsWith('62')) number = '62' + number

         await m.reply(`⏳ Mencari data untuk ${number}...`)

         // === PANGGIL RAPIDAPI ===
         const rapidApiKey = process.env.RAPIDAPI_KEY || 'YOUR_RAPIDAPI_KEY'
         
         // Endpoint yang tersedia:
         // 1. about - cek status
         // 2. base64 - foto profil
         // 3. business - cek akun bisnis
         // 4. devices - perangkat terhubung
         // 5. doublecheck - status pesan
         // 6. privacy - pengaturan privasi

         const endpoints = [
            { name: 'about', label: '📝 Status/About' },
            { name: 'base64', label: '🖼️ Foto Profil' },
            { name: 'business', label: '🏢 Akun Bisnis' },
            { name: 'devices', label: '📱 Perangkat Terhubung' },
            { name: 'doublecheck', label: '✅ Status Pesan' },
            { name: 'privacy', label: '🔒 Pengaturan Privasi' }
         ]

         let result = `📱 *HASIL OSINT WA*\n\n`
         result += `🔢 Nomor: ${number}\n`

         for (const ep of endpoints) {
            try {
               const res = await fetch(`https://whatsapp-osint.p.rapidapi.com/${ep.name}?phone=${number}`, {
                  method: 'GET',
                  headers: {
                     'x-rapidapi-key': rapidApiKey,
                     'x-rapidapi-host': 'whatsapp-osint.p.rapidapi.com'
                  }
               })

               const data = await res.json()
               
               if (data && !data.error) {
                  let value = ''
                  if (typeof data === 'string') {
                     value = data
                  } else if (data.result) {
                     value = data.result
                  } else if (data.data) {
                     value = data.data
                  } else {
                     value = JSON.stringify(data).slice(0, 100)
                  }

                  if (ep.name === 'base64' && value.length > 50) {
                     // Foto profil dalam base64 (terlalu panjang, tampilkan info)
                     result += `${ep.label}: ✅ Ada (${value.length} karakter)\n`
                  } else if (value && value !== 'null' && value !== 'undefined') {
                     result += `${ep.label}: ${value}\n`
                  } else {
                     result += `${ep.label}: ❌ Tidak tersedia\n`
                  }
               } else {
                  result += `${ep.label}: ❌ Gagal ambil data\n`
               }
            } catch (e) {
               result += `${ep.label}: ❌ Error\n`
            }
         }

         result += `\n📊 *Sumber:* RapidAPI\n`
         result += `🕐 *Waktu:* ${new Date().toLocaleString('id-ID')}`

         await m.reply(result)

      } catch (error) {
         console.error('OSINT error:', error)
         await m.reply(`❌ Error: ${error.message}`)
      }
   },
   owner: true
                       }
