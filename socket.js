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

// ===== FUNGSI UNTUK MULTI DEVICE =====
async function startDevice(deviceConfig) {
    // ✅ AMBIL DARI deviceConfig
    const { id, name, number } = deviceConfig;

    // Buat folder session per device
    const authFolder = join(process.cwd(), `session_${id}`);
    await mkdir(authFolder, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);

    const sock = makeWASocket({
        logger,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys)
        },
        printQRInTerminal: !global.pairingCode,
        browser: [name, 'Chrome', '120.0.0.0']
    });

    // ===== PAIRING CODE =====
    if (global.pairingCode && !state.creds.registered) {
        const pairingCode = await sock.requestPairingCode(number);
        console.log(`📱 [${id}] Kode Pairing: ${pairingCode}`);
        console.log(`📱 [${id}] Masukkan kode di WhatsApp > Perangkat Tertaut > Tautkan dengan Kode`);
    }

    // ===== EVENT: Pesan Masuk =====
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (msg.key.fromMe) return;

        try {
            const pesan = msg.message?.conversation || 
                          msg.message?.extendedTextMessage?.text || '';
            const dari = msg.key.remoteJid;

            // ===== LOGIKA BOT =====
            let jawaban = '';
            if (pesan.toLowerCase().includes('halo')) {
                jawaban = `Halo! Saya ${name}`;
            } else if (pesan.toLowerCase().includes('help')) {
                jawaban = 'Ada yang bisa saya bantu?';
            } else if (pesan.toLowerCase().includes('ping')) {
                jawaban = 'Pong! 🏓';
            } else {
                jawaban = 'Ketik "help" untuk bantuan';
            }
            // =======================

            await sock.sendMessage(dari, { text: jawaban });
            console.log(`[${id}] Balas ke ${dari}: ${jawaban}`);

        } catch (err) {
            console.error(`[${id}] Error:`, err.message);
        }
    });

    // ===== EVENT: Simpan Creds =====
    sock.ev.on('creds.update', saveCreds);

    // ===== EVENT: Koneksi =====
    sock.ev.on('connection.update', async (update) => {
        // ✅ AMBIL DARI update
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log(`✅ [${id}] ${name} siap!`);
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log(`🔄 [${id}] Koneksi putus, mencoba ulang...`);
                setTimeout(() => startDevice(deviceConfig), 3000);
            } else {
                console.log(`❌ [${id}] Session expired, pairing ulang.`);
            }
        }
    });

    // ✅ Simpan socket ke global untuk plugin spam
    if (!global.sockMap) global.sockMap = {};
    global.sockMap[id] = sock;

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

    // ✅ ISI promises dengan startDevice
    const promises = devices.map(device => {
        console.log(`📱 Memulai ${device.name} (${device.id})...`);
        return startDevice(device);
    });

    await Promise.all(promises);
    console.log('\n✅ Semua bot aktif!');
}

// ===== EKSPOR =====
export { startAllDevices, startDevice };
