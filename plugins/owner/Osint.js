export default {
   command: ['osintgacor', 'og', 'osintmax'],
   category: 'owner',
   description: 'OSINT ULTIMATE - Auto Cek Telegram',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (!text) {
            return m.reply(
               `🔥 *OSINT ULTIMATE - PALING GACOR!*\n\n` +
               `📌 ${isPrefix}osintgacor 6281234567890\n\n` +
               `📊 *Data yang didapat:*\n` +
               `✅ WhatsApp\n✅ Telegram (Auto Cek)\n✅ Truecaller\n✅ GetContact\n✅ Provider SIM\n✅ Media Sosial\n✅ Leak Database`
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

         // Telegram (Auto Cek via API)
         try {
            const tgToken = '8602229550:AAENgkLwgxMdC5d8Vjg6ACexb5VhXpiQpVo'
            if (tgToken) {
               const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/getChat?chat_id=${number}`, {
                  headers: { 'User-Agent': 'Mozilla/5.0' }
               })
               const tgData = await tgRes.json()
               const isTG = tgData && tgData.ok
               result += `│ ${isTG ? '✅' : '❌'} Telegram: ${isTG ? 'Ada akun' : 'Tidak ditemukan'}\n`
            } else {
               result += `│ ⚠️ Telegram: Token tidak ditemukan di .env\n`
            }
         } catch (e) {
            result += `│ ⚠️ Telegram: Gagal cek (${e.message})\n`
         }

         result += `╰───────────────────\n\n`

         // ============================================================
         // SEKSI 2: NAMA
         // ============================================================
         result += `╭─❑ *IDENTITAS & NAMA*\n`
         let identityFound = false

         // Truecaller
         try {
            const tcRes = await fetch(`https://www.truecaller.com/search?q=${number}`, {
               headers: { 'User-Agent': 'Mozilla/5.0' }
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

         if (!identityFound) {
            result += `│ ❌ Nama tidak ditemukan di publik\n`
         }

         result += `╰───────────────────\n\n`

         // ============================================================
         // SEKSI 3: PROVIDER
         // ============================================================
         result += `╭─❑ *PROVIDER & SIM CARD*\n`

         const prefixMap = {
            '811': 'Telkomsel', '812': 'Telkomsel', '813': 'Telkomsel',
            '814': 'Telkomsel', '815': 'Telkomsel', '816': 'Telkomsel',
            '817': 'Telkomsel', '818': 'Telkomsel', '819': 'Telkomsel',
            '821': 'Telkomsel', '822': 'Telkomsel', '823': 'Telkomsel',
            '824': 'Telkomsel', '825': 'Telkomsel', '826': 'Telkomsel',
            '827': 'Telkomsel', '828': 'Telkomsel', '829': 'Telkomsel',
            '831': 'Axis', '832': 'Axis', '833': 'Axis',
            '834': 'Axis', '835': 'Axis', '836': 'Axis',
            '837': 'Axis', '838': 'Axis', '839': 'Axis',
            '851': 'Indosat', '852': 'Indosat', '853': 'Indosat',
            '854': 'Indosat', '855': 'Indosat', '856': 'Indosat',
            '857': 'Indosat', '858': 'Indosat', '859': 'Indosat',
            '877': 'XL', '878': 'XL', '879': 'XL',
            '881': 'Smartfren', '882': 'Smartfren', '883': 'Smartfren',
            '884': 'Smartfren', '885': 'Smartfren', '886': 'Smartfren',
            '887': 'Smartfren', '888': 'Smartfren', '889': 'Smartfren',
            '895': 'Tri', '896': 'Tri', '897': 'Tri',
            '898': 'Tri', '899': 'Tri',
         }

         const prefix = number.substring(2, 5)
         const provider = prefixMap[prefix] || 'Unknown'

         const emojiMap = {
            'Telkomsel': '📡',
            'Indosat': '📡',
            'XL': '📡',
            'Tri': '📡',
            'Smartfren': '📡',
            'Axis': '📡',
            'Unknown': '❌'
         }
         const emoji = emojiMap[provider] || '❌'
         result += `│ ${emoji} Provider: ${provider}\n`
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
         // SEKSI 5: LEAK
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
         // SEKSI 6: INFO TAMBAHAN
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
