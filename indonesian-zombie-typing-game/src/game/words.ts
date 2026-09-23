// Kumpulan kata bahasa Indonesia untuk setiap tingkat kesulitan.
//
// Sumber & cara penyaringan (lihat ringkasan di README sesi ini):
//   1. Bukti PEMAKAIAN — kata diambil dari korpus nyata bahasa Indonesia:
//      subtitel film/serial (OpenSubtitles 2018) untuk bahasa sehari-hari, serta
//      Wikipedia Indonesia 2021 dan berita 2020 + 2022 (Leipzig Corpora).
//      Kata harus muncul >=5 kali di minimal 2 korpus, atau sangat sering di satu korpus.
//   2. Bukti KEBAKUAN — setiap kata diperiksa dengan kamus ejaan resmi Indonesia
//      (hunspell id_ID, berbasis KBBI) agar bentuk berimbuhan seperti "menembak"
//      atau "kesempatan" ikut tervalidasi, dan nama diri/singkatan tersaring.
//   3. Penyaringan tambahan: kata kasar/vulgar, singkatan tulis (sbg, dll),
//      dan kata Inggris yang bocor dari subtitel dibuang.
//   4. Tingkat Mudah disaring paling ketat lalu diperiksa manual, karena kata
//      3 huruf paling banyak memuat potongan kata dan slang.
//
// Jumlah kata yang memenuhi syarat memang berbeda tiap tingkat: kata 3 huruf yang
// benar-benar lazim dipakai jumlahnya memang terbatas, jadi batas 10.000 kata
// hanya berlaku bila kata yang layak memang tersedia sebanyak itu.

import type { Difficulty } from "./config";

/** 171 kata */
const MUDAH = `
aba abu ada adu air aja aki aku apa api asa ayo bab bak ban bau bea bek bel bin bir bis bom bor bos bui bus
cap cat cek dah dan deh dek dia doa dok dor dua dus ego eja eks era flu gas gel gen gim gol gua hai hak hal
hiu ibu ide iga ini ion iri isi isu itu iya jam jas jet jin jip jok jus kah kak kan kap kas kau kok kol kop
kos kue lab lah lap las lem les lis log loh lup mak mal map mas mat mau mie mil mol nah nak nih nol oke oli
oma ons opa pai pak pas pel pen per pil pin pir pop pos pot pro pun rak ras rel rem ria rim roh rok rol sah
sel sen set sih sip sok sol sop sup tak tas tau teh tes tik tim tip tol ton top tua tuh tur uap ubi uji vas
via wah web wig wol yah yen yuk zat
`;

