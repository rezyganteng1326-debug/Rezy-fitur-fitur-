import './config.js'
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore
} from '@itsliaaa/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { join } from 'path';
import { mkdir } from 'fs/promises';

const logger = pino({ level: 'silent' });

// ===== DELAY FUNCTION =====
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function startDevice(deviceConfig) {
    const { id, name, number } = deviceConfig;

    console.log(`📱 [${id}] Menyiapkan ${name}...`);

    const authFolder = join(process.cwd(), `session_${id}`);
    await mkdir(authFolder, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);

    const sock = makeWASocket({
        logger,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys)
        },
        printQRInTerminal: false,
        browser: [name, 'Chrome', '120.0.0.0']
    });

    // ===== PAIRING CODE =====
    if (!state.creds.registered) {
        console.log(`📱 [${id}] Meminta kode pairing untuk ${number}...`);
        
        try {
            await delay(2000); // Tunggu 2 detik
            const pairingCode = await sock.requestPairingCode(number);
            console.log(`\n✅ [${id}] KODE PAIRING: ${pairingCode}\n`);
            console.log(`📱 [${id}] Buka WhatsApp > Perangkat Tertaut > Tautkan dengan Kode`);
            console.log(`📱 [${id}] Masukkan kode: ${pairingCode}\n`);
        } catch (err) {
            console.error(`❌ [${id}] Gagal dapat pairing code:`, err.message);
            console.log(`📱 [${id}] Coba jalankan ulang dalam 5 detik...`);
            await delay(5000);
            return startDevice(deviceConfig);
        }
    }

    // ===== EVENT: Koneksi =====
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log(`✅ [${id}] ${name} siap!`);
            if (!global.sockMap) global.sockMap = {};
            global.sockMap[id] = sock;
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log(`🔄 [${id}] Koneksi putus, mencoba ulang...`);
                setTimeout(() => startDevice(deviceConfig), 3000);
            } else {
                console.log(`❌ [${id}] Session expired. Hapus folder session_${id} dan restart.`);
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
}

// ===== JALANKAN SEMUA DEVICE =====
async function startAllDevices() {
    const devices = global.devices || [];

    if (devices.length === 0) {
        console.error('❌ Tidak ada device di config!');
        process.exit(1);
    }

    console.log(`🚀 Menjalankan ${devices.length} bot...\n`);

    // Jalankan satu per satu (biar ga bentrok)
    for (const device of devices) {
        console.log(`📱 Memulai ${device.name} (${device.id})...`);
        await startDevice(device);
        await delay(3000); // Jeda 3 detik antar device
    }

    console.log('\n✅ Semua bot aktif!');
}

export { startAllDevices, startDevice };
