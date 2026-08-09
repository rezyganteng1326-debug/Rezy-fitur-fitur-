export default {
   command: ['autotrack', 'at'],
   category: 'owner',
   description: 'Aktifkan auto tracking (otomatis catat klik)',
   async run(m, { sock, isPrefix, command, text }) {
      try {
         // Toggle auto tracking
         if (!global.autoTrack) global.autoTrack = false
         global.autoTrack = !global.autoTrack

         const status = global.autoTrack ? '🟢 AKTIF' : '🔴 NONAKTIF'
         
         let reply = `📌 *Auto Tracking ${status}*\n\n`
         reply += `Ketika auto tracking aktif:\n`
         reply += `✅ Bot otomatis catat siapa yang kirim pesan "udah" atau "klik"\n`
         reply += `✅ Data tersimpan di database\n\n`
         reply += `📊 Cek hasil: .cektrack [kode]\n\n`
         reply += `📌 Matikan/nyalakan: ${isPrefix}autotrack`

         await m.reply(reply)

      } catch (error) {
         console.error('Error:', error)
         await m.reply(`❌ Error: ${error.message}`)
      }
   },
   owner: true
}
