import Link from "next/link";
import { Scale, ArrowLeft, ShieldAlert, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Syarat & Ketentuan Penggunaan (Disclaimer) — Clyra",
  description: "Pelepasan tanggung jawab hukum, ketentuan penggunaan personal, dan kebijakan privasi platform Clyra.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col">
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-indigo-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Disclaimer &amp; Terms of Service</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Syarat, Ketentuan &amp; Pelepasan Tanggung Jawab Hukum
          </h1>
          <p className="text-xs text-slate-400">
            Terakhir diperbarui: 19 Agustus 2026 • Berlaku untuk seluruh pengunjung &amp; pengguna platform Clyra.
          </p>
        </div>

        {/* Legal Sections */}
        <div className="bg-[#0e111a] border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-indigo-400 font-mono">1.</span> Sifat Platform &amp; Tujuan Penggunaan
            </h2>
            <p>
              Platform <strong>Clyra</strong> adalah website personal workspace, arsip portofolio karya, dan utilitas produktivitas yang disediakan secara independen untuk keperluan <strong>pribadi, edukasi, eksperimen teknis, dan produktivitas harian</strong>.
            </p>
            <p>
              Seluruh alat (tools) disediakan secara gratis dan bebas digunakan tanpa jaminan komersial apa pun.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-indigo-400 font-mono">2.</span> Pelepasan Tanggung Jawab Hukum Penuh (Disclaimer of Liability)
            </h2>
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-200 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <ShieldAlert className="w-4 h-4" />
                <span>Pernyataan Bebas Tuntutan (Zero Liability):</span>
              </div>
              <p>
                Pemilik, pengembang, dan pengelola platform Clyra <strong>TIDAK BERTANGGUNG JAWAB</strong> atas segala bentuk kerugian, kerusakan data, tuntutan hukum, denda, atau konsekuensi hukum apa pun yang timbul akibat penggunaan atau penyalahgunaan alat bantu, converter, generator, media downloader, atau materi apa pun yang tersedia di situs ini oleh pengguna maupun pihak ketiga.
              </p>
            </div>
            <p>
              Layanan disediakan berdasarkan prinsip <strong>&quot;SEBAGAIMANA ADANYA&quot; (AS IS)</strong> dan <strong>&quot;SEBAGAIMANA TERSEDIA&quot; (AS AVAILABLE)</strong> tanpa jaminan kelayakan, keandalan tanpa henti, atau kecocokan untuk tujuan tertentu.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-indigo-400 font-mono">3.</span> Hak Kekayaan Intelektual &amp; Tanggung Jawab Pengguna
            </h2>
            <p>
              Pengguna menyatakan dan menjamin bahwa:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400">
              <li>
                Pengguna bertanggung jawab penuh secara mandiri atas keabsahan, hak cipta, dan legalitas materi, teks, gambar, atau media yang diproses atau diunduh menggunakan tools Clyra.
              </li>
              <li>
                Pengguna dilarang menggunakan tools Clyra untuk tujuan yang melanggar hukum, melanggar hak cipta / hak kekayaan intelektual (HAKI) pihak lain, atau tindakan yang merugikan orang lain.
              </li>
              <li>
                Setiap pelanggaran hukum atau hak cipta yang dilakukan oleh pengguna merupakan tanggung jawab pribadi pengguna sepenuhnya di hadapan hukum yang berlaku.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-indigo-400 font-mono">4.</span> Privasi &amp; Pemrosesan Data di Sisi Klien (Client-Side Only)
            </h2>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-xs">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <div className="leading-relaxed">
                Platform Clyra dibangun dengan arsitektur <strong>100% Client-Side Processing</strong>. Artinya, file gambar, teks, JSON, password, maupun prompt Anda diproses langsung di dalam browser perangkat Anda tanpa pernah diunggah, disimpan, atau dicatat di server basis data pihak pengelola.
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-indigo-400 font-mono">5.</span> Penerimaan Syarat
            </h2>
            <p className="text-xs text-slate-400">
              Dengan mengakses, menelusuri, atau menggunakan fitur apa pun di website Clyra, Anda dianggap telah membaca, memahami, dan menyetujui seluruh isi Syarat, Ketentuan, serta Pelepasan Tanggung Jawab Hukum ini secara mutlak tanpa syarat.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