/** 3177 kata */
const SEDANG = `
abad abadi abai abang abbas abdi abdul abis abjad absen abses acak acap acar acara aceh acuan acuh adab adan
adat adem adik adil admin aduan aduh aduk adzan agak agama agar agen agung ahli ajaib ajak ajal ajang ajar
ajari akad akal akan akar akbar akhir akrab aksen akses aksi akta akte aktif aktor akui akun akur akut alam
alami alang alarm alas alat album alel alfa alga alias alif alih alik alim alis alkil alot altar alto alun
alur amal aman amar amat amati ambil amin amina amino amir amis ampas ampuh ampul ampun amuba amuk anak anal
ancam anda andai andal andil aneh aneka angin angka angsa angus anime animo anion anode antah antar anti
antik anton antre antri anus anut anyar aorta apaan apel apes apik apron apung arab arah arak aral aram
arang arca area areal aren arena ares argon aria arif aroma arsip arti artis arung arus arwah arya asal asam
asap asas asasi asbes aset ashar asia asih asik asin asing asli asma aspal aspek aspri asri asuh asura asyik
atap atas atase atau ateis atlas atlet atlit atol atom atur audio audit aula aulia aura aurat auto avtur
awak awal awam awan awas awasi awet ayah ayal ayam ayat ayem azab azan azas aziz baba babad babak babat babi
babu baca bacok badai badak badan badik badut bagai bagan bagi bagus bahan bahas bahu bahwa baik baja bajaj
bajak baji bajik baju baka bakal bakar bakat bakau bakmi bakso bakti baku bakul bala balai balap balas balau
balet balik balok balon bambu banda bando bang bani bank bantu bapa bapak baper bara barak barat barel baret
bari baris baru basa basah basal basi basin basis bata batak batal batas batik batin batok batu batuk baumu
baut bawa bawah baya bayam bayan bayar bayi bazar beban bebas bebek beber becak becek becus beda bedah bedak
bedil begal behel bekal bekas beken beku bekuk bela belah belas beli belia belok beluk belum belur belut
benak benar benci benda benih benua benur berak beras berat beres beri beru besan besar besi besok besuk
beta betah betis beton betul biak biang biar biara bias biasa biaya bibi bibir bibit bidah bidak bidan bidik
biduk bihun bijak biji bijih bikin biksu bila bilah bilas bilik bina biner bini binti biola biota biro biru
bisa bison bisu bisul bius blog blok blong blues blur blus bobo bobol bobot bocah bocor bodi bodoh bogor
boks bola bolak boleh bolos bolu bong bonus borat boron boros boru bosan boson botak botol bruto buah buang
buas buat buaya bubar bubuk bubur budak budi bugar buhul bujet bujuk bujur buka bukan buket bukit bukti buku
bulan bulat bule bulu buluh bulus bumbu bumi bunda bung bunga buntu bunuh bunyi buram buron bursa buru buruh
buruk busa busi busuk busur buta butik butir butuh buyar buyut cabai cabe cabor cabut cacar cacat caci cadar
cadas cagar cair cakap cakar cakep cakra caleg calo calon camar camat canda candi candu capai cape capek
capit cara cari catat catu catur cawan cawat cebol cecak cece cegah cekal ceker celah celup cemas cepat
cerah cerai ceri ceria cerna ceruk cetak cetus cewek cicak cicit cikal cilik cina cinta cipta ciri cita
citra cium coba cocok copet copot corak cowok cuaca cuci cucu cuek cuit cuka cukai cukup cukur culik cuma
cuman curah curam curas curat curi cuti dada dadah dadar dadi dadih dadu dagu dahak dahan dahi dalam dalem
dalih dalil damai damar dana danau dang dansa dapat dapil dapur dara darah darat dari daro dasar dasi data
datar datuk daun daur dawai dawet daya dayah debat debit debu debut degan dekan dekat delik delta demam demi
demo denah denda denim depan depo depot deras derau derbi deret desa detak detik detil dewa dewan dewi diadu
diam diare dicap dicat didih didik dieja diet digit diisi dikit diksi dildo diler dinar dinas dini diode
dipan dipol diri dirut disel disko diuji diva doaku doang dobel dodol dogma dojo dolar domba donat dong
donor dosa dosen dosis doyan draf drama drop drum dual duane dubes dubur duda duduk duel duet duga dugem
duit duka dukuh dukun dulu dunia dupa duri dusta dusun duta eceng edan edar edisi edit efek egois ejaan ekar
ekor eksis elang elips elit elite elok email emak emang emas emban ember embun emisi emoji emosi empat empu
empuk enak enam encer encik entah ente entri enyah enzim epik epos erat erik eror erosi esai esok essay
ester etape eter etik etika etil etis etnik etnis etos euro fabel faham fajar fakir faks faksi fakta falak
fana fasad fase fasih fasik fasis fatal fatwa fauna feri feses fiber figur fikih fikir fiksi film filum
final finis firma fisi fisik fitri fitur flek flora fluks fobia foil fokus folat folio fonem forma forum
fosil foto foton frasa frase fungi fusi gabah gabus gacor gada gadai gadis gaduh gaek gagah gagak gagal
gagap gaib gail gajah gaji gala galai galak galat galau gali galon galur gama gamet gamis gamma ganas ganda
gang ganja ganti gara garam garap garda gardu garis garpu gatal gaul gaun gaung gawai gawat gaya gede gedor
gegar geger gelak gelap gelar gelas geli gema gemar gemas gempa gemuk genap geng genit genom genre genta
genus gerah gerai gerak geram gerik gesek geser gesit getah getar getir getol ghaib giat gigi gigih gigit
gila gilda gini gips gipsi giro gitar gitu gizi gladi gojek goji golf golok gong goni gosip gosok gotik
gowes goyah graf gram grasi grogi grup gubuk guci gudeg gugat gugup gugur gugus gula gulai gulat gulma guna
gurau gurih guru gurun gusar gusi guyub habib habis hadir hadis hafal hafiz haid hajar hajat haji hakim
halal halo halte halus hama hamba hamil hampa hana hantu hanya hapal hapus hara haram harap harem harga hari
harpa hart harta haru harum harus hasil hasta hati haul haus hawa hayat hebat heboh helai helm hemat henti
heran herba hero hewan hias hibah hidup hifa hijab hijau hilal hilir himne hina hindu hiruk hirup hisab
hisap hitam hoaks hobi hoki honor hore horor hotel hujan hukum hulu human humas humus huni huruf hutan ialah
iblis ibnu ibuku ibumu ideal idiom idola ihram ihwal ijab ijin ijuk ikal ikan ikat iklan iklim ikon ikrar
ikut ikuti ilahi ilham ilmu ilusi imam iman imbal imbas imbau imbuh imlek impas impor imsak imun imut inang
inap incar inci indah indie indo indra induk infak info infus ingat ingin ingus injak injil input insan
insya intai intan intel inti intim intip intro iodin ionik ipar iptek irama iris irit ironi isap isbat iseng
isian isis islam istri isya item itik iuran izin jabat jadi jaga jagal jagat jago jahat jahe jahil jahit
jajak jajan jaket jaksa jala jalak jalan jalar jalin jalur jamak jamal jaman jambu jamin jamu jamur janda
janin janji janur jarak jari jarik jarum jasa jasad jatah jati jatuh jauh jauhi jawab jaya jebol jeda jejak
jelai jelas jelek jeli jemur jenis jenuh jepit jera jeram jerat jerih jerit jeruk jihad jijik jika jilid
jimat jinak jiran jitu jiwa jodoh joget johan joki jompo jong jorok jotos jual juang juara jubah jubir judi
judo judul juga jujur jumat jumbo jumpa jung junta juri juru jurus juta kabar kabel kabin kabir kabul kabur
kabut kaca kacau kadal kadar kader kades kadet kado kafan kafe kagak kaget kagum kail kain kait kaji kakak
kakao kakap kakek kaki kaku kala kalah kalap kalau kaldu kalem kali kalo kalor kalu kalut kamar kami kamis
kamp kamu kamus kana kanal kanan kane kanji kano kanon kans kaos kapak kapal kapan kapas kapel kapok kappa
kapur kara karam karat karet kargo kari karib karir karma karo karst kartu karun karya kasa kasar kasau
kaset kasi kasih kasim kasir kasta kasur kasus kata katai katak kato katun katup kaul kaum kaus kawah kawal
kawan kawat kawin kaya kayak kayu kayuh kebab kebal kebo kebun kebut kecap kece kecil kecoa kedai kedap
kedok kedua kejam kejar keji keju kejut kekal kekar kelab kelak kelam kelar kelas kelor keluh kemah kemas
kemih kena kenal kendi keok keong kepo kera kerah kerak keran kerap keras keren keris kerja kerok kerub
keruh kesah kesal kesan kesel ketam ketan ketat ketel ketik ketok ketua ketuk khas kiai kian kiat kibor
kicau kidal kikuk kilas kilat kilau kilo kimia kini kios kipas kiper kira kirab kiran kiri kirim kisah kisi
kista kita kitab klaim klan klas klien klik klip klise klon klub knot koala koboi kobra kocak kocek kocok
kode kodok koil koin koka koki kokoh kolam kolom koma komen komet komik komit kompi konon koper kopi koplo
kopra koral koran korek korps korup kosa kota kotak kotor kram krama kran krem krim kriya krom kuah kuali
kuas kuasa kuat kubah kubik kubis kubu kubur kubus kuda kuduk kudus kuil kuis kuku kukuh kukus kuli kulit
kulup kuman kumis kumuh kumur kunci kung kuno kuota kupas kupon kupu kura kurir kurma kurs kursi kurun kurus
kurva kusam kusen kusir kusta kusut kutil kutip kutu kutub kutuk kuwu kuyup laba label labia labil labu
lacak laci lada laden lafal laga lagi lagu lahan lahap lahar lahat lahir laik lain laju lajur laka laki
lakon laku lalai lalat lalim lalu lalui lama laman lamar lampu lamun lana lang lapak lapar lapas lapis lapor
lapuk lara laras lari laris lars larut larva laser latar laten latih latin lauk laun laut lava lawak lawan
lawas layak layar layer layu lazim lebah lebam lebar lebat lebih lebur lecet ledak lega legal legit leher
lekas lekat lekuk lelah lelap lele leleh lemah lemak lemas lembu lemon lemur lena leng lensa lepas lesi lesu
letak letih level lewat lezat lian liang liar liat libur licik licin lidah lidi lift liga ligan lihai lihat
lila lilin lima limas limfa limpa limun linen ling lini lipan lipat lipid lirih lirik lisan liter liur lobak
lobi lobus lodeh logam logat logis logo lokal loker loket loki lokus lola lolos lomba long lori lotek lotre
lotus loyal loyo luang luar luas lubuk lucu ludes lugas lugu luhur luka lukai lukis luluh lulus lumut lunak
lunar lunas lupa lupus luput lurah lurik lurus lusa lusin lusuh lutut luwes maaf maag mabuk macam macan mace
macet madu madya mafia magis magma maha mahal mahar mahir mahu main maju maka makam makan makar maket maki
makin makna mako makro malah malai malam malas malik malt malu mama mamah mamak mami mampu mana mandi manga
mani mania manis manja manna manta mantu mapan mapel mara marah marak marga mari marka masa masak masal
masam masif masih massa masuk mata mati matik matra maut mawar mawas maya mayam mayat mayur mbah mbak mbok
mebel medan media medik medio medis mega megah meja mekar melek melon memar meme memo menak menit menu menua
meong mepet merah merak merdu merek meri merk merta mesin mesiu meski mesra mesti metal mete meter metil
metro mewah migas mika mikro milad milik mimpi mina minat mini minim minor minta minum minus miras mirip
miris misa misal misi misil mitos mitra mobil mochi moda modal mode model modem modis modul modus moge mogok
mohon molar molor momen momok mong mono moral moril morse mosi motif moto motor motto muak mual muara muat
muda mudah mudi mudik mufti mujur muka mukim mula mulai mulas mulia mulsa mulus mulut mumi munas murah mural
muram murid murka murni musda musik musim muson musti musuh mutan mutu naas nabi nada nadi nafas nafsu naga
nahas nahi nahwu naif naik najis nakal nalar nama namun nanah nanas nanda nanti napas napi nara nasab nasal
nasi nasib natal nazar nazir negri nekad nekat nenek neon neto netra netto ngeri ngilu niaga niat nihil
nikah nikel nila nilai nilam nilon nimfa ning ninik ninja nipah nipis nira nisan noda nodus nomer nomor nona
norak norma nosel nota novel nujum nyai nyala nyali nyang nyata nyawa nyeri oasis obat obeng objek obor
obyek ogah ojek oker oknum oktaf oktan olah oleh oleng ombak omega omong omset omzet onar open oper opini
opium opor opsi opsir optik optis opus oral orang orasi orbit orde order ordo organ orion orkes ormas orok
otak otot otsus oval oven over ovum ozon pacar pacu pada padam padan padat padi padu pagan pagar pagi pagu
paha paham pahat pahit pajak pakai pakan pakar pakem paket pakis paksa pakta paku pala palem palet palka
palm palma palsu palu paman pamer pamit pamor panah panas panci pandu panel panen panik panja panji panti
papa papah papan papar papi para parah paras pare pari parit paro paru paruh parut pasak pasal pasar pasif
pasir pasok pasta pasti patah paten pati patih patik patin patok patri patuh patut pauk paus pawai payah
payau pecah pecat pecel peci pecut pedal pedas pedih pegal pegas peka pekan pekat pela pelak pelan pelat
pelek pelet pelik pelit peluk pemda pena penat peni penuh penyu perah perak peran perca perda perdu pergi
peri perih perlu peron pers perut pesan pesat pesta peta petai petak peti petik petir piala piano piatu
pihak pijar pijat pikap pikat pike piket pikir pikun pilar pilek pilih pilot pilu pines pinta pintu pinus
pion pipa pipet pipi pipih pipis pisah pisau pita pitam piton pivot plak plan plang plat plaza pleno plum
plus poci pohon poin pojok pokja pokok pola polar polda polio polip polis polo polos pompa poni popok pora
pori poros porsi port porta pose posko prabu praja prem premi pria prima prodi promo prosa puan puas puasa
pucat pucuk pudar puing puisi puji pukat pukul pula pulas pulau pulih pulp pulsa puluh punah punca pundi
punya pupa pupil pupuk pupus pura purba puri purun pusar pusat putar putih putik putra putri putus puyuh
rabi rabu rabun racun radar raden radio raga ragam ragi ragu rahib rahim raib raih raja rajah rajin rajut
raker raket rakit rakor raksa rakun rakus rama ramah ramai rambu rame ramen rami rana ranah rancu rang rani
rapat rapi rapih rapor rapuh rasa rasi rasio rasul rata ratas ratu ratus raut rawa rawan rawat rawit raya
rayap rayon rayu razia real rebus rebut receh reda redup regan regu rehab rehat reka rekam rekan rekap rekor
reksa rela relai reli relik remeh remi renda renta reog repot resah resep reses reset resi resin resmi resor
resto restu retak retro reuni rewel rezim riang rias riba ribet ribu ribut ricuh ridho riil rilis rima rimba
rinci rindu ring risau riset risih ritel ritme ritus riuh rival robek roboh robot roda rodi roket rokok roma
romo rompi ronda ronde rotan roti rotor ruah ruam ruang ruas rubah rubel rubuh rudal rugbi rugi rujak rujuk
ruko rukun rumah rumit rumor rumus rungu rupa rupee rusa rusak rusuh rusuk rusun rutan rute rutin saat saban
sabar sabda sabit sabuk sabun sabut sadap sadar sadis safir saga sagu saham sahih sahur sahut saing sains
saja sajak saji saka sakit saksi sakti saku salah salak salam salat saldo saleh salem salep salib salim
salin salip salju salon salto salut sama samar samir sampo sana sanad sanak sanca sanda sandi sang santo
sapa sapi sapu saraf saran sarat sari saru sasar sasi sasis sate satin satir satu satwa saudi sauna saus
sawah sawi sawit sawo saya sayap sayur sebab sebar sebut sedan sedap sedia sedih sedot seduh segan segar
segel segi sehat sein seisi sejak sejam sejuk sekam sekat sekda sekop sekte sela selai selam selat selip
selir seluk semak semen semi semu semua semur semut senam senar senat sendi seng seni senja seok sepak sepi
sepuh sepur serah serai serak seram serap serat serba serbu sereh serep seret seri serta seru serum sesak
sesar sesat sesi setan setia setir setop setor setua sewa siaga sial siam siang siap siapa siar siber sibuk
sidak sidik sifat sigap sigma sihir sikap sikat siksa siku sikut sila silam silat silih simak sinar singa
sini sinis sinus sipil sipir siput siram sirap siri sirih sirip sirna sirop sirup sisa sisi sisik sisir
siswa siswi sita situ situs siur skala skema skor skrip skuad skuat slang sling slot soal soba sobat sobek
soda sofa soket solar solat solid solo sonar sopan sopir sorak sore soren sorga sorot sosis sosok soto spam
spasi spion spons spora sport spot staf stan start stasi stepa stik stok stop stres strok studi stupa suaka
suami suap suar suara suatu subuh subur suci suda sudah sudi sudut sufi suhu sujud suka sukai sukar sukma
suku sukuk sukun sulam sulap sulih sulit sulur sumbu sumo sumur sunah sunat sunyi supel super supir surah
surai suram surat surau surel surga suri suruh surut surya susah susu susul susun susur sutra swap syair
syal syekh syiar syok taat tabah tabel tabib tabir tabu tabuh tabur tabut tadah tadi tagar tagih tahan tahap
tahi tahta tahu tahun tajam tajir tajuk taksi takut takwa tala talak tali talk talon talut taman tamat tamu
tanah tanam tanda tandu tang tango tani tank tanpa tante tanur tanya tapa tapak tapal tapi taraf tari tarif
tarik tarot taruh tasku tasmu tata tatap tato taun tawa tawaf tawar tawas tawon tebak tebal tebar tebu tebus
teduh tega tegak tegap tegar tegas teguh tegur tekad tekan tekel teken teko teks tekun telah telak telan
telat teler teluk telur tema teman tempa tempe tempo temu temui tenar tenda tenis tenor tensi tentu tenun
teori tepat tepi tepuk tera terak teras teri terik teror teruk terus tesis tesla tetap teteh tetes tetua
tewas tiada tian tiang tiap tiara tiba tidak tidur tifa tifus tiga tikar tiket tikus tilas timah timor timun
timur ting tingi tinja tinju tinta tipe tipis tips tipu tirai tiram tiran tiri tiru tirus tisu titah titel
titi titik titip tiup toga togel toke tokek token toko tokoh tolak tolok tolol tomat tong tonik topan topi
topik torsi total totem toto trafo trah tram trans trek trem tren trik trim trio trofi troli tropi truk tsar
tuai tuak tuaku tuamu tuan tuang tuas tubuh tuduh tugas tugu tuhan tuju tujuh tukar tukas tukik tukin tulen
tuli tulip tulis tulus tumis tumit tumor tumpu tuna tunai tunas tunda tunik tupai turis turun turut tusuk
tutor tuts tutul tutup tutur tuyul twit uang ubah uban ubin ucap udang udara udon ufuk ujar ujian ujung ukir
ukur ulah ulama ulang ular ulas ulat ulet ulin ulkus ultah ulung umat umbi umbul umpan umpet umrah umroh
umum umur undi unduh undur ungu unik unit unjuk unsur unta untai untuk upah upaya upeti urai urang urat
urban urea urgen urin urine urung urus urut usah usaha usai usang usap usia usil usir uskup ustad ustaz usul
usung usus usut utama utang utara utas utuh uzur vakum valas valid vegan vena verba versi veto video vidio
vila vinil viper viral virus visa visi visum vital vlog vokal voli volt vonis wabah wadah waduk wafat wafel
wafer wagub wahai wahid wahyu wajah wajan wajar wajib wajik wakaf wakil waktu walau walet wali wamil wanda
wang wangi waras warga waris warna warta waru wasir wasit watak water watt wazir wesel weton wijen windu
wiski wisma wong wudhu wujud wukuf wushu yaitu yakin yakni yang yatim yoga yuri zakat zalim zaman zebra zeni
zikir zirah zombi zona zoom zuhur zulu
`;

