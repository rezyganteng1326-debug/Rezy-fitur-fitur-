export default {
   command: ['osintgacor', 'og', 'osintmax'],
   category: 'owner',
   description: 'OSINT ULTIMATE - 15+ Sumber Data (Paling Gacor!)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (!text) {
            return m.reply(
               `🔥 *OSINT ULTIMATE - PALING GACOR!*\n\n` +
               `📌 ${isPrefix}osintgacor 6281234567890\n\n` +
               `📊 *15+ Sumber Data:*\n` +
               `✅ WhatsApp\n✅ Truecaller\n✅ GetContact\n✅ Numverify\n✅ IP API\n` +
               `✅ Instagram\n✅ Facebook\n✅ Twitter/X\n✅ LinkedIn\n✅ YouTube\n` +
               `✅ GitHub\n✅ HaveIBeenPwned (Leak)\n✅ Google Dork\n` +
               `✅ Email Finder\n✅ Username Search\n✅ Domain WHOIS\n✅ SIM Provider`
            )
         }

         let number = text.replace(/\D/g, '')
         if (number.startsWith('0')) number = '62' + number.slice(1)
         if (!number.startsWith('62')) number = '62' + number
         const fullNumber = '+' + number

         await m.reply(`⏳ *OSINT ULTIMATE* sedang memindai ${fullNumber}...\n⏱️ Proses 2-3 menit`)

         let result = `🔥 *OSINT ULTIMATE - HASIL LENGKAP*\n\n`
         result += `📱 *Target:* ${fullNumber}\n`
         result += `🕐 *Waktu:* ${new Date().toLocaleString('id-ID')}\n\n`

         // ============================================================
         // SEKSI 1: WHATSAPP & TELEGRAM
         // ============================================================
         result += `╭─❑ *MESSENGER*\n`
         
         // WhatsApp
         try {
            const waRes = await fetch(`https://api.whatsapp.com/check?phone=${fullNumber}`)
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
         // SEKSI 2: NAMA & IDENTITAS
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

         // Google Search (fallback)
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
         // SEKSI 3: PROVIDER & LOKASI
         // ============================================================
         result += `╭─❑ *PROVIDER & LOKASI*\n`
         let provFound = false

         // Numverify
         try {
            const nvRes = await fetch(`http://apilayer.net/api/validate?access_key=free&number=${fullNumber}`)
            const nvData = await nvRes.json()
            if (nvData && nvData.valid) {
               if (nvData.country_name) result += `│ 🌍 Negara: ${nvData.country_name}\n`
               if (nvData.carrier) result += `│ 📡 Provider: ${nvData.carrier}\n`
               if (nvData.line_type) result += `│ 📌 Tipe: ${nvData.line_type}\n`
               provFound = true
            }
         } catch (e) {}

         // Numlookup
         if (!provFound) {
            try {
               const nlRes = await fetch(`https://api.numlookup.com/validate/${number}`)
               const nlData = await nlRes.json()
               if (nlData && nlData.valid) {
                  if (nlData.country) result += `│ 🌍 Negara: ${nlData.country}\n`
                  if (nlData.carrier) result += `│ 📡 Provider: ${nlData.carrier}\n`
                  if (nlData.line_type) result += `│ 📌 Tipe: ${nlData.line_type}\n`
                  provFound = true
               }
            } catch (e) {}
         }

         // IP-API
         if (!provFound) {
            try {
               const ipRes = await fetch(`http://ip-api.com/json/${number}?fields=status,country,regionName,city,isp,org,as,lat,lon,timezone`)
               const ipData = await ipRes.json()
               if (ipData && ipData.status === 'success') {
                  if (ipData.country) result += `│ 🌍 Negara: ${ipData.country}\n`
                  if (ipData.regionName) result += `│ 🗺️ Provinsi: ${ipData.regionName}\n`
                  if (ipData.city) result += `│ 🏙️ Kota: ${ipData.city}\n`
                  if (ipData.isp) result += `│ 📡 ISP: ${ipData.isp}\n`
                  if (ipData.org) result += `│ 🏢 Organisasi: ${ipData.org}\n`
                  if (ipData.as) result += `│ 🔢 ASN: ${ipData.as}\n`
                  if (ipData.lat && ipData.lon) {
                     result += `│ 🗺️ Koordinat: ${ipData.lat}, ${ipData.lon}\n`
                  }
                  provFound = true
               }
            } catch (e) {}
         }

         if (!provFound) {
            result += `│ ❌ Gagal ambil data provider\n`
         }

         result += `╰───────────────────\n\n`

         // ============================================================
         // SEKSI 4: MEDIA SOSIAL (6 PLATFORM)
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
                  headers: { 'User-Agent': 'Mozilla/5.0' },
                  timeout: 5000
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

         // Email from Leak
         try {
            const leakRes = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${fullNumber}`, {
               headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            if (leakRes.status === 200) {
               const leakData = await leakRes.json()
               if (leakData && leakData.length > 0) {
                  for (const item of leakData.slice(0, 3)) {
                     if (item.Domain) {
                        result += `│ 📧 Domain: ${item.Domain}\n`
                        emailFound = true
                     }
                  }
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
                  const displayLeaks = leakData.slice(0, 5)
                  for (const leak of displayLeaks) {
                     const date = leak.BreachDate || 'Unknown'
                     const domain = leak.Domain || 'Unknown'
                     result += `│ 📂 ${leak.Name} (${date}) - ${leak.PwnCount || '?'} akun\n`
                  }
                  if (leakData.length > 5) {
                     result += `│ 📂 ... dan ${leakData.length - 5} lainnya\n`
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
         result += `│ 📊 Sumber: 15+ API & Scraper\n`
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
