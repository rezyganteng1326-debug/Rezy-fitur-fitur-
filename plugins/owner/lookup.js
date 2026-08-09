import { ApifyClient } from 'apify-client';

export default {
   command: [
      'lookup', 'osint', 'cekwa', 
      'track', 'cek', 
      'grab', 'grabify',
      'trackg', 'trackgr'
   ],
   category: 'owner',
   description: 'Cek data nomor WA & tracking link (Grabify)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         // ============================
         // GRABIFY (BUAT LINK OTOMATIS)
         // ============================
         if (command === 'grab' || command === 'grabify') {
            return await grabifyHandler(m, sock, isPrefix, text)
         }

         // ============================
         // CEK GRABIFY
         // ============================
         if (command === 'track' || command === 'cek' || command === 'trackg' || command === 'trackgr') {
            return await trackGrabifyHandler(m, sock, isPrefix, text)
         }

         // ============================
         // LOOKUP (DEFAULT)
         // ============================
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
         `• Nama & Foto Profil WA\n` +
         `• Status/About\n` +
         `• Info Akun Bisnis\n` +
         `• Nama dari Truecaller/Google\n` +
         `• Data Bocor (Leak)\n` +
         `• Provider/Kartu SIM\n` +
         `• IP Address & ISP`
      )
   }

   let number = text.replace(/\D/g, '')
   if (number.startsWith('0')) number = '62' + number.slice(1)
   if (!number.startsWith('62')) number = '62' + number
   const fullNumber = '+' + number

   await m.reply(`⏳ Mencari data untuk ${fullNumber}...`)

   const client = new ApifyClient({
      token: 'apify_api_zqVEsaVkXZv2oYgbQBdHOUkJCAir6s3CtPhh'
   })

   const input = { numbers: [fullNumber] }
   const run = await client.actor('eduair94/whatsapp-data-lookup').call(input)
   const items = await client.dataset(run.defaultDatasetId).listItems()

   if (!items.items || items.items.length === 0) {
      return m.reply(`❌ Gagal mendapatkan data untuk ${fullNumber}`)
   }

   const data = items.items[0]
   let result = `📱 *HASIL LOOKUP*\n\n`
   result += `🔢 Nomor: ${data.normalizedNumber || fullNumber}\n`

   if (data.name) {
      result += `👤 *Nama WA:* ${data.name}\n`
   } else if (data.pushName) {
      result += `👤 *Nama WA:* ${data.pushName}\n`
   }
   
   if (data.urlImage) {
      result += `🖼️ *Foto Profil:* ${data.urlImage}\n`
   }

   if (data.about) {
      result += `📝 *Status/About:* ${data.about}\n`
   }

   if (data.isBusiness === true) {
      result += `\n🏢 *AKUN BISNIS*\n`
      if (data.businessName) result += `📌 Nama Bisnis: ${data.businessName}\n`
      if (data.businessCategory) result += `📂 Kategori: ${data.businessCategory}\n`
      if (data.businessAddress) result += `📍 Alamat: ${data.businessAddress}\n`
      if (data.businessDescription) result += `📝 Deskripsi: ${data.businessDescription}\n`
   } else if (data.isBusiness === false) {
      result += `\n👤 *Akun Personal*\n`
   }

   if (data.lookup) {
      const lookupData = typeof data.lookup === 'string' ? JSON.parse(data.lookup) : data.lookup
      if (lookupData.name) {
         result += `\n🔎 *Nama dari Sumber Lain:*\n`
         result += `   👤 Nama: ${lookupData.name}\n`
         if (lookupData.email) result += `   📧 Email: ${lookupData.email}\n`
         if (lookupData.address) result += `   📍 Alamat: ${lookupData.address}\n`
         if (lookupData.company) result += `   🏢 Perusahaan: ${lookupData.company}\n`
         result += `   📌 Sumber: Truecaller/Google\n`
      }
   }

   if (data.leakedData) {
      result += `\n⚠️ *DATA BOCOR TERDETEKSI!*\n`
      const leakData = typeof data.leakedData === 'string' ? JSON.parse(data.leakedData) : data.leakedData
      if (leakData.source) result += `   📂 Sumber: ${leakData.source}\n`
      if (leakData.year) result += `   📅 Tahun: ${leakData.year}\n`
      if (leakData.fields && Array.isArray(leakData.fields)) {
         result += `   📋 Data: ${leakData.fields.join(', ')}\n`
      }
      if (leakData.emails && leakData.emails.length > 0) {
         result += `   📧 Email: ${leakData.emails[0]}\n`
      }
   }

   if (data.fbLeak) {
      result += `\n📘 *Facebook Leak:* Terdeteksi\n`
   }

   if (data.phoneNumberInfo) {
      const info = data.phoneNumberInfo
      result += `\n📡 *INFO PROVIDER & SIM:*\n`
      if (info.phoneNumber) result += `   🔢 Nomor: ${info.phoneNumber}\n`
      if (info.country) result += `   🌍 Negara: ${info.country}\n`
      if (info.countryCode) result += `   🔢 Kode Negara: +${info.countryCode}\n`
      if (info.carrier) result += `   📡 Provider: ${info.carrier}\n`
      if (info.lineType) result += `   📌 Tipe Jaringan: ${info.lineType}\n`
      if (info.status) result += `   📊 Status: ${info.status}\n`
   }

   if (data.ip) {
      result += `\n🌐 *INFO IP & ISP:*\n`
      result += `   📍 IP: ${data.ip}\n`
      
      try {
         const ipRes = await fetch(`http://ip-api.com/json/${data.ip}?fields=status,country,regionName,city,isp,org,as,lat,lon`)
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
         }
      } catch (e) {
         console.log('Gagal ambil detail IP')
      }
   }

   if (data.exists === true) {
      result += `\n✅ *Terdaftar di WhatsApp*`
   } else if (data.exists === false) {
      result += `\n❌ *Tidak terdaftar di WhatsApp*`
   }

   if (data.source) {
      const sourceLabel = {
         'fresh': '🟢 Live (real-time)',
         'cache': '🟡 Cache',
         'database': '🔵 Database',
         'not-found': '⚪ Tidak ditemukan',
         'error': '🔴 Error'
      }[data.source] || data.source
      result += `\n📊 *Sumber:* ${sourceLabel}`
   }

   if (data.fetchedAt) {
      result += `\n🕐 *Waktu:* ${new Date(data.fetchedAt).toLocaleString('id-ID')}`
   }

   if (result.length > 4096) {
      const parts = result.match(/.{1,4000}/g) || []
      for (const part of parts) {
         await sock.sendMessage(m.from, { text: part })
      }
   } else {
      await m.reply(result)
   }
}