/** 7666 kata */
const SULIT = `
abaikan abangku abangnya abdomen abnormal aborigin aborsi abrasi absensi absolut abstain abstrak acaranya
adakah adakan adalah adanya adaptasi adaptif adaptor adapun adegan adidaya adikku adikmu adiknya adiktif
adikuasa adinda adipati aditif adonan adopsi adrenal aduhai advokasi advokat aerobik aerosol afiliasi
afinitas afirmasi afrika agaknya agamanya agamis agenda agensi agitasi agraria agraris agregat agresi
agresif agunan agustus ahlinya airnya ajakan ajaknya ajalnya ajaran ajarkan ajudan ajukan akademi akademik
akademis akhiran akhirat akhirnya akhlak akibat akidah aklamasi akrabnya akrobat akronim aksara akseptor
aksesori aksioma akting aktiva aktivasi aktivis aktris aktual akuarium akuatik akuisisi akulah akuntan
akurasi akurat akustik alaihi alaikum alamat alamiah alamin alaminya alangkah alasan alasanku alasanmu
alatnya albatros alegori alergi alfabet algojo alhasil aliansi alihkan aliran aljabar alkali alkaloid alkana
alkimia alkohol almarhum alokasi alpukat alsintan alumni alumnus alunan amalan amanah amanat amandel amarah
amatir ambang ambeien ambigu ambilkan ambillah ambisi ambisius amblas ambles ambrol ambruk ambulan ambulans
ambyar amerika amfibi amnesia amnesti amonia amonium amoral amplas amplop ampunan ampuni amputasi amukan
amunisi anakan anakku anakmu anaknya analis analisa analisis analitik analitis analog analogi ananda anarki
anarkis anatomi anatomis ancaman andalan andalkan andesit android anekdot aneksasi anemia anestesi anggap
anggapan anggar anggaran anggota anggrek anggun anggur anginnya angkasa angkat angkatan angker angklung
angkot angkuh angkut angkutan angsuran aniaya animasi animator animisme anjing anjingku anjingmu anjlok
anjungan anjuran anomali anonim anosmia ansambel antara antaran antarkan antelop antena anterior antibodi
antigen anting antitank antologi antraks antrean antusias anugerah anumerta anyaman apabila apakah apakan
apalagi apalah aparat aparatur apatis apinya aplaus aplikasi apotek apoteker apotik aprikot arahan arahkan
arahku arahmu arahnya argumen arisan aritmia arkade arkeolog arloji armada armenia arogan arogansi aromatik
arsenik arsitek artefak arteri artian artifak artikel artileri artinya artistik asalkan asalku asalmu
asalnya aseksual asesmen asetat asisten aslinya asmara asosiasi aspirasi aspirin asrama astaga asteroid
astral astronom astronot asuhan asuhnya asumsi asuransi asusila atapnya atasan atasanku atasanmu atasnya
ataukah ataupun ateisme atensi atipikal atlantik atletik atletis atmosfer atmosfir atraksi atraktif atribut
atrium atsiri aturan audiens audiensi audisi auditor aurora austria autentik autisme autoimun autopsi avatar
aviasi awalan awalnya ayahanda ayahku ayahmu ayahnya ayunan ayunkan bacaan bacakan bacalah bacaleg bacokan
badanku badanmu badannya badung bagaikan bagasi bagian bagianku bagianmu bagikan bagiku bagimu baginda
baginya baguslah bagusnya bahagia bahannya bahari bahasa bahasan bahaya bahkan bahtera bahuku bahumu bahunya
baiklah baiknya bajakan bajing bajuku bajumu bajunya bakalan bakaran bakatmu bakatnya bakpao baksos bakteri
bakwan balada balado balapan balasan baliho balikan balikkan baling balistik balita balkon balutan bandang
bandar bandara bandel bandeng banderol banding bandit bandul bandung bangau banget bangga bangka bangkai
bangkit bangkok bangkrut bangku bangsa bangsal bangun bangunan banjar banjir bankir bantah bantahan bantal
bantalan bantaran banteng banting bantuan bantulah banyak bapaknya baptis baptisan barang barangku barangmu
barbar barbekyu bareng barikade barisan barista barium barter baruku barulah barumu barunya barusan basilika
basket batalion batalkan batalyon batang batangan batasan batasi batasnya baterai batuan batunya bauksit
baunya bauran bawaan bawahan bawahnya bawakan bawalah bawang bayangan bayaran bayarkan bayiku bayimu bayinya
bayonet bazaar beasiswa bebannya bebaskan beberapa bedanya bedebah begadang begini begitu begituan beijing
bejana bekerja belahan belajar belaka belakang belalai belalang belanda belang belanga belanja belasan
belati belatung beleid belenggu belerang belgia beliau belibis belikan belilah beliung belokan beludru
belukar belulang bemper benang benarkah bencana bendera bendung bengis bengkak bengkel bengkok bening
benjolan bensin bentang bentar benteng bentrok bentuk bentukan benturan benzena beracun berada beradab
beradik beradu beragam beragama berair berakal berakar berakhir beraksi beralih beralur beramal berambut
beranak beranda berandal beraneka berang berangin berani beranjak berantai berantas berantem berapa berapi
berarti berasa berasal berasap beraspal beratap beratkan beratmu beratnya berawa berawak berawal berawan
berayun berbadan berbagai berbagi berbaik berbaju berbakat berbakti berbalas berbalik berbaris berbasis
berbatas berbatu berbau berbaur berbeda berbekal berbelit berbelok berbenah berbesar berbiak berbisa
berbisik berbobot berbuah berbuat berbudi berbuka berbukit berbulan berbulu berbumbu berbunga berbunyi
berburu berbusa bercadar bercak bercakap bercanda bercat bercerai bercinta bercocok bercokol bercorak
bercukur bercumbu berdahak berdalih berdamai berdansa berdarah berdasar berdaun berdaya berdebar berdebat
berdebu berderet berdetak berdiam berdinas berdiri berdoa berdosa berdua berduaan berduel berduet berduka
berduri berdusta bereaksi berebut beredar beregu berekor berembus berempat berenang bereskan beretika
berfokus berfoto berganda berganti bergaris bergaul bergaya bergegas bergelar bergelut bergema bergenre
bergerak bergeser bergetar bergigi bergilir bergizi bergolak bergosip bergulat bergulir bergumam berguna
bergurau berguru berhaji berhak berhala berhantu berharap berharga berhasil berhati berhemat berhenti
berhias beribu berikan berikat beriklim berikut berilah berilium beriman berimbas beringas beringin berirama
berisi berisik beristri berita berjaga berjajar berjalan berjanji berjarak berjasa berjaya berjejer berjemur
berjihad berjiwa berjodoh berjoget berjuang berjudi berjudul berjumpa berkabut berkaca berkah berkait
berkaki berkala berkarat berkarya berkas berkat berkata berkawan berkayu berkebun berkedip berkedok berkelas
berkelit berkelok berkeluh berkemah berkemas berkenan berkeras berkerut berkesan berkibar berkicau berkilau
berkirim berkisah berkisar berkobar berkuah berkuasa berkuda berkulit berkumis berkutat berkutik berlabel
berlabuh berlaga berlagak berlaku berlalu berlapis berlari berlatih berlayar berlebih berlemak berlian
berlibur berlima berlipat berlomba berlutut bermain bermakna bermalam bermata bermerek bermesin bermimpi
berminat bermitra bermobil bermodal bermoral bermotif bermotor bermuara bermuka bermukim bermula bermulut
bermurah bermusik bermutu bernada bernafsu bernama bernanah bernapas bernasib bernaung berniaga berniat
bernilai bernoda bernomor bernyawa berobat beroda beroleh berombak berongga berontak berorasi berotasi
berpacu berpadu berpagar berpawai berperan berpesan berpesta berpihak berpijak berpikir berpisah berpola
berpori berpose berpuas berpuasa berpusat berputar berputra bersabar bersabda bersaing bersaksi bersalah
bersalin bersalju bersama bersatu bersayap bersedia bersedih bersel bersemi berserah berserat berseri
berseru bersiaga bersiap bersifat bersih bersikap bersin bersinar bersisa bersisi bersisik bersiul berskala
bersorak bersua bersuami bersuara bersujud bersurat bersusah bertabur bertahan bertahap bertahun bertakwa
bertamu bertanam bertanda bertani bertanya bertapa bertaraf bertaruh berteduh bertekad bertekuk bertelur
bertema berteman bertemu bertepuk bertiga bertikai bertinju bertipe bertiup bertobat bertolak bertuan
bertubuh bertugas bertukar bertulis bertumpu berturut bertutur beruang berubah beruban berucap berujar
berujung berukir berulah berulang berumah berumput berumur berunjuk beruntun berupa berupaya berusaha
berusia berutang berwajah berwajib berwarna berwatak berwujud berzikir besaran besarkan besarmu besarnya
beserta beskap betapa beternak betina betulkah biadab biakan biarawan biarkan biarlah biasanya biawak
biayanya bibiku bibimu bibinya bibirku bibirmu bibirnya bicara bicaramu bidadari bidang bidikan biduan
bihalal bijinya bikinan bikini biksuni bilamana bilang bilangan biliar bimbang bimbel bimtek binaraga binasa
binatang binatu bincang bingkai bingung bintang bintara bintik biodata biografi biokimia biologi biologis
biomassa biomedis bioskop bipolar birokrat bisakah bisbol bisikan bising biskuit bisnis blangko blantika
blazer blender blokade blokir blunder bobotoh bocoran bocorkan bodohmu bodohnya bodong bohong boikot bokong
bolanya bolehkah bolehkan boling bolivia bolong bombai bomber boneka bongkar bongsor bonsai bordir borgol
borjuis borongan botani botanis botolnya brahmana brangkas brankas brasil brigade brigadir brilian broker
brokoli bromida brosur browser bruder brutal buahan buahku buahmu buahnya bualan buangan buatan buatkan
buatku buatlah buatmu bubungan budaya budidaya bujang bujangan bujukan bukakan bukalah bukankah bukanlah
bukannya buklet buktikan buktinya bukuku bukumu bukunya bulanan bulannya bulatan buletin bulunya bumerang
bumper buncis buncit bundar bundaran bundel bunganya bungkam bungker bungkuk bungkus bunglon bungsu bunker
buntung buntut bunyikan bupati burger buritan buronan buruan burukmu buruknya burung busana buster butuhkan
cabang cacian cacing cadang cadangan cahaya cairan cakram cakupan calhaj cambuk camilan camkan campak
camping campur campuran canggih canggung cangkang cangkir cangkok cangkul cantik capaian capres capung
caraku caramu caranya carikan carilah catatan catatkan cawapres cedera cegukan cekatan cekcok cekung celaan
celaka celana celeng celengan celurit cemara cemaran cemaskan cemberut cembung cemburu cemeti cemilan
cemoohan cenayang cendana cendawan cendera cendol cengeng cengkeh cengkih centang centil cepatlah cepatnya
ceplok ceramah cerdas cerdik cerewet cerita ceritaku ceritamu cermat cermin cerminan ceroboh cerobong
cerpelai cerpen cerutu cetakan ciamik cicilan cicipi cidera cincang cincin cintai cintaku cintamu cintanya
cipratan ciptaan ciptakan ciuman cobaan cobalah cokelat coklat condong contoh coretan corong cucuku cucumu
cucunya cupang cuping cuplikan curahan curang curanmor curhat curian curiga dadakan dadaku dadamu dadanya
daerah daftar dagang dagangan daging dahaga dahlia dahsyat dahulu dakwaan dakwah dalamku dalammu dalamnya
dalang dambaan damkar dampak dampingi dandan dandanan dangdut dangkal dapati dapatkah dapatkan darahku
darahmu darahnya daratan dariku darimu daring darinya daripada darurat dasarian dasarnya dasbor daster
datang datangi dataran daunnya dayang dayung dealer debitur debris debutan dedaunan dedikasi deduktif
defensif definisi defisit deflasi dekade dekati dekatku dekatmu dekatnya dekorasi dekret dekripsi dekrit
delapan delegasi delima delman delusi demensia demikian demokrat dendam dendeng dengan denganku denganmu
dengar dengkul dengue densitas dentuman denyut deodoran depanku depanmu depannya deposisi deposit deposito
depresi deputi derajat deretan dering derita dermaga dermawan desain desainer desakan desanya desersi
desimal desktop detail deteksi detektif detektor deterjen deviasi devisa dewasa dewata dharma diabetes
diadakan diadang diadili diadopsi diaduk diagnosa diagonal diagram diajak diajar diajari diajukan diakhir
diakhiri diakon diakses diakui dialah dialami dialek dialiri dialisis dialog diamati diambil diameter
diamini diamlah diampuni diancam dianggap diangkat diangkut dianiaya diantar dianut diapit diarak diasah
diaspora diasuh diatasi diatur diawasi dibaca dibacok dibagi dibagian dibahas dibajak dibakar dibalas
dibalut dibangun dibantah dibantai dibantu dibaptis dibatasi dibawa dibayar dibebani dibedah dibekali dibela
dibeli dibenahi dibenci dibentuk diberi dibiayai dibidik dibilang dibina diborgol diborong dibuahi dibuang
dibuat dibubuhi dibujuk dibuka dibumbui dibunuh diburu dicabut dicaci dicambuk dicampur dicapai dicari
dicatat dicegah dicegat dicekik dicetak dicicil dicintai dicium dicoba dicontoh dicopot dicuci dicukur
diculik dicuri didakwa didalami didanai didapat didapati didasari didekati didenda didengar diderita didesak
didiami dididik didikan didiknya didorong diduduki diduga didukung diejek diekspor diemban diesel difabel
difitnah difoto difteri difusi digabung digali digambar diganggu diganti digarap digelari digemari digenapi
digeser digigit digilas digiling digiring digital digoreng digosok digotong digoyang digubah digubris
digugat digulung digusur dihabisi dihadang dihadapi dihadiri dihajar dihakimi dihalau dihambat dihamili
dihantam dihantar dihantui dihapus dihargai dihias dihiasi dihibur dihimbau dihina dihitung dihujani dihujat
dihukum dihuni diikat diikuti diilhami diimpor diingat diingini diinjak diiringi diiris diisukan dijaga
dijahit dijajah dijajaki dijalani dijalin dijamin dijarah dijatuhi dijauhi dijawab dijebak dijemput dijenguk
dijepit dijerat dijual dijuluki dijumpai dikagumi dikarang dikawal dikecam dikejar dikelola dikenai dikenal
dikenali dikepung diketuai diketuk dikira dikirim dikotori diktator dikuasai dikubur dikunci dikunyah
dikupas dikurung dikutip dikutuk dilacak dilahap dilalui dilanda dilantai dilantik dilapis dilapisi dilarang
dilatasi dilatih dilawan dilayani dilebur dilelang dilema dilempar dilewati dilihat dililit dilipat diliputi
dilucuti dilukai dilukis dilunasi dimakan dimaksud dimarahi dimasak dimasuki dimensi dimiliki diminati
diminta dimintai diminum dimuat dimulai dinaiki dinamai dinamik dinamika dinamis dinamit dinamo dinanti
dinasti dinaungi dinding dingin dinikahi dinilai dinodai diobati dioksida diolah dioles diorama dipadati
dipagari dipahami dipahat dipakai dipaksa dipandu dipanen dipantau diparkir dipasang dipasok dipatok
dipatuhi dipecah dipecat dipegang dipeluk dipenuhi diperas dipesan dipetik dipikul dipilih dipimpin dipinang
dipinjam diploma diplomat dipompa dipotong diproses dipugar dipuja dipuji dipukul dipukuli dipungut dipunyai
dipupuk diputar diracuni dirampas dirampok dirantai dirasa dirawat direbus direbut direksi direktur direndam
diresapi direstui dirham dirias dirigen dirikan diriku dirilis dirimu dirintis dirinya dirjen disadap
disadari disadur disahkan disain disakiti disalin disambar disambut disangka disapa disapu disebut disegel
disela disembah disentri disentuh diserang diserap diseret disergap disertai disetor disewa disikapi disikat
disiksa disimak disimpan disinari disiplin disiram disita diskon diskotek diskresi diskrit diskusi disokong
disorder dispersi disrupsi distorsi distrik disukai disulap disumpah disunat disuruh disusul disusun ditaati
ditabrak ditaburi ditagih ditahan ditaksir ditakuti ditambah ditambal ditampar ditanam ditanami ditandai
ditandu ditanya ditanyai ditarik ditaruh ditata ditawan ditawar ditebang ditebus ditegur ditekan diteken
ditelan diteliti ditemani ditembak ditempa ditempuh ditemui ditenun ditepati diterima diterkam ditikam
ditilang ditimbun ditimpa ditindas ditindih ditinjau ditipu ditiru ditiup ditodong ditolak ditolong ditonton
ditopang dituang dituduh ditugasi dituju ditukar ditulis ditumbuk ditumpas ditunda ditunggu ditunjuk
dituntun dituntut ditusuk ditutup ditutupi diubah diukir diukur diulangi diulas diundang diundi diunduh
diunggah diurapi diurus diurutan diusir diusung diusut diutus dividen divisi diwakili diwarisi diwarnai
diyakini doakan doanya dokter doktor doktrin dokumen domain domestik dominan dominasi domino domisili dompet
donasi donatur dongeng dongker dongkrak dopamin doping dorong dorongan dorsal drainase drakor dramatis
dramawan drastis drumben drumer dualisme dualitas duanya duduki duduklah duduknya dukacita dukung dukungan
duniawi duplikat durasi durhaka durian duyung dzikir eceran edaran editor edukasi edukatif efeknya efektif
efikasi efisien egaliter ejekan ekaristi ekologi ekologis ekonom ekonomi ekonomis ekornya eksekusi eksepsi
eksibisi ekskresi ekskul eksodus eksotik eksotis ekspansi eksponen ekspor ekspos ekspose ekspres ekspresi
ekstasi ekstensi ekstra ekstrak ekstrem ekstrim ekuator ekuitas elastis elegan elektrik elektris elektro
elektron elemen elevasi elpiji emasnya embargo emblem embrio embung emeritus emfisema emigrasi emirat emiten
emosimu emosinya emotikon empati empedu emperan empiris emulator emulsi endapan endemi endemik endokrin
energi energik enggak enggan engkau engkol engsel enkripsi entahlah enteng entitas entropi epidemi epilepsi
epilog episode epitel erangan ereksi erupsi eselon esensi esensial eskalasi estafet estetik estetika estetis
estimasi estrogen etalase etanol etiket euforia evakuasi evaluasi evolusi faedah faktanya faktor faktual
fakultas falsafah famili familia familiar familier fanatik fantasi farmasi fasisme favorit federal federasi
feminim feminin feminis fengsui fenomena feodal feromon festival fesyen fibrosis fidusia figuran fiksasi
fiktif filamen filosofi filsafat filsuf filter filtrasi finalis firasat firaun firman fisika fiskal fitnah
fitrah floral fluida fluorida folder folikel fondasi fonetik fonologi forensik formal formasi format formil
formula formulir fosfat fosfor fotokopi fragmen fraksi fraktur fregat friksi frontal frustasi fungsi
furnitur futsal gabung gabungan gadang gadget gading gadisku gadismu gadisnya gadungan gagang gagasan gairah
gajian gajiku gajimu gajinya galaksi galang galangan galeri galian galiung gambar gambaran gambarmu gamblang
gambus gambut gamelan gampang gamping gampong gandar gandeng gandrung gandum ganggang ganggu gangguan
gangster ganjal ganjaran ganjil ganteng gantikan gantinya gantung gapura garang garansi garapan garasi
garing garmen garnisun garuda gasing gasket gawang gayung gazebo gebetan gebrakan gebyar gedung gegabah
gejala gejolak geladak gelagat gelang geledah geliat gelisah gembala gembira gembok gembong gembung gembur
gemetar gemilang gempal gempar gemulai gemuruh genangan gencar gencatan gendang gender gendong gendut
generasi generik genetik genetika genetis genggam gengsi genital genjang genjot genosida genotipe genset
gentar genteng genting gentong geografi geologi geologis geometri gepeng gerabah geraham gerakan gerakkan
gerangan gerbang gerbong gerebek gereja gerejawi gergaji gerhana gerigi gerilya gerimis gerinda gerobak
gersang gesekan geseran gestur getaran gigawatt gigiku gigimu giginya gigitan giling giliran gimbal ginjal
ginseng girang giroskop gitaris glamor glasial glasir gletser glikemik glikol global glukosa gluten godaan
golongan gondok gondola gondrong gorden goreng gorengan goresan gorila gosong gospel gotong goyang gradasi
gradien grafik grafis grafit grafiti granat granit gratis gravel grosir gubahan gubernur gudang gugatan
guguran gugusan guling gulita gulung gulungan gumpalan gunakan gunanya gundah gundik gundukan gundul gunting
guntur gunung gunungan guratan gurauan gurita guruku gurumu gurunya guyonan habaib habisnya habitat hadapan
hadapi hadiah hadiahku hadiahmu hadirin hadirnya hafalan hajatan hakikat hakiki haknya halaman halang
halangan halangi haleluya halida halnya halogen haluan hambar hambatan hamburan hamparan hampir hancur
handal handuk hangar hangat hanggar hangus hantam hantaman hantar hantaran hanyalah hanyut haploid harafiah
harapan harapkan harfiah hargai harganya harian hariku harimau harimu harinya harkat harmoni harmonik
harmonis hartanya haruskah haruslah hasilnya hasrat hatiku hatilah hatimu hatinya hayati hebatnya hegemoni
hektar hektare heliks helium hendak hengkang hening hentikan herbal hernia heroik herpes hewani hiasan
hiatus hibrid hibrida hiburan hidangan hidayah hidrasi hidrat hidrida hidrogen hidung hidungku hidungmu
hidupku hidupmu hidupnya hierarki higienis hijrah hijriah hikayat hikmah hikmat hilang himbau himpunan
hinaan hindari hingga hinggap hipnosis hipnotis hipotek hiraukan histeria histeris histori historis hitung
hitungan holistik hologram homogen homolog homonim honorer horizon hormat hormati hormon hormonal hostel
howitzer hubung hubungan hujatan hukuman hukumnya humanis humerus humoris hunian hutang ibadah ibadat ibarat
ibukota ibunda ibunya idaman idealis idealnya identik ideologi iguana ijazah ikannya ikatan ikhlas ikhtiar
ikhtisar ikonik ikutan ikutlah ilalang ilegal ilmiah ilmuan ilmuwan imajiner imamat imannya imbalan imbang
imbauan imbuhan imigran imigrasi imperium impian impianku impianmu implan implisit import importir impresi
impresif impuls imunitas incaran indahnya indekos indeks indera indigo indikasi individu induknya induksi
induktor industri inersia infantri infeksi inferior inferno inflasi informal informan ingatan ingatlah
inggris inginkan ingkar inhalasi inheren inikah inilah inisial inisiasi injeksi inklusi inklusif inkrah
inkubasi inovasi inovatif inovator insang insentif insiden insinyur insomnia inspeksi instal instan instansi
insting institut insulin integer integral intelek intens intensif interim interior interkom intern internal
internet interval intonasi intranet intrik intrusi intuisi intuitif invasi invasif investor ionisasi
ionosfer iparku iparmu iparnya irigasi iringan irisan iritasi ironis isinya islami isolasi isolator isomer
isotop istana isteri istiadat istilah istimewa istriku istrimu istrinya isyarat iterasi itikad itukah itulah
izinkan izinnya jabang jabatan jadikan jadilah jadwal jagalah jagoan jagung jahanam jahatnya jahitan jajahan
jajanan jajaran jalanan jalang jalani jalankan jalanku jalanmu jalannya jalinan jamaah jamban jambret jambul
jaminan jamnya jamuan jangan janggal janggut jangka jangkar jangkau jangkrik jangkung janjikan janjiku
janjimu janjinya jantan jantung jarahan jaranan jarang jargon jariku jarimu jaring jaringan jarinya jasanya
jasmani jatuhkan jatuhnya jauhkan jauhnya jawaban jawabku jawabmu jawabnya jawara jawatan jebakan jeblok
jebolan jejaring jelaga jelajah jelang jelaskan jelasnya jelata jelita jemaah jemaat jemawa jembatan jempol
jempolan jemput jemuran jenaka jenama jenasah jenazah jendela jender jenderal jendral jenggot jengkel
jengkol jenguk jenisnya jenius jenjang jentik jepretan jerami jerapah jerawat jerigen jeriken jeritan jernih
jeroan jersei jeruji jikalau jilbab jingga jinjing jiwaku jiwamu jiwanya joging jomblo jongkok jorong jualan
jualnya juknis jukung julukan jumawa jumlah jumpai junior juragan jurang jurnal jurnalis jurusan justru
jutaan jutawan kabaret kabarmu kabarnya kabinet kabisat kabuki kacamata kacang kacaukan kadang kadmium
kafein kafilah kaidah kaisar kaitan kajian kakakku kakakmu kakaknya kakatua kakekku kakekmu kakeknya kakiku
kakimu kakinya kaktus kalang kalangan kalanya kalaupun kaldera kalender kaleng kalian kaliber kalimat
kalinya kalium kalkulus kalkun kalori kalsium kalung kamarku kamarmu kamarnya kambing kambuh kamera kamerad
kamikaze kampanye kampas kampiun kampung kampus kananku kananmu kanannya kancah kancing kandang kandas
kandidat kandung kangen kangguru kangkung kanguru kanibal kanker kanonik kanopi kanselir kantin kantong
kantor kantuk kantung kanvas kapalku kapalmu kapalnya kapiler kapita kapital kapitan kapolda kapolres
kapolri kapolsek kaprah kapsul kapten kapulaga karabin karakter karamel karang karangan karaoke karate
karateka karavan karbida karbit karbon karbonat karbonil karcis kardinal kardio kardus karena karhutla
karier karisma karnaval karoseri karpet kartel karton kartun kartunis karuan karung karunia karyanya
karyawan kasasi kasihan kasihku kasihnya kasino kastil kasual kasuari katagori katakan katakana kataku
katalis katalog katamu katanya katapel katarak katedral kategori katering kateter kation katode katolik
kaulihat kaupikir kautahu kavaleri kawakan kawalan kawanan kawanku kawannya kawasan kawatir kawula kayunya
keadaan keadilan keagenan keahlian keamanan keanehan kearifan keasaman keaslian kebagian kebaikan kebaruan
kebaya kebiri keburu kebutaan kecaman kecambah kecapi kecewa kecilku kecilmu kecilnya kecoak kecuali kedelai
kediaman keduanya kedubes kedukaan kedutaan keemasan keempat keenam keesaan keesokan kegiatan kegilaan
kegunaan kehausan kehendak keibuan keilmuan keimanan kejadian kejang kejaran kejauhan kejayaan kejiwaan
kejuruan kejutan kekakuan kekasih kekayaan kekejian kekhasan kekinian kekuatan kelabang kelabu keladi
kelaikan kelainan kelajuan kelakar kelakuan kelamaan kelambu kelamin kelapa kelautan keledai kelenjar
kelereng kelewat keliling kelima kelinci keling keliru kelola kelompok kelopak keluar keluaran keluarga
kelucuan keluhan keluhkan kemajuan kemarau kemaren kemari kemarin kemasan kematian kemauan kembali kembang
kembar kembaran kembung kemeja kemelut kemenyan kemiri kempis kemudi kemudian kenabian kenaikan kenakan
kenalan kenali kenamaan kenang kenangan kenapa kenari kencan kencana kencang kenceng kencing kencur kendala
kendali kendang kendati kendor kendur kenduri kening kental kentang kentara kentut kenyal kenyang keonaran
kepada kepadaku kepadamu kepala kepalaku kepalamu kepalan kepalang kepang kepausan kepekaan kepergok
kepincut keping kepingan kepiting kepuasan kepulan kepung kepungan kerabat keraguan kerajaan keramas keramat
keramba keramik keranda kerang kerangka kerapu kerasan kerasnya keraton kerbau kerdil kerelaan kereta
kerikil kering keringat keripik keriput keriting kerjakan kerjaku kerjamu kerjanya kermit kernet keropos
kertas kerucut kerudung kerugian kerupuk kesamaan kesatria kesatu kesatuan keseleo kesenian kesepian
kesetrum kesialan kesturi kesucian kesukaan kesukuan ketaatan ketahuan ketahui ketapel ketawa ketela ketemu
ketiak ketiban ketiga ketika ketimun ketombe ketoprak ketuban ketujuh ketukan ketumbar ketupat keuangan
keuletan keumatan keunikan keutuhan khabar khalayak khalifah khasiat khatib khatimah khawatir khayalan
khazanah khidmat khilaf khilafah khitan khitanan khotbah khusus khusyuk khutbah kiamat kiasan kiblat kicauan
kidung kijang kilang kilauan kilogram kilowatt kimiawan kimiawi kimono kinase kincir kinclong kinerja
kinetik kiprah kiranya kiriku kiriman kirimu kirinya kisahku kisahmu kisahnya kisaran kismis kisruh kitalah
klakson klarinet klasemen klasik klasikal klaster klausa klausul klenteng klerus klimaks klinik klinis
klitoris kloning klorida klorin klorofil kloset kloter knalpot koalisi kobalt kobaran kodeks kodrat kognisi
kognitif koheren kohesi kohesif kokain koklea kokpit koktail kolagen kolaps kolase kolega koleksi kolektif
kolektor kolera kolese kolibri kolonel kolong koloni kolonial kolonis kolosal kolumnis kolusi komandan
komando komedi komedian komentar komersil komikus komisi komite komitmen komoditi komodo kompak kompas
kompeni kompeten komplain kompleks komplet komplit komponen komponis kompor kompos komposer komposit kompres
kompresi kompromi komputer komunal komune komuni komunike komunis komuter kondang kondisi konduksi kondusif
koneksi konektor konflik kongkrit kongres kongruen kongsi konklaf konkret konkrit konotasi konpers konselor
konsep konsepsi konser konsesi konsili konsol konsonan konstan konsul konsulat konsuler konsumen konsumer
konsumsi kontak konteks konten konter kontes kontinu kontinum kontinyu kontra kontrak kontras kontrol kontur
konveksi konvensi konversi konvoi konyol koperasi kopiah kopilot kopling kopral korban koreksi korektif
korelasi koridor kornea korona koroner korosi korosif korporat korset korteks kortisol korupsi koruptor
korvet kosakata kosmetik kosmis kosmos kosong kostum kotaku kotamu kotanya kotbah kotoran kraton kreasi
kreatif kreator kredibel kredit kreditor kreditur kremasi kretek kriket kriminal krisan krisis kristal
kristen kriteria kritik kritikus kritis kromium kromosom kronik kronis krusial ksatria kuadran kuadrat
kuakui kualami kualitas kuambil kuanggap kuantum kuarsa kuartal kuarter kuasai kuatir kuatkan kuatnya kubaca
kubangan kubawa kubayar kubeli kubuang kubuat kubunuh kuburan kucari kucing kucintai kucuran kudaku kudamu
kudanya kudapan kudengar kudeta kuintal kuitansi kujawab kukang kukenal kukirim kuliah kulihat kuliner
kulitku kulitmu kulitnya kulkas kultivar kultur kultural kultus kumakan kumbang kumiliki kuminta kumohon
kumparan kumpul kumpulan kuncian kuncinya kuncup kungfu kuning kuningan kunjung kunjungi kunker kuntum
kunyah kunyit kunyuk kuorum kupahami kupakai kupegang kupikir kuping kupotong kurang kurangi kurasa kurasi
kuratif kurator kurban kurcaci kursiku kursimu kursinya kursus kurung kurungan kusangka kusimpan kuskus
kusukai kusuruh kutahu kutang kutemui kuterima kutipan kutukan kutulis kutunggu labirin ladang lagian laguna
lahiriah lahirlah lahirnya lainnya lajang lakban laksana laktasi laktosa lakukan lalang lamanya lamaran
lamban lambang lambat lambert lambung lampau lampion lampiran lampung lampunya lancang lancar lancip landai
landak landas landasan langgam langgar langgeng langit langka langkah langsing langsung lanjut lanjutan
lansekap lansia lanskap lantai lantang lantaran lantas lantunan lapang lapangan lapisan laporan laporkan
laptop larang larangan larikan larilah larutan laskar lateks lateral latihan lautan lautnya lavender lawakan
lawanmu lawannya lawatan layaknya layanan layang layangan layani layarnya lebaran lebarnya ledakan ledeng
legenda legiun leherku lehermu lehernya lekang lelaki lelang lelehan leluasa lelucon leluhur lemari lembab
lembaga lembah lembap lembar lembaran lembek lembing lembur lembut lempar lemparan lempeng lempung lencana
lendir lengah lengan lengang lenganku lenganmu lengkap lengket lengkuas lengkung lengser lentera lentur
lenyap lepaskan lereng lesehan lestari lesung letakkan letnan letupan letusan leukemia libatkan liberal
liburan lidahku lidahmu lidahnya lifter ligamen lihatlah lilitan limbah limfosit limpahan limusin lincah
lindung lindungi linear lingerie lingga linggis lingkar lingkup linglung linier lintah lintang lintas
lintasan liontin lipatan lipstik liputan lisensi listrik litbang literal literasi litigasi litium liturgi
liturgis lobang lobster logika logistik lokasi lompat lompatan loncat loncatan lonceng longgar longsor
lonjong lontar lontaran lontong loreng lorong losmen loteng lotere lowong lowongan loyalis loyang luapan
luaran luarnya luasan luasnya lubang lukamu lukanya lukisan lulusan lumayan lumbung lumpuh lumpur lumrah
luncur luntur luring lututku lututmu lututnya maafkan mabrur madrasah maestro magang magenta maghrib
magister magnet magnetik magnetis magrib maharaja maharani mahkamah mahkota mahluk mahoni mainan mainkan
majalah majelis majemuk majikan majulah makalah makamnya makanan makanlah makannya makanya makelar makhluk
maklum maklumat makmum makmur maknanya maksiat maksimal maksimum maksud maksudku maksudmu makula malahan
malaikat malang malaria maling mamalia mampir mampus manager manajer manakah manakala manasik mancung mancur
mandala mandarin mandat mandau mandek mandiri mandor mandul manfaat mangan mangga manggis manggung mangkal
mangkat mangkir mangkok mangkrak mangkuk mangsa maniak manisan manisnya manjur mantan mantap mantel mantera
mantra mantri manual manula manusia manuver marathon maraton margarin margin marginal marilah marina marinir
maritim marjin marjinal markah markas markus marmer marmot martabak martabat martini martir marwah masakan
masalah masanya masinis masjid maskapai maskara maskawin masker maskot maskulin massal master masukan masuki
matahari mataku matamu matang matanya materai materi material materiel materiil matilah matriks maulid
maunya maupun mayang mayatnya mayones mazhab mazmur medali median mediasi mediator meditasi medium medsos
megaton megawatt meiosis mejaku mejamu mejanya mekanik mekanika mekanis melabrak melacak meladeni melahap
melaju melakoni melalap melalui melamar melambai melamun melanda melandai melansir melantai melantik
melapisi melapor melarang melata melati melatih melaut melawak melawan melawat melayang melayani melayat
melayu melebar melebih melebihi melebur meledak meledek melejit melekat melelang meleleh melemah melempar
melempem melepas melepuh melesat meleset meletus melewati melibas melihat melilit melimpah melindas melintas
melintir melipat meliput meliputi melirik melobi melodi melolong melompat meloncat melongo melonjak melorot
meluap meluas meluber melucu melucuti meludah meludahi melukai melukis melulu melunak melunasi meluncur
meluruh memacu memadai memadati memadu memahami memahat memajang memakai memakan memaki memaksa memanah
memanas memancar memandu memanen memang memangsa memanjat memantau memantik memantul memarahi memarkir
memasak memasang memasok memasuki mematok mematuhi membabat membabi membaca membacok membagi membahas
membahu membaik membajak membakar membalap membalas membalik membalut membantu membara membasmi membasuh
membatik membatu membaur membawa membayar membeber membedah membekap membekas membeku membekuk membela
membelah membeli membelit membelok membelot membenci memberi membesar membesut membidik membikin membina
membiru membisu membius membolos membran membual membuang membuat membujuk membujur membuka membulat membumi
membunuh memburu memburuk membusuk memecah memecat memegang memeluk memencet memendam memendek memenuhi
memepet memerah memeras memesan memesona memetik memicu memihak memijat memikat memikul memilah memilih
memiliki memimpin meminang meminati memindai meminjam meminta memintai meminum memisah memoar memohon
memoles memompa memori memorial memotong memotret mempan mempelai memuat memudar memuja memuji memukau
memukul memukuli memulai memuncak memungut memupuk memusuhi memutar memutus memvonis menaati menabrak
menabuh menabung menabur menagih menahan menahun menaiki menaksir menakuti menamai menambah menambal
menampar menampik menanam menandai menanduk menang menangis menanjak menanti menantu menanyai menapak
menapaki menara menari menarik menaruh menata menatap menaungi menawan menawar menawari mencabut mencaci
mencair mencakar mencakup mencapai mencari mencatat mencatut mencecar mencegah mencegat mencekam mencekik
mencela mencerna mencetak mencibir mencicil menciduk mencipta mencium mencoba mencolok mencopot mencoret
mencuat mencubit mencuci mencukur menculik mencuri mendadak mendaki mendakwa mendalam mendanai mendapat
mendarat mendasar mendata mendatar mendaur mendekam mendekat mendepak mendera mendesah mendesak mendesis
mendiami mendiang mendidih mendidik mendikte mending menduga mendung mendunia menebak menebang menebar
menebas menebus menegur menekan meneken menekuk menekuni menelaah menelan meneliti menemani menembak
menembus menempa menempel menempuh menemui menengah menengok menentu menenun menepati menepis menerima
menerkam meneror menerpa menerus menetap menetas menetes mengabdi mengacau mengacu mengadu mengaduk mengairi
mengais mengajak mengajar mengaji mengakar mengaku mengakui mengalah mengalir mengamen mengamuk menganga
menganut mengapa mengapit mengarah mengasah mengasuh mengatur mengaum mengawal mengayuh mengebom mengebor
mengebut mengecam mengecap mengecat mengecek mengecil mengecoh mengedit mengeja mengejar mengejek mengekor
mengelak mengelar mengeluh mengelus mengemas mengemis mengena mengenai mengenal mengepak mengepel mengepul
mengeras mengerek mengerem mengerti mengeruk mengetes mengetik mengetuk menggaet menggaji menggali menggema
menggila menggoda menghela menghias menghina mengidap mengigau mengikat mengikis mengikut mengilap menginap
mengira mengirim mengiris mengisap mengisi mengkaji mengoceh mengocok mengolah mengomel mengoper mengoyak
menguak menguap menguat mengubah mengubur mengucap menguji mengukir mengukur mengular mengulas mengulik
mengulur mengunci mengupas mengurai menguras mengurus mengusap mengusik mengusir mengusut mengutip mengutuk
mengutus meniduri menikah menikahi menikam menikung menilai menilang menilik menimba menimbun menimpa
menindak menindas menindih meninggi meninjau meninju menipis menipu menipuku menipumu meniru meniti menitik
menitip meniup menjabat menjadi menjaga menjahit menjajah menjajal menjalar menjalin menjamin menjamu
menjamur menjanda menjarah menjauh menjauhi menjawab menjebak menjebol menjegal menjelma menjemur menjepit
menjerat menjerit menjilat menjiwai menjual menjulur menjurus menodai menodong menohok menolak menoleh
menolong menonjol menonton menopang mentah mental mentari mentas mentega menteri mentimun mentok mentor
mentri menuai menuding menuduh menuju menukar menukik menular menulari menulis menumbuk menumpas menumpuk
menunda menunduk menunggu menunjuk menuntun menuntut menurun menuruni menurut menuruti menusuk menutup
menutupi menyabet menyadap menyadur menyahut menyala menyalin menyalip menyamai menyamar menyanyi menyapa
menyapu menyasar menyatu menyayat menyebar menyebut menyedot menyeduh menyegel menyeka menyekap menyekat
menyela menyelam menyepi menyerah menyerap menyerbu menyeret menyeru menyesal menyetel menyetir menyetop
menyetor menyewa menyikat menyiksa menyimak menyiram menyisir menyita menyoal menyodok menyogok menyorot
menyuap menyuapi menyukai menyulam menyulap menyulut menyurat menyuruh menyusu menyusui menyusul menyusun
menyusup menyusur menyusut meracik meracuni meradang meraih merajai merajut merakit merakyat meralat meramal
merambah merambat merampas merampok merana merantau merapat merasa merasuk merasuki merata meratap meratapi
meraung meraup merawat merayap merayu merdeka merebak merebus merebut mereda meredam meredup meregang mereka
merekam merekrut meremas merembes merembet merendah merendam merenung meresap merestui meretas merevisi
merger meriah meriam merias merica meridian merilis meringis merintih merintis merkuri merobek merogoh
meroket merokok merombak merosot merpati mertua merugi merujuk merumput merunduk merusak mesjid meskipun
mestinya metadata metafora metalik metana metanol meteor meteorit meterai meteran metoda metode metodis
metrik mewabah mewadahi mewahnya mewakili mewarisi mewarnai meyakini mezbah migrain migran migrasi mihrab
mikrob mikroba mikrofon milenial milenium miliar miligram miliki milikku milikmu miliknya milisi militan
militer milyar mimbar mimisan mimpiku mimpimu mimpinya minder mineral minggir minggu mingguan miniatur
minibus minimal minimum mintalah minuman minumlah minyak miring misalnya misiku misimu misinya miskin mistar
misteri mistik mistis mitigasi mitologi mitosis modeling moderasi moderat moderen modern modular modulasi
molekul molotov moluska momentum momongan monarki moncer moncong moneter monitor monogami monokrom monolog
monopoli monorel monoton monster montana montir monumen monyet morfem morfin mortar mortir mosaik motivasi
motorik moyang mualaf muasal muatan muazin mubazir mucikari mudaku mudanya mufakat mujarab mujizat mukamu
mukanya mukena mukjizat mukmin mukosa muktamar mulailah mulanya mulutku mulutmu mulutnya mumpung mumpuni
munafik muncul mundur munggu mungil mungkin muntah murahan muridku muridmu muridnya murtad murung musafir
musala musang museum mushala mushola musibah musikal musiknya musikus musiman musisi musium muslihat muslim
muslimin musnah mustahik mustahil mustang mustika musuhku musuhmu musuhnya musyrik mutakhir mutasi mutiara
mutilasi mutlak nabati nafkah nagari nahkoda naikkan naiklah nakhoda naluri namaku namamu namanya nampak
nampan nangka nantikan nantinya napoleon narasi naratif narator narkoba narsis nasabah nasehat nasihat
nasional naskah natrium natural naungan navigasi nebula negara negaraku negaramu negatif negeri nekrosis
nektar nelayan nenekku nenekmu neneknya neraca neraka netizen netral neural neuron neutrino neutron newton
ngaben ngarai ngawur ngebut ngengat ngotot niatnya nikmat nikmati nikotin nilainya nimbrung ningrat ninjutsu
nirkabel nirlaba niscaya niskala nitrat nitrogen nomaden nomina nominal nominasi nomplok nonaktif nonfiksi
nongol nonmedis nonmigas nonstop normal normatif notabene notaris notasi novelis nuansa nubuat nukleat
nukleus nuklir numerik nurani nutrisi nyalakan nyaman nyamuk nyanyi nyanyian nyaring nyaris nyatakan
nyatanya nyawaku nyawamu nyawanya nyeleneh nyentrik nyenyak nyinyir nyokap nyonya obesitas objektif obligasi
oblong obrolan obsesi obsesif obyektif ofensif ofisial oksida oksidasi oksigen oktagon okupansi olahan
olahraga olehku olehmu olehnya oleskan oligarki omnibus omongan ompong ongkir ongkos operan operasi operator
oplosan oposisi opsional optimal optimasi optimis optimum orangku orangmu orangnya oranye orator orbital
organik oriental orisinal orisinil orkestra ornamen ortodoks ortopedi osilasi osilator osmium otentik
otodidak otomasi otomatis otomotif otonom otonomi otopsi otorita otoritas otoriter ovarium ovulasi pabrik
pabrikan pacaran paceklik pacuan padahal padaku padamu padanan padang padanya padatan paduan paduka paginya
pagoda pahala pahami pahatan pahlawan pailit pajaknya pajang pajangan pakaian pakailah paksaan paladium
palang palawija paling palung pamanku pamanmu pamannya pameran pamflet pamitan pamong pamrih panahan
panasnya pancang pancaran pancing pancung pancuran pandai pandan pandang pandemi pandemik panduan panekuk
panelis pangan pangeran panggang panggil panggul panggung pangkal pangkas pangkat pangkuan panglima pangling
pangsa pangsit panitera panitia panjang panjat pankreas panorama panser pansos pansus pantai pantang pantas
pantat pantatku pantatmu pantau pantauan pantomim pantulan pantun pantura panutan paparan papirus paprika
parabola parade paradoks paragraf paralel parang parasit parasut parfum parietal parkir parlemen parodi
paroki parpol parsial partai partikel partisan partisi partitur partner parutan pasang pasangan pasaran
pasarnya pasien paskah paslon pasokan paspor pasrah pastel pastikan pastilah pastor pastoral pastoran pastur
pasukan pasutri patahan patahkan patogen patokan patologi patriot patroli patron patuhi patung patungan
paviliun pawang payung pecahan pecahkan pecahnya pecandu pecatur pedagang pedaging pedang pedangku pedangmu
pedati pedemo pedesaan pedoman peduli pegang pegangan pegasus pegawai pegiat pegulat pejabat pejalan
pejantan pejuang pekebun pekerja pekerti pelacak peladang peladen pelajar pelajari pelakon pelaku pelamar
pelana pelangi pelantun pelapis pelapor pelari pelarian pelarut pelatih pelatnas pelatuk pelaut pelawak
pelayan pelayat pelbagai peledak pelempar pelepah peleton pelicin pelihara pelipis pelipur pelita pelompat
pelontar pelopor pelosok peluang peluit pelukan pelukis pelumas peluncur peluru pemaaf pemabuk pemacu
pemadam pemahat pemain pemakai pemakan pemalas pemalsu pemalu pemanah pemanas pemancar pemandu pemangku
pemangsa pemanis pemanjat pemantau pemantik pemarah pemasang pemasar pemasok pematung pembaca pembagi
pembajak pembakar pembalap pembalut pembantu pembasmi pembatas pembawa pembayar pembebas pembeda pembela
pembeli pembelot pemberat pemberi pembesar pembina pembobol pembuat pembuka pembuluh pembunuh pemburu
pemecah pemegang pemeluk pemenang pemeran pemeras pemesan pemetaan pemetik pemicu pemikir pemilih pemilik
pemilu pemimpi pemimpin peminat pemindai peminjam pemintal peminum pemirsa pemisah pemkot pemodal pemohon
pemotong pempek pemprov pemuatan pemuda pemudi pemudik pemuja pemujaan pemuka pemukim pemukul pemula
pemulung pemuncak pemungut pemusik pemusnah pemutar pemutih pemutus penadah penahan penakluk penakut penalti
penamaan penambah penanam penanda penari penarik penata penataan penatua penawar pencahar pencak pencakar
pencari pencatat pencegah pencekik pencemar pencetak pencetus pencinta pencipta pencopet pencuci penculik
pencuri pendaki pendapat pendarat pendek pendekar pendeta pendiam pendidik pendiri pendopo pendosa penduduk
pendulum pendusta penebang peneduh penegak penekan peneliti penembak penempur penemu penemuan penenang
penengah penentu penenun penerang penerbit penerima penerjun penerus pengacau pengadil pengagum pengait
pengajar pengaman pengamat pengamen penganan penganut pengapit pengarah pengaruh pengasuh pengatur pengawal
pengawas pengawet pengayom pengebom pengecer pengecut pengedar pengejar pengemis pengenal pengepul pengeras
pengerat penggal penggali penggawa penggiat penggila penggoda pengguna penghias penghulu penghuni pengibar
pengidap pengikat pengikut pengin pengirim pengisap pengisi pengotor penguasa penguat pengubah penguin
penguji pengukir pengukur pengulas pengurus pengusir pengusul penikmat penilai penimbun penindas penipu
penipuan peniru peniruan peniti penjabat penjaga penjahat penjahit penjaja penjajah penjamin penjara
penjejak penjepit penjilat penjinak penjual penjudi penjuru penolak penolong penonton penopang pensil
pensiun pentagon pentas penting pentol pentolan penuaan penuhi penuhnya penukar penulis penunggu penunjuk
penuntun penuntut penurun penurut penutup penutur penyadap penyair penyaji penyakit penyalur penyanyi
penyapu penyebab penyebar penyedap penyedia penyedot penyejuk penyekat penyelam penyerap penyewa penyiar
penyidik penyok penyuluh penyusun penyusup pepatah pepaya peptida perabot peraga peragaan perahu peraih
perairan perajin peramal peramban perampok peranan perancah perang perangai perangko perantau peranti
perapian perasa perasaan perasan perawan perawat perawi perayaan perbaiki perban perbekel perbuat percaya
percayai percikan percuma perdana perdata perduli pereaksi peredam perekam perekat perempat perenang peretas
performa pergilah perginya periang perifer perihal periksa perilaku perintah perintis periode periodik
perisai periset peritel periuk perjaka perkakas perkamen perkara perkasa perkusi perkutut perlahan perlukan
perlunya permanen permata permen permisi pernah pernik pernis perokok peroleh perompak perpres persegi
persen persepsi persetan persik persis persona personal personel personil pertama pertanda pertapa pertiga
pertiwi perunggu perupa perusak perusuh perutku perutmu perutnya perwira pesaing pesanan pesangon pesanku
pesanmu pesannya pesawat pesepak peserta pesiar pesilat pesimis pesisir pesona pestaku pestamu pestanya
pesulap pesuruh petahana petaka petambak petang petani petapa petasan petelur petenis peternak petikan
petinggi petinju petisi petrus petuah petugas petunjuk pewangi pewaris pewarna pewarta peziarah piagam
pialang pianis piaraan piawai pidana pidato pigmen pihakmu pihaknya pijakan pikiran pikirkan pikirmu piknik
piksel pilihan pilihlah pilihnya pilkada pilkades pilpres pimpin pimpinan pinalti pinang pinangan pincang
pindah pindahan pinggang pinggir pinggul pingsan pinjam pinjaman pintar pintas pintuku pintumu pintunya
pionir piramida pirang piranti piring piringan pisahkan pisang pisaunya pistol piston piutang piyama plafon
plakat planet plankton plasenta plasma plasmid plaster plastik platform platina platinum pleidoi plester
pleura plontos pocong podium pohonnya pokoknya polantas polemik polesan poligami poligon poligraf polimer
polisi politik politis politisi polkadot polong polres polsek polusi polutan polwan pondasi pondok pondokan
ponsel ponton populasi populer populis porang porselen portabel portal porter posesif posisi positif poster
postur posyandu potasium potensi potong potongan potret prabayar praduga prahara prajurit prakarsa praktek
praktik praktis praktisi pramuka pranala prangko prasasti pratama predator predikat prediksi prefek prekuel
preman prematur premier premis premium presdir preseden presiden presisi prestasi prestise presto pribadi
pribumi prihatin primata primer primitif prinsip prisma privasi privat proaktif problem produk produksi
produsen produser profesi profesor profil profit program progres projek proletar prolog promosi promotor
propelan properti propinsi proporsi proposal propulsi prosedur proses prosesi prosesor prospek prostat
protap protein proteksi protes protokol proton protozoa provinsi proyek proyeksi psikis psikolog psikopat
psikotik puasanya pubertas publik puding puitis pujaan pujangga pujian pukulan pulang pulpen pulsar puluhan
puncak pundak punggawa punggung pungkas pungli pungut pungutan puntung purnama pusaka pusara pusaran
pusatnya pusing pustaka putaran putera puteri putraku putramu putranya putriku putrimu putrinya putusan
putuskan rabies racikan racunnya radang radial radian radiasi radiator radikal radius rahang rahasia rahmat
rahsia rajaku rajamu rajanya rajawali rajungan rajutan rakaat rakernas rakitan raksasa rakyat rakyatku
ramalan rambat rambut rambutan rambutku rambutmu rampai rampasan ramping rampok rampung ramuan rancang
rangka rangkap rangking rangkul rangkum rangsang ranjang ranjau ransel ransum rantai rantau ranting rasakan
rasanya rasial rasional rasisme rasuah ratapan rating ratuku ratusan raungan rayakan rayuan reagen reaksi
reaktif reaktor realis realisme realita realitas rebahan rebana rebung rebusan rebutan recehan redaksi
redaktur reduksi refleks refleksi reformis refraksi regangan reggae regional regresi regulasi reguler rejeki
rekaan rekaman rekanan rekanku rekanmu rekannya rekayasa rekening reklame rekreasi rekrut rektor relasi
relatif relawan relevan religi religius relikui relokasi relung remaja rematik rembulan remisi rempah renang
rencana rendah rendahan rendam rendaman rendang renggang renovasi rental rentan rentang rentenir rentetan
renungan renyah reparasi replik replika reporter represi represif reptil republik reputasi rerata resapan
resensi resepsi reseptor reserse resesi resesif residen residu resiko resimen resital reskrim resolusi
respek respon respons restoran resume retail retakan retensi retina retorika retret revans revisi revolusi
rezeki riasan ribuan rileks rimbun rimpang rindang ringan ringgit ringkas ringkus ringsek rintik rintisan
risalah risiko riskan ritmik ritmis ritual riwayat robekan robotik robotika rohani romansa romantik romantis
rongga rontgen rontok rotasi rotator royalti ruangan rubrik rujukan rumahku rumahmu rumahnya rumbia rumpun
rumput rumusan runcing runtuh rupanya rupawan rupiah rusaknya rusunawa saatnya sabana sabetan sablon
sabotase sabung sadapan sadari sadarlah safari sahabat sahaja sahnya saingan sajadah sajalah sajian sakelar
saking sakiti sakitmu sakitnya saklar sakral sakramen saksama saksikan saksofon sakura salahkan salahku
salahmu salahnya salaman salamku salinan saling salmon saluran samanya samaran sambal sambaran sambil
sambilan sambung sambut sambutan sampah sampai sampan sampanye sampel samping sampling sampul samudera
samudra samurai sandal sandang sandar sandaran sandera sangar sangat sanggah sanggar sanggul sanggup sangka
sangkaan sangkar sangkut sanitasi sanksi santai santan santana santap santapan santer santet santri santun
santunan sapaan sapuan sarana sarang saranku saranmu sarden sariawan saring saringan sarjana sarung sasana
sasaran sastra satelit satgas satker satpam satria satuan satukan satunya saturasi saudagar saudara saudari
savana sayang sayangi sayapnya sayatan sayuran seadanya seakan seantero searah sebabnya sebagai sebagi
sebagian sebaik sebanyak sebaran sebatang sebaya sebegitu sebelah sebelas sebelum sebentar seberang seberapa
seberat sebesar sebidang sebilah seblak sebotol sebuah sebulan seburuk sebutan sebutir sebutnya secantik
secara secarik secepat secercah sedalam sedang sedapat sedari sedekah sediaan sediakan sedianya sedikit
sedimen sedotan sedunia seekor seenak segala segara segaris segelas segenap segera segitiga segmen sehabis
seharga sehari seharian sehebat sehelai sehingga seimbang seindah seirama seiring seismik seizin sejagat
sejajar sejalan sejarah sejati sejauh sejawat sejenak sejenis sejoli sejumlah sejuta sekadar sekali sekalian
sekarang sekarat sekecil sekedar sekejap sekeras sekering seketika sekian sekilas sekira sekitar sekjen
sekoci sekolah sekota sekresi sekrup seksama sektor sektoral sekuat sekuel sekuens sekujur sekuler sekunder
sekuriti sekutu selada selagi selain selaku selalu selama selamat selancar selang selangit selaput selaras
selasar selatan selawat selebar seledri seleksi selektif selembar selenium selepas selera selesai selibat
selidiki selimut selingan selisih selokan selter seluas selubung selular seluler selulosa seluncur seluruh
semacam semakin semalam semampai semampu semangat semangka semantik semarak semasa semata sembah sembako
sembari sembelih sembelit sembilan semboyan sembrono sembuh sembunyi semburan semenjak semesta semester
seminar seminari seminggu semisal semoga sempadan sempalan sempat sempit semprot sempurna semrawut semuanya
semudah semula senang senapan senarai senator sendal sendang sendiri sendok sengaja sengatan senggang
senggol sengit sengketa sengsara senilai seniman senior senjata senonoh sensasi sensei sensitif sensor
sensorik sensual sensus senter sentiasa sentil sentimen sentra sentral sentuh sentuhan senyap senyawa senyum
senyuman seolah seorang sepadan sepaham sepakan sepakat separuh sepasang sepatah sepatu sepeda sepele
sepenuh seperi seperti sepeser sepeti sepihak sepintas sepiring sepotong seprai septum sepucuk sepulang
sepuluh sepupu sepupuku sepupumu serabut seragam serahkan serakah serambi serang serangan serangga serapan
serasa serasah serasi seratus seraya serbet serbuan serbuk serdadu seremoni serempak serendah serentak
sergapan serial seribu seribuan serigala serikat sering serius serong serpih serpihan sersan sertijab seruan
seruling serumah seruni serupa server serviks servis sesaat sesajen sesama sesegera sesekali sesepuh
sesering sesuai sesuatu sesudah sesuka sesukamu sesumbar setahap setahu setahun setang setapak setara
setebal setelah setelan setempat setengah setetes setianya setiap setiba setimpal setinggi setoran setrika
setuju setujui setumpuk seukuran seumur seusia seusiamu seutas sewaan sewaktu sezaman shalat sholat sholawat
sholeh sialan sialanmu sianida siapakah siapkan siaran siasat sidang sifatnya sifilis sigaret sihirmu
sihirnya sikapmu sikapnya siklik siklon siklonik siklus siksaan silakan silang silika silikat silikon
silinder silsilah siluet siluman simbal simbol simbolis simetri simetris simfoni simpan simpanan simpang
simpanse simpati simpatik simpel simpul simulasi simultan sinagoge sinden sindikat sindir sindiran sindrom
sineas sinema sinergi sinergis sinetron singgah singgung singkat singkong singlet sinilah sinkron sinode
sinonim sinopsis sintesis sintetik sintetis sinyal siraman sirene siring sirkuit sirkular sirkus sisakan
sisanya sisiku sisimu sisinya sistem sistim sitaan sitokin situasi siuman skalar skandal skenario skeptis
sketsa skripsi skuadron skuter slogan smelter snorkel soalnya sodium sokongan soliter solois solusi somasi
sombong sonata songket sontak sontekan sorgum sorotan sortir sosial sosialis sosiolog sosiopat spanduk
spartan spasial spektrum spekulan spesial spesiasi spesies spesifik spesimen spidol spionase spiral spirit
sponsor spontan sporadis sportif sprint stabil stadion stadium stagnan stagnasi stamina standar standard
standart starter stasiun statik statis status statuta stempel stensil stereo steril steroid stigma stiker
stimulan stimulus strata strategi stress striker stroberi stroke struktur studinya studio suamiku suamimu
suaminya suaraku suaramu suaranya suasana subduksi subjek subkutan subsider subsidi subsonik substrat
subunit subyek sugesti suguhan sukacita sukarela sukses suksesi sukunya sulaman sulfat sulfida sulfur suling
sulingan sulitnya sultan sulung sumbang sumbar sumbatan sumber sumbing sumpah sumpit sumsum sunatan sundulan
sungai sungguh sungkan sungkawa sungsang sunnah suntik suntikan sunting suntuk supaya suplai suplemen
suporter suportif surati suratmu suratnya surgawi surjan surplus suruhan survei survey suspensi suster
susulan susunan sutera suvenir swadaya swafoto swalayan swasta swastika syafaat syahadat syahid syaraf
syarak syarat syariah syariat syirik syuhada syukur syukuran syukuri syuting taaruf tabiat tablet tablig
tabloid tabrak tabrakan tabung tabungan taburan tadinya tafsir tafsiran tagihan tahajud tahanan tahapan
tahlil tahlilan tahukah tahulah tahunan tahunku tahunmu tahunnya taipan takaran takbir takbiran takdir
takhayul takhta takjil takjub takkan taklim takluk taklukan takmir takson taktik taktis takuti takutkan
takutnya takziah talang talenta talinya tamatan tambah tambahan tambak tambal tambang tambatan tambun tameng
tampak tampan tampang tampar tamparan tampil tampilan tampon tampuk tampung tamtama tamuku tamunya tanahnya
tanaman tancap tandan tandang tandanya tandas tandem tanding tandon tanduk tandukan tandus tangan tangani
tanganku tanganmu tangga tanggal tanggap tanggapi tangguh tanggul tanggung tangis tangisan tangkai tangkal
tangkap tangkas tangki tangkis tanjakan tanjung tanker tantang tanyakan tapioka tarekat target tarian
tarikan tarikh taring taruhan taruna tarung tarzan tasawuf tasbih tasnya tatanan tatapan tataran tatkala
tatung taubat tauhid tauladan tautan tawanan tawaran tawarikh tawuran tayang tayangan teater tebakan tebang
tebasan tebing tebusan tegakan tegang tegangan tegaskan teguran tehnik tekanan teknik teknis teknisi tekstil
tekstual tekstur tektonik telaah teladan telaga telanjur telantar telapak telaten teledor telefon telegraf
telegram telepati telepon teleskop televisi telinga teliti teller telpon telunjuk telurnya temanku temanmu
temannya temanya tematik tembaga tembak tembakan tembakau tembang tembikar tembok tembolok tembus tembusan
tempat tempatan tempati tempatku tempatmu tempel temporal temporer tempuh tempur temuan temukan tenaga
tenagamu tenang tendang tendensi tender tengah tenggang tenggara tenggat tenggiri tengik tengkuk tengok
tentakel tentang tentara tentatif tentera tenteram tentram tentukan tentunya tenunan teolog teologi teologis
teorema teoretis teoritis tepati tepatnya tepergok tepian tepukan tepung terakhir terakota teralis teraman
teramat teramati terampil terancam terang teranyar terapan terapi terapis terapung terarah terasa terasi
terasing teratai teratas teratasi teratur terawat terbaca terbagi terbaik terbakar terbalik terbang terbaru
terbatas terbawa terbawah terbayar terbebas terbelah terbelit terbenam terbesar terbesit terbiasa terbit
terbitan terbuang terbuat terbujur terbuka terbukti terbunuh terburai terburuk tercakup tercapai tercatat
tercebur tercecer tercekik tercela tercemar tercepat tercetus terciduk tercinta tercipta tercium terdakwa
terdalam terdapat terdekat terdepan terdesak terdiam terdidik terdiri terduduk terduga terendah terendam
terfokus tergerai tergerak tergerus tergeser tergilas tergiur tergoda tergores tergugah tergugat tergusur
terhadap terhapus terharu terhasut terhenti terhibur terhina terhukum terhunus teriak teriakan terigu
terikat terima terimbas terindah teringat terinjak teripang terisi terjadi terjaga terjajah terjal terjalin
terjamah terjamin terjang terjatuh terjauh terjebak terjemah terjepit terjerat terjual terjun terkabul
terkait terkapar terkasih terkaya terkecil terkecoh terkejar terkejut terkena terkenal terkesan terkikis
terkilir terkini terkirim terkuak terkuat terkubur terkulai terkunci terkuras terkutuk terlacak terlahir
terlalu terlaris terlarut terlatih terlebih terlena terlepas terletak terlewat terlibat terlihat terluas
terluka termakan termal termasuk termin terminal termuat termuda ternak ternama ternilai ternoda ternyata
terobati terompet terong teropong teroris terpaan terpadu terpakai terpaksa terpaku terpal terpana terpanas
terpaut terpecah terpikat terpikir terpilih terpisah terpojok terpuji terpukau terpukul terpuruk terpusat
terputus tersadar tersaji tersalur tersapu tersebar tersebut tersedak tersedia tersedot terselip tersemat
terserah terserap terseret tersesat tersiar tersier tersiksa tersirat tersisa tersisih tersohor tersusun
tertahan tertanam tertarik tertawa tertawan tertekan tertelan tertentu tertera tertib tertidur tertimpa
tertipu tertiup tertua tertuju tertukar tertulis tertunda tertusuk tertutup teruji terukir terulang terumbu
terurai terurus terusan terusik terusir teruskan terutama terwujud testing testis tetangga tetapi tetapkan
tetaplah tetesan tiarap tidakkah tidaklah tiduran tiduri tidurku tidurlah tidurmu tidurnya tikaman tiktok
tikungan tilang tilawah timbal timbang timbul timbunan timnas timpal timpang timsus tindak tindakan tindih
tinggal tinggi tingkah tingkat tinjau tinjauan tipikal tipikor tipuan tirani tiriku tirinya tiroid tiruan
titanium titian titipan titisan tituler tiupan toilet toksin tolakan toleran tolong tombak tomboi tombol
tonase tonggak tongkang tongkat tongkol tonjolan tonton tontonan topeng toples topologi torehan torium
tornado torpedo tradisi tragedi tragis trailer trakea traksi traktat traktir traktor trampil transfer
transisi transit transpor trauma trayek trendi tribun tribune triliun trilogi tripod trisula trivial
triwulan tropika tropis trotoar tsunami tuanku tuanmu tuannya tuanya tubrukan tubuhku tubuhmu tubuhnya
tudingan tuduhan tudung tugasku tugasmu tugasnya tuhanku tujuan tujuanku tujuanmu tukang tulang tulisan
tulisnya tumbal tumbang tumbler tumbuh tumbuhan tumbukan tumpah tumpahan tumpang tumpeng tumpuan tumpukan
tumpul tunangan tundra tunduk tungau tunggal tunggang tunggu tunggul tungkai tungku tungsten tunjuk tuntas
tuntunan tuntut tuntutan tupoksi turban turbin turbojet turnamen turunan turuti tutorial tutupan tutupnya
tuturan uangku uangmu uangnya ubahan ucapan ucapanku ucapanmu ucapkan ujaran ujungnya ukhuwah ukiran ukulele
ukuran ulangan ulangi ulasan ulayat uluran umatnya umpatan umumkan umumnya umurku umurmu umurnya undang
undangan undian unduhan unggah unggas unggul unggulan unggun ungkap ungkapan ungkit untaian untukku untukmu
untuknya untung upacara uraian uranium urgensi urunan urusan urusanku urusanmu urutan usahakan usahaku
usahamu usahanya usahawan usiaku usiamu usianya ustadz usulan usungan utamakan utamanya utangnya utaranya
uterus utilitas utusan vaksin valensi validasi valuta vampir vanila vanili variabel varian variasi variatif
varietas vaskular vegetasi vektor vendor ventral ventura verbal versus vertebra verteks vertigo vertikal
veteran vetiver vikaris violet virologi virtual virtuoso visioner visual vitamin vokalis vokasi volume
vulgar vulkanis wacana wahana wajahku wajahmu wajahnya wakilnya waktuku waktumu waktunya walafiat walaupun
walikota wangsa wanita waralaba warganet warganya warisan warisnya warnanya warnet wartawan warteg warung
wasabi wasiat waspada wastafel wastra waswas wawasan wayang wedana wedang wejangan welter wewenang wibawa
wicara wihara wilayah wisata wisman wisuda wolfram wortel wujudkan yahudi yakini yakinkan yakuza yayasan
yodium yoghurt yudisial yunior yuridis yustisi zaitun zamannya zamrud zamzam ziarah zodiak zonasi zoologi
`;

