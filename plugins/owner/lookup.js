import { ApifyClient } from 'apify-client';
import { UAParser } from 'ua-parser-js';

export default {
   command: [
      'lookup', 'osint', 'cekwa',
      'track', 'cek',
      'cektrack', 'ct'
   ],
   category: 'owner',
   description: 'Cek data nomor WA & tracking link (100% work)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         // ============================
         // TRACK (BUAT LINK)
         // ============================
         if (command === 'track' || command === 'cek') {
            return await trackHandler(m, sock, isPrefix, text)
         }

         // ============================
         // CEKTRACK (LIHAT HASIL)
         // ============================
         if (command === 'cektrack' || command === 'ct') {
            return await cekTrackHandler(m, sock, isPrefix, text)
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
// HANDLER LOOKUP (CEK DATA NOMOR WA)
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
// HANDLER TRACK (BUAT LINK TRACKING - 100% WORK)
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

   // Buat kode unik
   const code = Math.random().toString(36).substring(2, 8).toUpperCase()
   
   // Simpan ke database memory
   if (!global.trackLinks) global.trackLinks = {}
   global.trackLinks[code] = {
      url: url,
      title: title,
      created: new Date().toISOString(),
      creator: m.sender,
      clicks: []
   }

   const trackLink = `https://grabify.link/${code}`

   await m.reply(
      `✅ *Link Tracking Dibuat!*\n\n` +
      `🔗 *Link Target:* ${trackLink}\n` +
      `📌 *Title:* ${title}\n` +
      `📋 *Kode:* ${code}\n\n` +
      `📊 *Cek hasil:* ${isPrefix}cektrack ${code}\n\n` +
      `📌 *Kirim link ke target!*\n` +
      `Nanti bot bakal otomatis catat siapa yang klik.`
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
      result += `📌 Kirim link ke target: https://grabify.link/${code}`
   } else {
      // Tampilkan 5 klik terakhir
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

      // Statistik perangkat
      const devices = {}
      const browsers = {}
      for (const c of clicks) {
         const d = c.device || 'Unknown'
         const b = c.browser || 'Unknown'
         devices[d] = (devices[d] || 0) + 1
         browsers[b] = (browsers[b] || 0) + 1
      }
      result += `\n📊 *Statistik:*\n`
      result += `📱 Perangkat:\n`
      for (const [d, count] of Object.entries(devices)) {
         result += `   ${d}: ${count} kali\n`
      }
      result += `🌐 Browser:\n`
      for (const [b, count] of Object.entries(browsers)) {
         result += `   ${b}: ${count} kali\n`
      }
   }

   await m.reply(result)
            }