// ============================================================
// HANDLER GRABIFY (BUAT LINK OTOMATIS)
// ============================================================
async function grabifyHandler(m, sock, isPrefix, text) {
   if (!text) {
      return m.reply(
         `⚠️ *Format Salah!*\n\n` +
         `📌 ${isPrefix}grab https://youtube.com|Judul\n\n` +
         `📌 Contoh:\n` +
         `${isPrefix}grab https://71h.com|rejoy`
      )
   }

   const parts = text.split('|')
   if (parts.length < 2) {
      return m.reply(`⚠️ Format: ${isPrefix}grab https://youtube.com|Judul`)
   }

   const url = parts[0].trim()
   const title = parts.slice(1).join('|').trim() || 'Link'

   if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return m.reply('⚠️ URL harus dimulai dengan http:// atau https://')
   }

   await m.reply(`⏳ Membuat link tracking di Grabify...`)

   try {
      const apiUrl = 'https://grabify.link/api/url/create'
      const payload = {
         url: url,
         title: title,
         private: false,
         password: '',
         campaign: 'whatsapp_bot'
      }

      const res = await fetch(apiUrl, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
         },
         body: JSON.stringify(payload)
      })

      const textRes = await res.text()
      let data
      try {
         data = JSON.parse(textRes)
      } catch (e) {
         console.error('Response:', textRes.slice(0, 500))
         return m.reply(
            `❌ API Grabify error.\n\n` +
            `📌 *Cara Manual (PASTI JALAN):*\n` +
            `1. Buka https://grabify.link di browser\n` +
            `2. Paste URL: ${url}\n` +
            `3. Isi Title: ${title}\n` +
            `4. Klik "Create URL"\n` +
            `5. Copy link & kode\n` +
            `6. Cek pake .trackg [kode]`
         )
      }

      if (!data || !data.shortcode) {
         return m.reply(`❌ Gagal membuat link.\nError: ${data?.message || 'Unknown'}`)
      }

      await m.reply(
         `✅ *Link Tracking Berhasil Dibuat!*\n\n` +
         `🔗 *Link Target:* https://grabify.link/${data.shortcode}\n` +
         `📌 *Title:* ${title}\n` +
         `📋 *Kode:* ${data.shortcode}\n\n` +
         `📊 *Cek hasil:* ${isPrefix}track ${data.shortcode}\n\n` +
         `📌 *Fitur Lengkap Grabify:*\n` +
         `✅ IP Address\n` +
         `✅ Koordinat GPS\n` +
         `✅ Kota, Provinsi, Negara\n` +
         `✅ Perangkat, OS, Browser\n` +
         `✅ Referrer (sumber klik)\n` +
         `✅ ISP (Provider internet)`
      )

   } catch (error) {
      console.error('Grabify error:', error)
      await m.reply(
         `❌ Error: ${error.message}\n\n` +
         `📌 *Cara Manual (PASTI JALAN):*\n` +
         `1. Buka https://grabify.link di browser\n` +
         `2. Paste URL: ${url}\n` +
         `3. Isi Title: ${title}\n` +
         `4. Klik "Create URL"\n` +
         `5. Copy link & kode\n` +
         `6. Cek pake .track [kode]`
      )
   }
}