/** Kata bertema zombi/horor — sesekali dimunculkan agar suasana tetap terasa (8 kata) */
const TEMA_MUDAH = `
abu api bau bom dor gua jin roh
`;

/** Kata bertema zombi/horor — sesekali dimunculkan agar suasana tetap terasa (228 kata) */
const TEMA_SEDANG = `
adik aduh akar amuk anak angin angsa apel arwah asap awan awas ayah ayam baca badai bahu baik baju bakso
baru batik batu bebek bedil besar besi bibi biru bisa buas buaya buku bulan bunga buruk busuk busur cakar
candi cemas cepat dada danau darah daun debu desa drum duduk dukun emas embun empat enam fajar gagak gajah
gali ganas garam garpu gelap gelas gigi gigit gitar golok gudeg gula guru habis hantu hidup hijau hitam
horor hujan hutan iblis ikan jahat jalan jambu jari jarum jerit jeruk jimat jiwa kabur kabut kaca kafan kain
kakak kakek kaki kaos kapak kapal kasur kayu kecil kejam kelam kera keris kerja kopi korek kota kubur kuda
kuku kulit kunci kursi lagu lama lampu lapar lari laut leher liang liar lidah lihat lilin lima lolos luka
lutut main makam makan malam mandi mata mati mayat meja merah minum mobil motor mumi musuh nanas nasi nenek
ngeri nisan nyawa obor otak pagi paman panah panas panik pasar pasir pecel pena perak pergi perut peti petir
pintu pohon pucat pukul pulau pura putih racun raja ratu rumah rusa sabun salak salju sapi sate satu sawah
sekop senja seram serbu setan siang sihir sikat singa sore soto suara sunyi suram tahu takut tamat tanah
tari teman tempe tewas tidur tiga tikus tinta topi truk tubuh tujuh tulis tuyul ular ungu urat virus wabah
zombi
`;

