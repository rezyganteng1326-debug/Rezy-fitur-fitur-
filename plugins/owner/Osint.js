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
               `• Nama dari Truecaller\n` +
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
         // 2. CEK PROVIDER (via ip-api.com)
         // ================================
         result += `\n📌 *PROVIDER & LOKASI*\n`
         try {
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
         } catch (e) {
            result += `   ❌ Error: ${e.message}\n`
         }

         // ================================
         // 3. CEK TRUECALLER (via API)
         // ================================
         result += `\n📌 *TRUECALLER / NAMA PUBLIK*\n`
         try {
            // Pake Truecaller API (gratis, tapi butuh token)
            // Alternatif: pake google search
            const tcRes = await fetch(`https://api.truecaller.com/v2/search?q=${fullNumber}`, {
               headers: {
                  'User-Agent': 'Mozilla/5.0',
                  'Authorization': 'Bearer YOUR_TRUECALLER_TOKEN'
               }
            })
            const tcData = await tcRes.json()
            if (tcData && tcData.name) {
               result += `   👤 Nama: ${tcData.name}\n`
               if (tcData.countryCode) result += `   🌍 Negara: ${tcData.countryCode}\n`
            } else {
               // Coba cari via Google
               const googleRes = await fetch(`https://www.google.com/search?q=${fullNumber}`, {
                  headers: { 'User-Agent': 'Mozilla/5.0' }
               })
               const googleText = await googleRes.text()
               const nameMatch = googleText.match(/<h3[^>]*>([^<]+)<\/h3>/)
               if (nameMatch) {
                  result += `   👤 Nama (Google): ${nameMatch[1].slice(0, 50)}\n`
               } else {
                  result += `   ❌ Nama tidak ditemukan di publik\n`
               }
            }
         } catch (e) {
            // Coba Truecaller alternatif
            try {
               const tcRes2 = await fetch(`https://www.truecaller.com/search?q=${number}`, {
                  headers: { 'User-Agent': 'Mozilla/5.0' }
               })
               const tcText2 = await tcRes2.text()
               const nameMatch2 = tcText2.match(/<span[^>]*class="name"[^>]*>([^<]+)<\/span>/)
               if (nameMatch2) {
                  result += `   👤 Nama (Truecaller): ${nameMatch2[1].slice(0, 50)}\n`
               } else {
                  result += `   ❌ Data tidak ditemukan\n`
               }
            } catch (e2) {
               result += `   ❌ Error: ${e2.message}\n`
            }
         }

         // ================================
         // 4. CEK KEBOCORAN DATA (LEAK)
         // ================================
         result += `\n📌 *KEBOCORAN DATA*\n`
         try {
            const leakRes = await fetch(`https://haveibeenpwned.com/api/v3/breaches?email=${number}@leak.test`, {
               headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            if (leakRes.status === 200) {
               const leakData = await leakRes.json()
               if (leakData && leakData.length > 0) {
                  result += `   ⚠️ Terdeteksi ${leakData.length} kebocoran!\n`
                  for (const leak of leakData.slice(0, 3)) {
                     result += `   📂 ${leak.Name} (${leak.BreachDate})\n`
                  }
               } else {
                  result += `   ✅ Tidak ada kebocoran data\n`
               }
            } else {
               result += `   ❌ Gagal cek kebocoran\n`
            }
         } catch (e) {
            result += `   ❌ Error: ${e.message}\n`
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