// ============================================================
// HANDLER TRACK GRABIFY
// ============================================================
async function trackGrabifyHandler(m, sock, isPrefix, text) {
   if (!text) {
      return m.reply(
         `⚠️ *Format Salah!*\n\n` +
         `📌 ${isPrefix}track [kode]\n` +
         `📌 Contoh: ${isPrefix}track ABC123\n\n` +
         `📌 Dapatkan kode dari link Grabify:\n` +
         `https://grabify.link/ABC123 → kode: ABC123`
      )
   }

   let code = text.trim()
   if (code.includes('grabify.link')) {
      code = code.split('/').pop()
   }
   code = code.toUpperCase()

   await m.reply(`⏳ Mengambil data tracking untuk ${code}...`)

   try {
      const res = await fetch(`https://grabify.link/api/url/info?shortcode=${code}`, {
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
         }
      })

      const textRes = await res.text()
      let data
      try {
         data = JSON.parse(textRes)
      } catch (e) {
         return m.reply(
            `❌ Gagal ambil data.\n\n` +
            `📌 *Cek Manual di Browser:*\n` +
            `https://grabify.link/${code}/stats`
         )
      }

      if (!data || data.error) {
         return m.reply(
            `❌ Data tidak ditemukan untuk kode ${code}\n\n` +
            `📌 *Cek Manual di Browser:*\n` +
            `https://grabify.link/${code}/stats`
         )
      }

      const click = data.latest_click || data.clicks_data?.[0]
      
      let result = `📊 *HASIL TRACKING GRABIFY*\n\n`
      result += `🔗 Link: https://grabify.link/${code}\n`
      result += `🖱️ Total Klik: ${data.clicks || 0}\n\n`

      if (data.clicks && data.clicks > 0 && click) {
         result += `📋 *Data Klik Terbaru:*\n`
         
         if (click.ip_address) result += `📍 IP: ${click.ip_address}\n`
         
         if (click.location) {
            const loc = click.location
            if (loc.city) result += `🏙️ Kota: ${loc.city}\n`
            if (loc.region) result += `🗺️ Provinsi: ${loc.region}\n`
            if (loc.country) result += `🌍 Negara: ${loc.country}\n`
            if (loc.latitude && loc.longitude) {
               result += `🗺️ Koordinat: ${loc.latitude}, ${loc.longitude}\n`
            }
         }

         if (click.user_agent) {
            const ua = click.user_agent
            if (ua.device) result += `📱 Perangkat: ${ua.device}\n`
            if (ua.os) result += `🖥️ OS: ${ua.os}\n`
            if (ua.browser) result += `🌐 Browser: ${ua.browser}\n`
         }

         if (click.timestamp) {
            result += `🕐 Waktu: ${new Date(click.timestamp).toLocaleString('id-ID')}\n`
         }

         if (click.referrer) {
            result += `🔗 Referrer: ${click.referrer}\n`
         }

      } else {
         result += `📭 Belum ada yang klik link ini.\n`
         result += `📌 Kirim link: https://grabify.link/${code}`
      }

      await m.reply(result)

   } catch (error) {
      console.error('Track error:', error)
      await m.reply(
         `❌ Error: ${error.message}\n\n` +
         `📌 *Cek Manual di Browser:*\n` +
         `https://grabify.link/${code}/stats`
      )
   }
       }