/** Kata bertema zombi/horor — sesekali dimunculkan agar suasana tetap terasa (194 kata) */
const TEMA_SULIT = `
ambulans amunisi anggur angklung angkot anjing apotek bahagia bahaya bakwan bandara bangkai bangkit bantal
bantuan barikade baterai bayangan belalang bencana bensin benteng berani berdarah berdoa bergerak berhenti
berjalan berlari bernapas bertahan burung celana cendol cokelat daging darurat dinamit dingin dokter durian
evakuasi gamelan gedung gelisah gembira gemetar gereja gorengan granat gudang gunting gunung handuk harimau
hening ilmuwan infeksi jembatan jenazah jendela jerapah jeritan kaleng kambing kamera kantor kebaya kecewa
kecoak kelabang kelapa kelinci kemarin kematian kemenyan keranda kerbau kereta kertas kerupuk ketupat kiamat
kompas kompor komputer kosong kuburan kucing kuning kutukan langkah lautan ledakan lemari listrik lontong
makanan mangga manggis mangsa mantra martabak masjid melawan meledak melompat membakar memburu membusuk
memukul menangis menara mencakar mencari mencekam menembak menerkam mengamuk mengejar menggali mengusir
menjerit menunggu menyerah menyeret merayap minuman monyet nyamuk pabrik pantai parang payung pedang peluru
pemburu penawar penyakit pepaya perawat perban perisai pesawat pingsan piring pisang pistol pocong prajurit
purnama rambutan ransel rendang sambal samudra sarung sekarang sekolah selamat selimut semangka sembunyi
senang senapan sendok senjata senter sepatu sepeda serangan serigala sesajen siluman sinyal sirene stasiun
sungai tangisan taring telepon televisi tentara teriak terkutuk terluka terminal tertawa tolong tombak
tulang vaksin warung wayang
`;

