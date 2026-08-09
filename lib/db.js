import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DB_PATH = join(__dirname, '../data/grabify.json')

// Load data dari file JSON
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

// Simpan data ke file JSON
export function saveDB(data) {
   try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
   } catch (e) {
      console.log('Gagal save DB:', e.message)
   }
}

// Tambah data
export function addLink(code, data) {
   const db = loadDB()
   db[code] = data
   saveDB(db)
   return db
}

// Hapus data
export function deleteLink(code) {
   const db = loadDB()
   delete db[code]
   saveDB(db)
   return db
}

// Get semua data
export function getLinks() {
   return loadDB()
}

// Get satu link
export function getLink(code) {
   const db = loadDB()
   return db[code] || null
}
