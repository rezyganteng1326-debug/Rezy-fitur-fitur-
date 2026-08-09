export default {
   command: ['osintgacor', 'og', 'osintmax'],
   category: 'owner',
   description: 'OSINT ULTIMATE - Provider Fix Indonesia',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (!text) {
            return m.reply(
               `🔥 *OSINT ULTIMATE - PALING GACOR!*\n\n` +
               `📌 ${isPrefix}osintgacor 6281234567890\n\n` +
               `📊 *Data yang didapat:*\n` +
               `✅ WhatsApp\n✅ Telegram\n✅ Truecaller\n✅ GetContact\n✅ Provider SIM (prefix Indonesia)\n` +
               `✅ Lokasi & Koordinat\n✅ Media Sosial (6 platform)\n✅ Email & Username\n✅ Leak Database (HIBP)`
            )
         }

         let number = text.replace(/\D/g, '')
         if (number.startsWith('0')) number = '62' + number.slice(1)
         if (!number.startsWith('62')) number = '62' + number
         const fullNumber = '+' + number

         await m.reply(`⏳ *OSINT ULTIMATE* memindai ${fullNumber}...\n⏱️ Proses 2-3 menit`)

         let result = `🔥 *OSINT ULTIMATE - HASIL LENGKAP*\n\n`
         result += `📱 *Target:* ${fullNumber}\n`
         result += `🕐 *Waktu:* ${new Date().toLocaleString('id-ID')}\n\n`

         // ============================================================
         // SEKSI 1: WHATSAPP & TELEGRAM
         // ============================================================
         result += `╭─❑ *MESSENGER*\n`
         
         // WhatsApp
         try {
            const waRes = await fetch(`https://api.whatsapp.com/check?phone=${fullNumber}`, {
               headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            const waText = await waRes.text()
            const isWA = waText.includes('true') || waText.includes('1')
            result += `│ ${isWA ? '✅' : '❌'} WhatsApp: ${isWA ? 'Terdaftar' : 'Tidak terdaftar'}\n`
         } catch (e) {
            result += `│ ⚠️ WhatsApp: Gagal cek\n`
         }

         // Telegram
         try {
            const tgRes = await fetch(`https://t.me/${number}`, {
               headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            const tgText = await tgRes.text()
            const isTG = !tgText.includes('The username is not taken')
            result += `│ ${isTG ? '✅' : '❌'} Telegram: ${isTG ? 'Ada akun' : 'Tidak ditemukan'}\n`
         } catch (e) {
            result += `│ ⚠️ Telegram: Gagal cek\n`
         }

         result += `╰───────────────────\n\n`

         // ============================================================
         // SEKSI 2: NAMA (MULTI SOURCE)
         // ============================================================
         result += `╭─❑ *IDENTITAS & NAMA*\n`
         let identityFound = false

         // Truecaller
         try {
            const tcRes = await fetch(`https://www.truecaller.com/search?q=${number}`, {
               headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            })
            const tcText = await tcRes.text()
            const nameMatch = tcText.match(/<span[^>]*class="name"[^>]*>([^<]+)<\/span>/)
            if (nameMatch && nameMatch[1].length < 100) {
               result += `│ 👤 Truecaller: ${nameMatch[1]}\n`
               identityFound = true
            }
         } catch (e) {}

         // GetContact
         if (!identityFound) {
            try {
               const gcRes = await fetch(`https://api.getcontact.com/v1/name/${number}`, {
                  headers: { 'User-Agent': 'Mozilla/5.0' }
               })
               const gcData = await gcRes.json()
               if (gcData && gcData.name) {
                  result += `│ 👤 GetContact: ${gcData.name}\n`
                  identityFound = true
               }
            } catch (e) {}
         }

         // Google
         if (!identityFound) {
            try {
               const gRes = await fetch(`https://www.google.com/search?q=${fullNumber}`, {
                  headers: { 'User-Agent': 'Mozilla/5.0' }
               })
               const gText = await gRes.text()
               const gMatch = gText.match(/<h3[^>]*>([^<]+)<\/h3>/)
               if (gMatch && gMatch[1].length < 100) {
                  result += `│ 👤 Google: ${gMatch[1]}\n`
                  identityFound = true
               }
            } catch (e) {}
         }

         if (!identityFound) {
            result += `│ ❌ Nama tidak ditemukan di publik\n`
         }

         result += `╰───────────────────\n\n`

         // ============================================================
         // SEKSI 3: PROVIDER (FIX INDONESIA)
         // ============================================================
         result += `╭─❑ *PROVIDER & SIM CARD*\n`
         
         // MAP PREFIX PROVIDER INDONESIA
         const providerMap = {
            '0811': 'Telkomsel', '0812': 'Telkomsel', '0813': 'Telkomsel',
            '0814': 'Telkomsel', '0815': 'Telkomsel', '0816': 'Telkomsel',
            '0817': 'Telkomsel', '0818': 'Telkomsel', '0819': 'Telkomsel',
            '0821': 'Telkomsel', '0822': 'Telkomsel', '0823': 'Telkomsel',
            '0831': 'Axis', '0832': 'Axis', '0833': 'Axis',
            '0834': 'Axis', '0835': 'Axis', '0836': 'Axis',
            '0837': 'Axis', '0838': 'Axis', '0839': 'Axis',
            '0851': 'Indosat', '0852': 'Indosat', '0853': 'Indosat',
            '0854': 'Indosat', '0855': 'Indosat', '0856': 'Indosat',
            '0857': 'Indosat', '0858': 'Indosat', '0859': 'Indosat',
            '0877': 'XL', '0878': 'XL', '0879': 'XL',
            '0881': 'Smartfren', '0882': 'Smartfren', '0883': 'Smartfren',
            '0884': 'Smartfren', '0885': 'Smartfren', '0886': 'Smartfren',
            '0887': 'Smartfren', '0888': 'Smartfren', '0889': 'Smartfren',
            '0895': 'Tri', '0896': 'Tri', '0897': 'Tri',
            '0898': 'Tri', '0899': 'Tri',
         }

         const prefix = number.substring(0, 4)
         const provider = providerMap[prefix] || 'Unknown'
         result += `│ 📡 Provider: ${provider}\n`

         // Coba ambil lokasi dari IP-API
         try {
            const ipRes = await fetch(`http://ip-api.com/json/${number}?fields=status,country,regionName,city,lat,lon,timezone`)
            const ipData = await ipRes.json()
            if (ipData && ipData.status === 'success') {
               if (ipData.country) result += `│ 🌍 Negara: ${ipData.country}\n`
               if (ipData.regionName) result += `│ 🗺️ Provinsi: ${ipData.regionName}\n`
               if (ipData.city) result += `│ 🏙️ Kota: ${ipData.city}\n`
               if (ipData.lat && ipData.lon) {
                  result += `│ 🗺️ Koordinat: ${ipData.lat}, ${ipData.lon}\n`
               }
            }
         } catch (e) {}

         result += `╰───────────────────\n\n`

         // ============================================================
         // SEKSI 4: MEDIA SOSIAL
         // ============================================================
         result += `╭─❑ *MEDIA SOSIAL*\n`
         const socials = [
            { name: 'Instagram', url: `https://www.instagram.com/${number}` },
            { name: 'Facebook', url: `https://www.facebook.com/search/top?q=${number}` },
            { name: 'Twitter/X', url: `https://twitter.com/search?q=${number}` },
            { name: 'LinkedIn', url: `https://www.linkedin.com/search/results/all/?keywords=${number}` },
            { name: 'YouTube', url: `https://www.youtube.com/results?search_query=${number}` },
            { name: 'TikTok', url: `https://www.tiktok.com/search?q=${number}` }
         ]
         let socialFound = false
         for (const social of socials) {
            try {
               const socRes = await fetch(social.url, { 
                  headers: { 'User-Agent': 'Mozilla/5.0' }
               })
               if (socRes.status === 200) {
                  result += `│ 🔗 ${social.name}: ${social.url}\n`
                  socialFound = true
               }
            } catch (e) {}
         }
         if (!socialFound) {
            result += `│ ❌ Tidak ditemukan di media sosial\n`
         }
         result += `╰───────────────────\n\n`

         // ============================================================
         // SEKSI 5: EMAIL & USERNAME
         // ============================================================
         result += `╭─❑ *EMAIL & USERNAME*\n`
         let emailFound = false

         // GitHub
         try {
            const ghRes = await fetch(`https://api.github.com/search/users?q=${number}`, {
               headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            const ghData = await ghRes.json()
            if (ghData && ghData.total_count > 0) {
               for (const user of ghData.items.slice(0, 3)) {
                  result += `│ 🐙 GitHub: ${user.login}\n`
                  emailFound = true
               }
            }
         } catch (e) {}

         if (!emailFound) {
            result += `│ ❌ Email/username tidak ditemukan\n`
         }
         result += `╰───────────────────\n\n`

         // ============================================================
         // SEKSI 6: KEBOCORAN DATA
         // ============================================================
         result += `╭─❑ *KEBOCORAN DATA (LEAK)*\n`
         try {
            const leakRes = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${fullNumber}`, {
               headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            if (leakRes.status === 200) {
               const leakData = await leakRes.json()
               if (leakData && leakData.length > 0) {
                  result += `│ ⚠️ TOTAL: ${leakData.length} kebocoran!\n`
                  for (const leak of leakData.slice(0, 3)) {
                     result += `│ 📂 ${leak.Name} (${leak.BreachDate || 'Unknown'})\n`
                  }
                  if (leakData.length > 3) {
                     result += `│ 📂 ... dan ${leakData.length - 3} lainnya\n`
                  }
               } else {
                  result += `│ ✅ Tidak ada kebocoran data\n`
               }
            } else {
               result += `│ ❌ Gagal cek kebocoran\n`
            }
         } catch (e) {
            result += `│ ❌ Error: ${e.message}\n`
         }
         result += `╰───────────────────\n\n`

         // ============================================================
         // SEKSI 7: INFO TAMBAHAN
         // ============================================================
         result += `╭─❑ *INFO TAMBAHAN*\n`
         result += `│ 🕐 Waktu: ${new Date().toLocaleString('id-ID')}\n`
         result += `│ 📊 Sumber: 10+ API & Scraper\n`
         result += `│ ⚡ Status: ULTIMATE GACOR\n`
         result += `╰───────────────────\n\n`

         result += `🔐 *OSINT ULTIMATE - Selesai!*`

         await m.reply(result)

      } catch (error) {
         console.error('OSINT Ultimate error:', error)
         await m.reply(`❌ Error: ${error.message}`)
      }
   },
   owner: true
               }
