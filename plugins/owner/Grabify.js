import { loadDB, saveDB, addLink, deleteLink, getLinks, getLink } from '../../lib/db.js'

export default {
   command: ['grabify', 'track', 'grab'],
   category: 'owner',
   description: 'Buat link tracking Grabify (IP, lokasi, perangkat)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         // === FORMAT COMMAND ===
         if (!text) {
            return m.reply(
               `⚠️ *Format Salah!*\n\n` +
               `📌 *Buat link baru:*\n` +
               `${isPrefix}grabify https://youtube.com|NamaKamu\n\n` +
               `📌 *Cek hasil tracking:*\n` +
               `${isPrefix}track [kode]\n\n` +
               `📌 *List semua link:*\n` +
               `${isPrefix}grabify list\n\n` +
               `📌 *Hapus link:*\n` +
               `${isPrefix}grabify del [kode]\n\n` +
               `🔍 *Data yang didapat:*\n` +
               `• IP Address\n` +
               `• Lokasi (kota/negara)\n` +
               `• Perangkat & OS\n` +
               `• Browser\n` +
               `• Waktu klik`
            )
         }

         // === CEK LIST ===
         if (text.toLowerCase() === 'list') {
            return await listLinks(m)
         }

         // === CEK DELETE ===
         if (text.toLowerCase().startsWith('del ')) {
            const code = text.split(' ')[1]
            if (!code) return m.reply('⚠️ Masukkan kode link yang mau dihapus.')
            return await deleteLinkHandler(m, code)
         }

         // === CEK TRACKING (pake kode) ===
         if (text.length === 6 || text.length === 7) {
            return await trackLink(m, text.toUpperCase())
         }

         // === CEK TRACKING (pake link penuh) ===
         if (text.includes('grabify.link')) {
            const code = text.split('/').pop()
            return await trackLink(m, code)
         }

         // === BUAT LINK BARU ===
         const parts = text.split('|')
         if (parts.length < 2) {
            return m.reply(
               `⚠️ *Format salah!*\n\n` +
               `📌 Contoh:\n` +
               `${isPrefix}grabify https://youtube.com|NamaKamu`
            )
         }

         const url = parts[0].trim()
         const title = parts.slice(1).join('|').trim() || 'Link'

         if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return m.reply('⚠️ URL harus dimulai dengan http:// atau https://')
         }

         await m.reply(`⏳ Membuat link tracking...`)

         // === PANGGIL API GRABIFY ===
         const apiUrl = 'https://grabify.link/api/url/create'
         const payload = {
            url: url,
            title: title,
            private: false,
            password: '',
            campaign: 'whatsapp_bot'
         }

         const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
         })

         const data = await response.json()

         if (!data || !data.shortcode) {
            return m.reply(`❌ Gagal membuat link.\nError: ${data?.message || 'Unknown error'}`)
         }

         // Simpan ke database JSON
         addLink(data.shortcode, {
            url: url,
            title: title,
            shortcode: data.shortcode,
            link: `https://grabify.link/${data.shortcode}`,
            created: new Date().toISOString(),
            creator: m.sender
         })

         await m.reply(
            `✅ *Link Tracking Berhasil Dibuat!*\n\n` +
            `🔗 *Link:* https://grabify.link/${data.shortcode}\n` +
            `📌 *Title:* ${title}\n` +
            `📋 *Kode:* ${data.shortcode}\n\n` +
            `📊 *Cek hasil:* ${isPrefix}track ${data.shortcode}\n\n` +
            `⚠️ *Jangan lupa:*\n` +
            `• Link hanya aktif 30 hari\n` +
            `• Kirim link ke target\n` +
            `• Semakin banyak klik, semakin banyak data`
         )

      } catch (error) {
         console.error('Grabify error:', error)
         await m.reply(`❌ Error: ${error.message}`)
      }
   },
   owner: true
}

// === FUNGSI LIST LINK ===
async function listLinks(m) {
   const links = getLinks()
   const codes = Object.keys(links)
   
   if (codes.length === 0) {
      return m.reply('📭 Belum ada link tracking yang dibuat.')
   }

   let result = `📋 *DAFTAR LINK TRACKING*\n\n`
   
   for (const code of codes) {
      const link = links[code]
      result += `🔗 *${link.title}*\n`
      result += `   📋 Kode: ${code}\n`
      result += `   📅 Dibuat: ${new Date(link.created).toLocaleDateString()}\n`
      result += `   📊 Cek: .track ${code}\n\n`
   }

   result += `\n📌 Total: ${codes.length} link`

   if (result.length > 4096) {
      const parts = result.match(/.{1,4000}/g) || []
      for (const part of parts) {
         await m.reply(part)
      }
   } else {
      await m.reply(result)
   }
}

