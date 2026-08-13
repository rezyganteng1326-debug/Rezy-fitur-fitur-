import './config.js'
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';  // 🔥 Ganti ke Baileys resmi
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { join } from 'path';
import { mkdir } from 'fs/promises';

const logger = pino({ level: 'silent' });

// ===== DELAY FUNCTION =====
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ===== PAIRING DENGAN RETRY & QR FALLBACK =====
async function requestPairingWithRetry(sock, number, id, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`📱 [${id}] Percobaan pairing ke-${attempt}...`);
            await delay(5000); // Tunggu 5 detik (lebih lama biar stabil)
            
            const pairingCode = await sock.requestPairingCode(number);
            console.log(`\n✅ [${id}] KODE PAIRING: ${pairingCode}\n`);
            console.log(`📱 [${id}] Buka WhatsApp > Perangkat Tertaut > Tautkan dengan Kode`);
            console.log(`📱 [${id}] Masukkan kode: ${pairingCode}\n`);
            console.log(`⏰ [${id}] Kode berlaku 60 detik! Masukkan segera.\n`);
            
            return pairingCode;
        } catch (err) {
            console.error(`❌ [${id}] Gagal pairing attempt ${attempt}:`, err.message);
            
            if (attempt === maxRetries) {
                console.log(`🔄 [${id}] Pairing gagal, beralih ke QR Code...`);
                return null; // Fallback ke QR
            }
            
            console.log(`⏳ [${id}] Tunggu 5 detik lalu coba lagi...`);
            await delay(5000);
        }
    }
    return null;
}

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
        printQRInTerminal: true,  // 🔥 QR Code selalu siap sebagai fallback
        browser: [name, 'Chrome', '120.0.0.0'],
        // 🔥 Tambahan biar lebih stabil
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
        patchMessageBeforeSending: true
    });

    // ===== PAIRING CODE DENGAN RETRY =====
    if (!state.creds.registered) {
        console.log(`📱 [${id}] Meminta kode pairing untuk ${number}...`);

        const pairingResult = await requestPairingWithRetry(sock, number, id);
        
        if (pairingResult === null) {
            console.log(`📱 [${id}] QR Code akan muncul sebagai fallback. Scan QR dari WhatsApp HP.`);
            console.log(`📱 [${id}] WhatsApp > Perangkat Tertaut > Tautkan Perangkat\n`);
        }
    }

    // ===== CEK KONEKSI BERKALA (Biar ga stuck) =====
    let isConnected = false;
    let connectionCheckInterval = setInterval(async () => {
        if (isConnected) {
            clearInterval(connectionCheckInterval);
            return;
        }
        
        try {
            const status = await sock?.ws?.readyState;
            if (status === 1) { // WebSocket OPEN
                console.log(`✅ [${id}] Koneksi WebSocket aktif!`);
            } else if (status === 3) { // WebSocket CLOSED
                console.log(`🔄 [${id}] WebSocket tertutup, mencoba reconnect...`);
                clearInterval(connectionCheckInterval);
            }
        } catch (e) {
            // ignore
        }
    }, 5000);

    // ===== EVENT: Koneksi =====
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Tampilkan QR Code sebagai fallback
        if (qr) {
            console.log(`\n📱 [${id}] QR CODE FALLBACK:\n`);
            console.log(qr);
            console.log(`\n📱 [${id}] Scan QR dengan WhatsApp > Perangkat Tertaut > Tautkan Perangkat\n`);
        }

        if (connection === 'open') {
            isConnected = true;
            clearInterval(connectionCheckInterval);
            console.log(`\n✅✅✅ [${id}] ${name} BERHASIL KONEK! ✅✅✅\n`);
            if (!global.sockMap) global.sockMap = {};
            global.sockMap[id] = sock;
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error instanceof Boom)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect) {
                console.log(`🔄 [${id}] Koneksi putus (${statusCode || 'unknown'}), mencoba ulang dalam 5 detik...`);
                clearInterval(connectionCheckInterval);
                setTimeout(() => startDevice(deviceConfig), 5000);
            } else {
                console.log(`❌ [${id}] Session expired. Hapus folder session_${id} dan restart.`);
                clearInterval(connectionCheckInterval);
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // 🔥 Tambahan: Log error
    sock.ev.on('error', (error) => {
        console.error(`⚠️ [${id}] Error:`, error.message);
    });

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

    for (const device of devices) {
        console.log(`📱 Memulai ${device.name} (${device.id})...`);
        await startDevice(device);
        await delay(3000);
    }

    console.log('\n✅ Semua bot aktif!');
}

export { startAllDevices, startDevice };
