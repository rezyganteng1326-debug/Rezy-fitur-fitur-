import UAParser from 'ua-parser-js'

export default {
   command: ['track', 'cek'],
   category: 'owner',
   description: 'Cek tracking link + detail IP & perangkat',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (!text) {
            return m.reply(
               `⚠️ *Format Salah!*\n\n` +
               `📌 ${isPrefix}track https://grabify.link/ABC123\n` +
               `📌 ${isPrefix}track ABC123`
            )
         }

         // Ambil kode dari link
         let code = text.trim()
         if (code.includes('grabify.link')) {
            code = code.split('/').pop()
         }

         await m.reply(`⏳ Mengambil data untuk kode ${code}...`)

         // === 1. AMBIL DATA DARI GRABIFY ===
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
            return m.reply(`❌ Gagal ambil data. Coba lagi nanti.\n\n${textRes.slice(0, 200)}`)
         }

         if (!data || data.error) {
            return m.reply(`❌ Data tidak ditemukan untuk kode ${code}`)
         }

         // Ambil data klik terbaru
         const click = data.latest_click || data.clicks_data?.[0]
         if (!click) {
            return m.reply(`📭 Belum ada yang klik link https://grabify.link/${code}`)
         }

         // === 2. PARSE USER-AGENT ===
         const ua = new UAParser(click.user_agent || '')
         const device = ua.getDevice()
         const os = ua.getOS()
         const browser = ua.getBrowser()

         // === 3. DAPETIN DETAIL IP DARI ip-api.com ===
         let ipDetail = {}
         if (click.ip_address) {
            try {
               const ipRes = await fetch(`http://ip-api.com/json/${click.ip_address}?fields=status,message,country,regionName,city,zip,lat,lon,isp,org,timezone,as,query`)
               ipDetail = await ipRes.json()
            } catch (e) {
               console.log('Gagal ambil detail IP:', e.message)
            }
         }

         // === FORMAT HASIL ===
         let result = `📊 *HASIL TRACKING*\n\n`
         result += `🔗 Link: https://grabify.link/${code}\n`
         result += `🖱️ Total Klik: ${data.clicks || 0}\n\n`

         result += `📋 *Data Klik Terbaru:*\n`

         // IP
         if (click.ip_address) {
            result += `📍 *IP:* ${click.ip_address}\n`
         }

         // Lokasi dari ip-api.com
         if (ipDetail && ipDetail.status === 'success') {
            if (ipDetail.city) result += `🏙️ *Kota:* ${ipDetail.city}\n`
            if (ipDetail.regionName) result += `🗺️ *Provinsi:* ${ipDetail.regionName}\n`
            if (ipDetail.country) result += `🌍 *Negara:* ${ipDetail.country}\n`
            if (ipDetail.lat && ipDetail.lon) {
               result += `🗺️ *Koordinat:* ${ipDetail.lat}, ${ipDetail.lon}\n`
            }
            if (ipDetail.isp) result += `📡 *ISP:* ${ipDetail.isp}\n`
            if (ipDetail.zip) result += `📌 *Kode Pos:* ${ipDetail.zip}\n`
            if (ipDetail.timezone) result += `🕐 *Zona Waktu:* ${ipDetail.timezone}\n`
            if (ipDetail.as) result += `🔢 *ASN:* ${ipDetail.as}\n`
         }

         // Perangkat dari User-Agent
         const deviceName = [device.vendor, device.model].filter(Boolean).join(' ')
         if (deviceName) {
            result += `📱 *Perangkat:* ${deviceName}\n`
         } else if (device.type) {
            result += `📱 *Perangkat:* ${device.type}\n`
         }

         if (os.name) {
            result += `🖥️ *OS:* ${os.name} ${os.version || ''}\n`
         }
         if (browser.name) {
            result += `🌐 *Browser:* ${browser.name} ${browser.version || ''}\n`
         }

         // Waktu
         if (click.timestamp) {
            result += `🕐 *Waktu:* ${new Date(click.timestamp).toLocaleString('id-ID')}\n`
         }

         // Referrer
         if (click.referrer) {
            result += `🔗 *Referrer:* ${click.referrer}\n`
         }

         // === STATISTIK KESELURUHAN ===
         if (data.clicks_data && data.clicks_data.length > 1) {
            const devices = {}
            const browsers = {}
            const countries = {}
            let totalData = 0

            for (const c of data.clicks_data) {
               const parser = new UAParser(c.user_agent || '')
               const dev = parser.getDevice()
               const bro = parser.getBrowser()
               
               const deviceName2 = [dev.vendor, dev.model].filter(Boolean).join(' ') || dev.type || 'Unknown'
               const browserName = bro.name || 'Unknown'
               const country = c.location?.country || 'Unknown'

               devices[deviceName2] = (devices[deviceName2] || 0) + 1
               browsers[browserName] = (browsers[browserName] || 0) + 1
               countries[country] = (countries[country] || 0) + 1
               totalData++
            }

            if (totalData > 1) {
               result += `\n📊 *Statistik (${totalData} klik):*\n`
               
               const deviceList = Object.entries(devices).sort((a, b) => b[1] - a[1])
               result += `📱 Perangkat: ${deviceList.length} jenis\n`
               if (deviceList.length <= 5) {
                  result += `   ${deviceList.map(([k, v]) => `${k} (${v})`).join(', ')}\n`
               }
               
               const browserList = Object.entries(browsers).sort((a, b) => b[1] - a[1])
               result += `🌐 Browser: ${browserList.length} jenis\n`
               if (browserList.length <= 5) {
                  result += `   ${browserList.map(([k, v]) => `${k} (${v})`).join(', ')}\n`
               }
               
               const countryList = Object.entries(countries).sort((a, b) => b[1] - a[1])
               result += `🌍 Negara: ${countryList.length} negara\n`
               if (countryList.length <= 5) {
                  result += `   ${countryList.map(([k, v]) => `${k} (${v})`).join(', ')}\n`
               }
            }
         }

         await m.reply(result)

      } catch (error) {
         console.error('Track error:', error)
         await m.reply(`❌ Error: ${error.message}`)
      }
   },
   owner: true
           }
