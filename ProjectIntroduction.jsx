// The introduction below is the text printed on page 3 of the zine (in Indonesian).
// Edit freely.
const paragraphs = [
  'Lembar ini bukan sebuah catatan medis, bukan pula katalog ilmiah tentang organ dan daging. Ini adalah tempat di mana presisi anatomi bertemu dengan kesunyian yang paling pekat. Sebuah pembedahan atas apa yang tersisa ketika nyawa melepaskan genggamannya.',
  'Setiap lembar melukiskan ketegangan antara struktur tubuh dan kehampaan. Ilustrasi garis-garis tubuh, ruas-ruas kalsium, serta lipatan jaringan kaku yang tersingkap di sini disandingkan dengan larik-larik bait yang mengeja kepasrahan, pembusukan, dan waktu yang membeku.',
  'Di dalam arsip yang muram ini, setiap organ tak lagi berfungsi sebagai penopang hidup, melainkan monumen atas keruntuhan yang dingin. Pembuluh darah, sekat dada, hingga kedalaman usus diurai bukan untuk mencari kesembuhan, melainkan untuk mendokumentasikan jejak-jejak hening yang mengendap setelah seluruh jeritan dan napas usai.',
  'Setiap gambar dan tulisan dirancang untuk menyeret mata melintasi pualam busuk dan lorong-lorong kalsium yang membisu. Ini adalah ajakan untuk memandangi anatomi diri sendiri dari sudut pandang asing. Sebuah cermin tempat ketebalan takdir saling bertumpuk tanpa rasa iba.',
  'Selamat menelusuri lorong-lorong daging yang membisu. Tempat di mana bahasa manusia selesai, dan keheningan abadi dimulai.',
]

export default function ProjectIntroduction() {
  return (
    <section id="introduction" className="section intro">
      <h2 className="section-title">Introducing</h2>
      <p className="intro-lede">
        A 46-page zine of poems and anatomical engravings, arranged in three parts. The writing is in Indonesian; the part openers are in English.
      </p>
      <div className="intro-text" lang="id">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <p className="signature">Negative Realm, 2026</p>
    </section>
  )
}
