import { fetchThumbnail, greeting } from '../../lib/Utilities.js'

export default {
   command: ['credits', 'script', 'thanksto'],
   hidden: 'sc',
   category: 'other',
   async run(m) {
      const customCredits = `╭・୨୧ 𝖼𝗋𝖾𝖽𝗂𝗍𝗌 ୨୧・╮
┊ ✿ 𝗈𝗐𝗇𝖾𝗋 : 𝗏𝗂𝗍𝖺
┊ ✿ 𝗌𝖺𝗁𝖺𝖻𝖺𝗍 : 𝗅𝖺𝗒𝗅𝖺𝖺 𝖼𝗁𝖺𝗇
┊ ✿ 𝖺𝗅𝗅 𝗆𝖾𝗆𝖻𝖾𝗋 𝗌𝖺𝗒𝖺𝗇𝗀 🫶🏻
╰・──────────・╯`

      m.reply(customCredits, {
         title: botName,
         description: greeting(),
         thumbnail: await fetchThumbnail(),
         largeThumbnail: true
      })
   }
}