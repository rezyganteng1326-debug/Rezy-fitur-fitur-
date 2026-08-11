export default {
   command: ['osintgacor', 'og', 'osintmax'],
   category: 'owner',
   description: 'OSINT ULTIMATE - MTProto Telegram (100% Akurat)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         if (!text) {
            return m.reply(
               `🔥 *OSINT ULTIMATE - PALING GACOR!*\n\n` +
               `📌 ${isPrefix}osintgacor 6281234567890\n\n` +
               `📊 *Data yang didapat:*\n` +
               `✅ WhatsApp\n✅ Telegram (MTProto - 100% Akurat)\n✅ Provider SIM\n✅ Media Sosial\n✅ Leak Database`
            )
         }

         let number = text.replace(/\D/g, '')
         if (number.startsWith('0')) number = '62' + number.slice(1)
         if (!number.startsWith('62')) number = '62' + number
         const fullNumber = '+' + number

         await m.reply(`⏳ *OSINT ULTIMATE* memindai ${fullNumber}...\n⏱️ Proses 1-2 menit`)

         let result = `🔥 *OSINT ULTIMATE - HASIL LENGKAP*\n\n`
         result += `📱 *Target:* ${fullNumber}\n`
         result += `🕐 *Waktu:* ${new Date().toLocaleString('id-ID')}\n\n`

         // ============================================================
         // SEKSI 1: WHATSAPP & TELEGRAM (MTProto)
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

         // Telegram MTProto (panggil Python)
         let isTG = false
         let tgID = ''
         let tgName = ''
         let tgUsername = ''

         try {
            const { exec } = await import('child_process')
            const { promisify } = await import('util')
            const execAsync = promisify(exec)
            
            // PAKE PATH ABSOLUT
            const pythonPath = '/data/data/com.termux/files/usr/bin/python3'
            const scriptPath = '/data/data/com.termux/files/home/osint-tools/cek_telegram.py'
            
            const { stdout, stderr } = await execAsync(`${pythonPath} ${scriptPath} ${number}`)
            
            console.log('========== MTProto OUTPUT ==========')
            console.log('stdout:', stdout)
            console.log('stderr:', stderr)
            console.log('=====================================')
            
            if (stderr && !stderr.includes('Warning')) {
               result += `│ ⚠️ Telegram: Gagal cek\n`
            } else {
               const parts = stdout.trim().split('|')
               console.log('parts:', parts)
               console.log('parts[0]:', parts[0])
               
               if (parts[0].includes('✅')) {
                  isTG = true
                  tgID = parts[1] || ''
                  tgName = parts[2] || ''
                  tgUsername = parts[3] || ''
                  console.log('✅ Telegram detected! ID:', tgID, 'Name:', tgName)
               }
            }
         } catch (e) {
            console.error('MTProto Error:', e)
            result += `│ ❌ Telegram: Gagal (${e.message})\n`
         }

         // Fallback: Cek via Web (kalo MTProto gagal)
         if (!isTG) {
            try {
               const tgRes = await fetch(`https://t.me/${number}`, {
                  headers: { 'User-Agent': 'Mozilla/5.0' }
               })
               const tgText = await tgRes.text()
               if (tgText.includes('tgme_page_photo') || tgText.includes('tgme_page_title')) {
                  isTG = true
                  const titleMatch = tgText.match(/<meta property="og:title" content="([^"]+)"/)
                  if (titleMatch) tgName = titleMatch[1]
               }
            } catch (e) {}
         }

         if (isTG) {
            result += `│ ✅ Telegram: Ada akun\n`
            if (tgID && tgID !== '0') result += `│    🆔 ID: ${tgID}\n`
            if (tgName) result += `│    👤 Nama: ${tgName}\n`
            if (tgUsername) result += `│    @${tgUsername}\n`
         } else {
            result += `│ ❌ Telegram: Tidak ditemukan\n`
         }

         result += `╰───────────────────\n\n`

         // ============================================================
         // SEKSI 2: PROVIDER
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
         result += `│ 📡 Provider: ${provider}\n`
         result += `╰───────────────────\n\n`

         // ============================================================
         // SEKSI 3: MEDIA SOSIAL
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
         for (const social of socials) {
            result += `│ 🔗 ${social.name}: ${social.url}\n`
         }
         result += `╰───────────────────\n\n`

         // ============================================================
         // SEKSI 4: LEAK
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
         // SEKSI 5: INFO
         // ============================================================
         result += `╭─❑ *INFO TAMBAHAN*\n`
         result += `│ 🕐 Waktu: ${new Date().toLocaleString('id-ID')}\n`
         result += `│ ⚡ Status: MTProto TELEGRAM\n`
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
