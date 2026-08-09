export default {
   command: ['osint', 'lookupall', 'cek'],
   category: 'owner',
   description: 'OSINT All-in-One (WA, Provider, Truecaller, IP, Leak)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (!text) {
            return m.reply(
               `⚠️ *Format Salah!*\n\n` +
               `📌 ${isPrefix}osint 6281234567890\n\n` +
               `🔍 *Data yang didapat:*\n` +
               `• Status WhatsApp\n` +
               `• Provider/Kartu SIM\n` +
               `• Nama dari Truecaller/Google\n` +
               `• IP & Lokasi\n` +
               `• Kebocoran Data (Leak)\n` +
               `• Info Lainnya`
            )
         }

         // Bersihkan nomor
         let number = text.replace(/\D/g, '')
         if (number.startsWith('0')) number = '62' + number.slice(1)
         if (!number.startsWith('62')) number = '62' + number
         const fullNumber = '+' + number

         await m.reply(`⏳ Mencari data untuk ${fullNumber}...`)

         let result = `📱 *HASIL OSINT ALL-IN-ONE*\n\n`
         result += `🔢 Nomor: ${fullNumber}\n\n`

         // ================================
         // 1. CEK WHATSAPP
         // ================================
         result += `📌 *WHATSAPP*\n`
         try {
            const waRes = await fetch(`https://api.whatsapp.com/check?phone=${fullNumber}`, {
               headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            const waText = await waRes.text()
            const isWA = waText.includes('true') || waText.includes('1')
            result += `   Status: ${isWA ? '✅ Terdaftar di WA' : '❌ Tidak terdaftar'}\n`
         } catch (e) {
            result += `   Status: ⚠️ Gagal cek\n`
         }

         // ================================
         // 2. CEK PROVIDER & LOKASI (FIX)
         // ================================
         result += `\n📌 *PROVIDER & LOKASI*\n`
         try {
            // Coba via numlookup (API gratis)
            const provRes = await fetch(`https://api.numlookup.com/validate/${number}`, {
               headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            const provData = await provRes.json()
            if (provData && provData.valid) {
               if (provData.country) result += `   🌍 Negara: ${provData.country}\n`
               if (provData.carrier) result += `   📡 Provider: ${provData.carrier}\n`
               if (provData.line_type) result += `   📌 Tipe: ${provData.line_type}\n`
            } else {
               // Fallback ke ip-api
               const ipRes = await fetch(`http://ip-api.com/json/${number}?fields=status,country,regionName,city,isp,org,as,lat,lon,timezone`)
               const ipData = await ipRes.json()
               if (ipData && ipData.status === 'success') {
                  if (ipData.country) result += `   🌍 Negara: ${ipData.country}\n`
                  if (ipData.regionName) result += `   🗺️ Provinsi: ${ipData.regionName}\n`
                  if (ipData.city) result += `   🏙️ Kota: ${ipData.city}\n`
                  if (ipData.isp) result += `   📡 ISP: ${ipData.isp}\n`
                  if (ipData.org) result += `   🏢 Organisasi: ${ipData.org}\n`
                  if (ipData.as) result += `   🔢 ASN: ${ipData.as}\n`
                  if (ipData.lat && ipData.lon) {
                     result += `   🗺️ Koordinat: ${ipData.lat}, ${ipData.lon}\n`
                  }
                  if (ipData.timezone) result += `   🕐 Zona Waktu: ${ipData.timezone}\n`
               } else {
                  result += `   ❌ Gagal ambil data provider\n`
               }
            }
         } catch (e) {
            result += `   ❌ Error: ${e.message}\n`
         }

         // ================================
         // 3. CEK TRUECALLER + GOOGLE (FIX)
         // ================================
         result += `\n📌 *NAMA PUBLIK (Truecaller/Google)*\n`
         let nameFound = false

         // Coba via Truecaller API
         try {
            const tcRes = await fetch(`https://www.truecaller.com/search?q=${number}`, {
               headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            const tcText = await tcRes.text()
            const nameMatch = tcText.match(/<span[^>]*class="name"[^>]*>([^<]+)<\/span>/)
            if (nameMatch && nameMatch[1].length < 100) {
               result += `   👤 Nama (Truecaller): ${nameMatch[1]}\n`
               nameFound = true
            }
         } catch (e) {}

         // Kalo gagal, coba via Google
         if (!nameFound) {
            try {
               const googleRes = await fetch(`https://www.google.com/search?q=${fullNumber}`, {
                  headers: { 'User-Agent': 'Mozilla/5.0' }
               })
               const googleText = await googleRes.text()
               const nameMatch = googleText.match(/<h3[^>]*>([^<]+)<\/h3>/)
               if (nameMatch && nameMatch[1].length < 100) {
                  result += `   👤 Nama (Google): ${nameMatch[1]}\n`
                  nameFound = true
               }
            } catch (e) {}
         }

         if (!nameFound) {
            // Coba via leak (kalo ada)
            try {
               const leakRes = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${fullNumber}`, {
                  headers: { 'User-Agent': 'Mozilla/5.0' }
               })
               if (leakRes.status === 200) {
                  const leakData = await leakRes.json()
                  if (leakData && leakData.length > 0) {
                     for (const leak of leakData.slice(0, 3)) {
                        if (leak.Name) {
                           result += `   📂 Leak: ${leak.Name}\n`
                           nameFound = true
                        }
                     }
                  }
               }
            } catch (e) {}
         }

         if (!nameFound) {
            result += `   ❌ Nama tidak ditemukan di publik\n`
         }

         // ================================
         // 4. CEK KEBOCORAN DATA (LEAK)
         // ================================
         result += `\n📌 *KEBOCORAN DATA*\n`
         let leakFound = false
         try {
            const leakRes = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${fullNumber}`, {
               headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            if (leakRes.status === 200) {
               const leakData = await leakRes.json()
               if (leakData && leakData.length > 0) {
                  leakFound = true
                  result += `   ⚠️ Terdeteksi ${leakData.length} kebocoran!\n`
                  const displayLeaks = leakData.slice(0, 5)
                  for (const leak of displayLeaks) {
                     const date = leak.BreachDate || 'Unknown'
                     result += `   📂 ${leak.Name} (${date})\n`
                  }
                  if (leakData.length > 5) {
                     result += `   📂 ... dan ${leakData.length - 5} lainnya\n`
                  }
               }
            }
         } catch (e) {
            result += `   ❌ Error: ${e.message}\n`
         }

         if (!leakFound) {
            result += `   ✅ Tidak ada kebocoran data ditemukan\n`
         }

         // ================================
         // 5. INFO TAMBAHAN
         // ================================
         result += `\n📌 *INFO TAMBAHAN*\n`
         const now = new Date()
         result += `   🕐 Waktu: ${now.toLocaleString('id-ID')}\n`
         result += `   📊 Sumber: OSINT All-in-One\n`

         await m.reply(result)

      } catch (error) {
         console.error('OSINT error:', error)
         await m.reply(`❌ Error: ${error.message}`)
      }
   },
   owner: true
               }