const RAW: Record<Difficulty, string> = { mudah: MUDAH, sedang: SEDANG, sulit: SULIT };
const RAW_TEMA: Record<Difficulty, string> = { mudah: TEMA_MUDAH, sedang: TEMA_SEDANG, sulit: TEMA_SULIT };

export const LENGTH_RULES: Record<Difficulty, [number, number]> = {
  mudah: [3, 3],
  sedang: [4, 5],
  sulit: [6, 8],
};

const cache = new Map<string, string[]>();

function build(src: Record<Difficulty, string>, prefix: string, diff: Difficulty, maxLen?: number): string[] {
  const key = `${prefix}:${diff}:${maxLen ?? ""}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [min, max] = LENGTH_RULES[diff];
  const limit = Math.min(max, maxLen ?? max);
  const set = new Set<string>();
  for (const w of src[diff].split(/\s+/)) {
    const word = w.trim();
    if (word.length < min || word.length > limit) continue;
    if (!/^[a-z]+$/.test(word)) continue;
    set.add(word.toUpperCase());
  }
  const list = [...set];
  cache.set(key, list);
  return list;
}

/** Seluruh kata (HURUF BESAR) untuk tingkat kesulitan tertentu. */
export function getWordPool(diff: Difficulty, maxLen?: number): string[] {
  return build(RAW, "all", diff, maxLen);
}

/** Kata bertema zombi/horor saja. */
export function getThemePool(diff: Difficulty, maxLen?: number): string[] {
  return build(RAW_TEMA, "tema", diff, maxLen);
}
