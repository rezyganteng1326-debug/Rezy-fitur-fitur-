import { LRUCache } from 'lru-cache'
import { cpus } from 'os'

const CPU_COUNT = cpus().length

Object.assign(globalThis, {

  devices: [
    { id: 'device1', name: 'Bot Utama', number: '6285649934909' },
],

   ownerName: 'Rezy', // ganti inii 
   ownerNumber: '62xxx', // ganti ini nomor owner 
   botName: 'Rezybotwawa', // ganti 
   footer: '🍃 apanyak', // ganti 
   botNumber: '6289525408623', // ganti ini nomor mu bot 

   pairingCode: false, // ga usah gnti 

   defaultLimit: 15,

   stickerPackName: '𝗂𝗇𝗌𝗍𝖺𝗀𝗋𝖺𝗆', // bebas gnti atau tidak

   stickerPackPublisher: '@𝖿𝗂𝗍𝗒𝖺_𝗍𝖺𝖺', // bebas gnti atau tidak 

   googleApiKey: '', // apikey mu sendiri di gemini 

   apiUser: '', // tinggal apiky mu klo ga ada ga usah biarin ae 
   apiSecret: '', // tinggal apiky mu klo ga ada ga usah biarin ae 

   localTimezone: 'Asia/Jakarta',

   botThumbnail: './media/Image/thumbnail.jpg',

   botMenuMusic: './media/Audio/menu-music.mp3',

   temporaryFolder: 'temp',

   pluginsFolder: 'plugins',

   authFolder: 'session',

   storeFilename: 'store.json',

   databaseFilename: 'database.json',

   temporaryFileInterval: 30 * 60 * 1_000,

   dataInterval: 10 * 60 * 1_000,

   gcInterval: 1 * 60 * 60 * 1_000,

   requestTimeout: 1.5 * 60 * 1_000,

   ffmpegTimeout: 1 * 60 * 1_000,

   minDelay: 100,

   maxDelay: 3 * 1_000,

   ignoreOldMessageTS: 30,

   rssLimit: 384 * 1_024 * 1_024,

   ffmpegConcurrency: Math.max(4, Math.floor(CPU_COUNT * 1.3)),

   maxNSFWScore: 0.75,

   maxHistoryChatSize: 20,

   ExploreSession: new LRUCache({
      max: 256,
      ttl: 1.5 * 60 * 1_000,
      updateAgeOnGet: false,
      updateAgeOnHas: false,
      ttlAutopurge: true
   })
})
