// Kumpulan kata bahasa Indonesia untuk setiap tingkat kesulitan.
// Setiap daftar disaring saat runtime agar panjangnya selalu sesuai aturan.

import type { Difficulty } from "./config";

const MUDAH = `
abu ada adu air aku api apa asa aki aba ayo
bab bak ban bau bel bis bom bor bui bus bea
cat cek cor
dam dan dia doa dor dua dus dek
ego eja era
gas gen gua gol gim gel
hak hal hiu
ibu ide ini isi itu ion
jam jas jet jin jus jip
kau kue kok kol kas kop kos
lap las lem log lis lup lot
mal mau mie mil mas mat mol
nah nol
oli ons oma opa
pak pas pel pin pot pil pos pen pai per pir
rak ras rem rok rol rel roh rim ria
sah sen set sip sol sop sup sel
tak tas teh tim tip tol tua tes tik tar ton top
uap uji ubi
wah wol wig
yah yen
vas via
zat
`;

const SEDANG = `
mati otak lari peti gali luka gigi kuku mata kaki dada awas aduh
mayat darah hantu kubur nisan kafan arwah setan iblis wabah virus busuk
gigit cakar lapar gelap malam kabut petir badai bulan dukun makam zombi
tuyul horor jerit seram ngeri takut panik cemas sunyi lilin obor korek
kapak golok panah busur bedil tamat habis tewas mumi sihir jimat racun
bisa ular tikus gagak kelam suram pucat buas ganas liar jahat kejam amuk
serbu lolos kabur hidup nyawa jiwa tubuh kulit urat perut leher lidah
bahu lutut jari sekop liang
rumah nasi sate soto kopi gula tahu apel ikan ayam sapi kuda bebek rusa
singa gajah buaya kera angsa buku meja kursi pena tinta pintu lampu kunci
baju topi kaos sabun sikat kota desa jalan pasar sawah hutan laut pulau
danau satu tiga empat lima enam tujuh merah biru hijau putih hitam ungu
besar kecil cepat panas baru lama baik buruk makan minum tidur mandi
duduk pukul bakso tempe pecel gudeg nanas jeruk salak jambu garam gelas
garpu kasur mobil motor kapal truk awan hujan angin pohon bunga daun
akar batu pasir tanah asap debu embun salju anak ayah kakak adik nenek
kakek paman bibi teman musuh raja ratu guru kerja main pergi lihat tulis
baca gitar drum suara lagu tari batik keris candi pura senja fajar pagi
siang sore jarum kain kaca besi kayu emas perak
`;

const SULIT = `
tulang tolong kuburan bangkai keranda sesajen kutukan infeksi penyakit
selamat bertahan senter pistol granat senapan amunisi barikade evakuasi
bencana kiamat darurat sirene ambulans bahaya mencekam jenazah taring
daging mangsa memburu pemburu sembunyi menjerit teriak gemetar purnama
berdarah kemenyan pocong mengamuk membusuk bangkit terkutuk serangan
benteng perisai pedang parang tombak peluru senjata ledakan meledak
dinamit bensin baterai sinyal bantuan tentara prajurit dokter perawat
ilmuwan vaksin penawar perban mantra siluman ransel kompas selimut
makanan minuman kaleng sekolah gereja masjid gedung stasiun terminal
bandara gudang pabrik kantor apotek menara jembatan kucing anjing
harimau monyet burung kelinci jerapah kerbau kambing serigala kelabang
kecoak nyamuk belalang jendela celana sepatu handuk kertas payung bantal
lemari kompor piring sendok gunting gunung pantai sungai lautan samudra
kuning cokelat rendang kerupuk martabak gorengan kelapa durian mangga
pisang rambutan semangka anggur pepaya manggis bakwan lontong ketupat
cendol sambal berlari menembak memukul melompat berjalan menangis
tertawa bernapas berdoa menunggu mencari melawan menyerah menggali
membakar mengusir mengejar menerkam mencakar menyeret merayap bergerak
berhenti berani gelisah kosong hening dingin pingsan terluka kematian
bayangan jeritan tangisan langkah pesawat kereta sepeda kemarin sekarang
senang gembira bahagia kecewa komputer telepon televisi kamera listrik
wayang gamelan angklung kebaya sarung angkot warung
`;

const RAW: Record<Difficulty, string> = {
  mudah: MUDAH,
  sedang: SEDANG,
  sulit: SULIT,
};

export const LENGTH_RULES: Record<Difficulty, [number, number]> = {
  mudah: [3, 3],
  sedang: [4, 5],
  sulit: [6, 8],
};

const cache = new Map<string, string[]>();

/** Mengembalikan daftar kata (HURUF BESAR) untuk tingkat kesulitan tertentu. */
export function getWordPool(diff: Difficulty, maxLen?: number): string[] {
  const key = `${diff}:${maxLen ?? ""}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [min, max] = LENGTH_RULES[diff];
  const limit = Math.min(max, maxLen ?? max);
  const set = new Set<string>();
  for (const w of RAW[diff].split(/\s+/)) {
    const word = w.trim().toLowerCase();
    if (!/^[a-z]+$/.test(word)) continue;
    if (word.length < min || word.length > limit) continue;
    set.add(word.toUpperCase());
  }
  const list = [...set];
  cache.set(key, list);
  return list;
}