// === FUNGSI DELETE LINK ===
async function deleteLinkHandler(m, code) {
   code = code.toUpperCase()
   const link = getLink(code)
   
   if (!link) {
      return m.reply(`❌ Link dengan kode ${code} tidak ditemukan.`)
   }

   deleteLink(code)
   await m.reply(`✅ Link dengan kode ${code} berhasil dihapus.`)
}

// === FUNGSI TRACK LINK ===
async function trackLink(m, code) {
   code = code.toUpperCase()
   const link = getLink(code)
   
   if (!link) {
      return m.reply(
         `❌ Kode ${code} tidak ditemukan.\n\n` +
         `📌 Cek list link: .grabify list`
      )
   }

   await m.reply(`⏳ Mengambil data tracking untuk ${code}...`)

   try {
      // === PANGGIL API GRABIFY UNTUK CEK DATA ===
      const apiUrl = `https://grabify.link/api/url/info?shortcode=${code}`
      const response = await fetch(apiUrl)
      const data = await response.json()

      if (!data || data.error) {
         return m.reply(`❌ Gagal mengambil data.\nError: ${data?.error || 'Unknown'}`)
      }

      // === FORMAT HASIL ===
      let result = `📊 *HASIL TRACKING*\n\n`
      result += `🔗 Link: https://grabify.link/${code}\n`
      result += `📌 Title: ${link.title}\n`
      result += `🖱️ Total Klik: ${data.clicks || 0}\n`

      if (data.clicks && data.clicks > 0) {
         result += `\n📋 *Data Klik Terbaru:*\n`

         const latestClick = data.latest_click || data.clicks_data?.[0]
         if (latestClick) {
            if (latestClick.ip_address) {
               result += `📍 *IP:* ${latestClick.ip_address}\n`
            }
            
            if (latestClick.location) {
               const loc = latestClick.location
               if (loc.city) result += `🏙️ *Kota:* ${loc.city}\n`
               if (loc.region) result += `🗺️ *Provinsi:* ${loc.region}\n`
               if (loc.country) result += `🌍 *Negara:* ${loc.country}\n`
               if (loc.latitude && loc.longitude) {
                  result += `🗺️ *Koordinat:* ${loc.latitude}, ${loc.longitude}\n`
               }
            }

            if (latestClick.user_agent) {
               result += `📱 *Perangkat:* ${latestClick.user_agent.device || 'Unknown'}\n`
               result += `🖥️ *OS:* ${latestClick.user_agent.os || 'Unknown'}\n`
               result += `🌐 *Browser:* ${latestClick.user_agent.browser || 'Unknown'}\n`
            }

            if (latestClick.timestamp) {
               result += `🕐 *Waktu:* ${new Date(latestClick.timestamp).toLocaleString()}\n`
            }

            if (latestClick.referrer) {
               result += `🔗 *Referrer:* ${latestClick.referrer}\n`
            }
         }

         if (data.clicks_data && data.clicks_data.length > 1) {
            const devices = {}
            const browsers = {}
            const countries = {}

            for (const click of data.clicks_data) {
               const agent = click.user_agent || {}
               const device = agent.device || 'Unknown'
               const browser = agent.browser || 'Unknown'
               const country = click.location?.country || 'Unknown'

               devices[device] = (devices[device] || 0) + 1
               browsers[browser] = (browsers[browser] || 0) + 1
               countries[country] = (countries[country] || 0) + 1
            }

            result += `\n📊 *Statistik:*\n`
            result += `📱 Perangkat: ${Object.keys(devices).length} jenis\n`
            result += `🌐 Browser: ${Object.keys(browsers).length} jenis\n`
            result += `🌍 Negara: ${Object.keys(countries).length} negara\n`
         }

      } else {
         result += `\n📭 Belum ada yang mengklik link ini.\n`
         result += `📌 Kirim link ke target: https://grabify.link/${code}`
      }

      if (result.length > 4096) {
         const parts = result.match(/.{1,4000}/g) || []
         for (const part of parts) {
            await m.reply(part)
         }
      } else {
         await m.reply(result)
      }

   } catch (error) {
      console.error('Track error:', error)
      await m.reply(`❌ Error: ${error.message}`)
   }
           }
