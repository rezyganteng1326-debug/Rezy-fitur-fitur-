import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DB_PATH = join(__dirname, '../data/grabify.json')

export function loadDB() {
   try {
      if (fs.existsSync(DB_PATH)) {
         const data = fs.readFileSync(DB_PATH, 'utf8')
         return JSON.parse(data)
      }
   } catch (e) {
      console.log('Gagal load DB:', e.message)
   }
   return {}
}

export function saveDB(data) {
   try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
   } catch (e) {
      console.log('Gagal save DB:', e.message)
   }
}

export function addLink(code, data) {
   const db = loadDB()
   db[code] = data
   saveDB(db)
   return db
}

export function deleteLink(code) {
   const db = loadDB()
   delete db[code]
   saveDB(db)
   return db
}

export function getLinks() {
   return loadDB()
}

export function getLink(code) {
   const db = loadDB()
   return db[code] || null
}
