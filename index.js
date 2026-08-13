import dotenv from 'dotenv'
dotenv.config()

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { startAllDevices } from './socket.js'

const SETUP_PATH = fileURLToPath(
   new URL('./socket.js', import.meta.url)
)

const [MAJOR, MINOR, PATCH] = process.versions.node
   .split('.')
   .map(value => +value.replace(/\D.*$/, ''))

const Banner = () => {
   console.log('\x1Bc')

   const banner = [
      '█▀▀ ▀█▀ ▄▀█ █▀█ █▀▀ █▀▀ █▀▀ █▀▄',
      '▄▄█  █  █▀█ █▀▄ ▄▄█ ██▄ ██▄ █▄▀'
   ]

   const footer = 'GitHub: https://github.com/Rezyganteng1326-debug'

   const terminalWidth = process.stdout?.columns || 80

   const toCenter = (text) => {
      const padding = Math.floor((terminalWidth - text.length) / 2)
      return ' '.repeat(Math.max(padding, 0)) + text
   }

   banner.forEach(line => console.log(toCenter(line)))
   console.log('\n' + toCenter(footer))
}

const Start = () => {
   Banner()
   
   if (MAJOR < 20 || (MAJOR == 20 && MINOR < 18) || (MAJOR == 20 && MINOR == 18 && PATCH < 1)) {
      console.error(
         `\n❌ This script requires Node.js 20.18.1 or above to run reliably.\n` +
         `   You are using Node.js ${process.versions.node}.\n` +
         `   Please upgrade to Node.js 20.18.1 or above to proceed.\n`
      )
      process.exit(1)
   }

   startAllDevices().catch((error) => {
      console.error('❌ Error fatal:', error)
      console.log('🔄 Restart dalam 5 detik...')
      setTimeout(Start, 5000)
   })
}

Start()
      console.error(`⚠️ Exited with code ${code}`)

      cleanUp(instance)

      if (code !== 0)
         setTimeout(Start, 2000)
   })
}

const cleanUp = (instance) => {
   if (!instance) return

   if (!instance.killed)
      try {
         instance.kill('SIGTERM')
      }
      catch { }

   if (instance.connected)
      try {
         instance.disconnect()
      }
      catch { }

   try {
      instance.stdout?.destroy()
      instance.stderr?.destroy()
      instance.stdin?.destroy()
   }
   catch { }

   instance.removeAllListeners()
}

Banner()

if (
   MAJOR < 20 ||
   (MAJOR == 20 && MINOR < 18) ||
   (MAJOR == 20 && MINOR == 18 && PATCH < 1)
) {
   console.error(
      `\n❌ This script requires Node.js 20.18.1 or above to run reliably.\n` +
      `   You are using Node.js ${process.versions.node}.\n` +
      `   Please upgrade to Node.js 20.18.1 or above to proceed.\n`
   )
   process.exit(1)
}

Start()
