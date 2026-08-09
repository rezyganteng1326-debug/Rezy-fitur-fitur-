import { ApifyClient } from 'apify-client';

export default {
   command: ['lookup', 'osint', 'cekwa'],
   category: 'owner',
   description: 'Cek data nomor WA (nama, foto, status, bisnis, leak, provider, IP)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
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
               `• IP Address & ISP\n` +
               `• Info Server & Database`
            )
         }

         // Bersihkan nomor
         let number = text.replace(/\D/g, '')
         if (number.startsWith('0')) number = '62' + number.slice(1)
         if (!number.startsWith('62')) number = '62' + number
         const fullNumber = '+' + number

         await m.reply(`⏳ Mencari data untuk ${fullNumber}...`)

         // === PANGGIL APIFY API ===
         const client = new ApifyClient({
            token: 'apify_api_zqVEsaVkXZv2oYgbQBdHOUkJCAir6s3CtPhh'
         })

         const input = {
            numbers: [fullNumber]
         }

         const run = await client.actor('eduair94/whatsapp-data-lookup').call(input)
         const items = await client.dataset(run.defaultDatasetId).listItems()

         if (!items.items || items.items.length === 0) {
            return m.reply(`❌ Gagal mendapatkan data untuk ${fullNumber}`)
         }

         const data = items.items[0]

         // === FORMAT HASIL ===
         let result = `📱 *HASIL LOOKUP*\n\n`
         result += `🔢 Nomor: ${data.normalizedNumber || fullNumber}\n`

         // === 1. NAMA & FOTO PROFIL WA ===
         if (data.name) {
            result += `👤 *Nama WA:* ${data.name}\n`
         } else if (data.pushName) {
            result += `👤 *Nama WA:* ${data.pushName}\n`
         }
         
         if (data.urlImage) {
            result += `🖼️ *Foto Profil:* ${data.urlImage}\n`
         }

         // === 2. STATUS/ABOUT ===
         if (data.about) {
            result += `📝 *Status/About:* ${data.about}\n`
         }

         // === 3. INFO AKUN BISNIS ===
         if (data.isBusiness === true) {
            result += `\n🏢 *AKUN BISNIS*\n`
            if (data.businessName) {
               result += `📌 Nama Bisnis: ${data.businessName}\n`
            }
            if (data.businessCategory) {
               result += `📂 Kategori: ${data.businessCategory}\n`
            }
            if (data.businessAddress) {
               result += `📍 Alamat: ${data.businessAddress}\n`
            }
            if (data.businessDescription) {
               result += `📝 Deskripsi: ${data.businessDescription}\n`
            }
         } else if (data.isBusiness === false) {
            result += `\n👤 *Akun Personal*\n`
         }

         // === 4. NAMA DARI SUMBER LAIN (Truecaller/Google) ===
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

         // === 5. DATA BOCOR (LEAK) ===
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

         // === 6. PROVIDER/KARTU SIM ===
         if (data.phoneNumberInfo) {
            const info = data.phoneNumberInfo
            result += `\n📡 *INFO PROVIDER & SIM:*\n`
            if (info.phoneNumber) {
               result += `   🔢 Nomor: ${info.phoneNumber}\n`
            }
            if (info.country) {
               result += `   🌍 Negara: ${info.country}\n`
            }
            if (info.countryCode) {
               result += `   🔢 Kode Negara: +${info.countryCode}\n`
            }
            if (info.carrier) {
               result += `   📡 Provider: ${info.carrier}\n`
            }
            if (info.lineType) {
               result += `   📌 Tipe Jaringan: ${info.lineType}\n`
            }
            if (info.status) {
               result += `   📊 Status: ${info.status}\n`
            }
         }

         // === 7. IP ADDRESS & ISP ===
         if (data.ip) {
            result += `\n🌐 *INFO IP & ISP:*\n`
            result += `   📍 IP: ${data.ip}\n`
            
            // Ambil detail IP dari ip-api.com
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

         // === 8. STATUS WA ===
         if (data.exists === true) {
            result += `\n✅ *Terdaftar di WhatsApp*`
         } else if (data.exists === false) {
            result += `\n❌ *Tidak terdaftar di WhatsApp*`
         }

         // === 9. INFO TAMBAHAN ===
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

         if (data.error) {
            result += `\n❌ *Error:* ${data.error}`
         }

         // Kirim hasil
         if (result.length > 4096) {
            const parts = result.match(/.{1,4000}/g) || []
            for (const part of parts) {
               await sock.sendMessage(m.from, { text: part })
            }
         } else {
            await m.reply(result)
         }

      } catch (error) {
         console.error('Lookup error:', error)
         await m.reply(`❌ Error: ${error.message}\n\nPastikan APIFY_TOKEN sudah di set di .env`)
      }
   },
   owner: true
              }
