# Smart AI Expense Tracker

> **Aplikasi Catatan Keuangan Berbasis Natural Text AI**  
> *Capstone Project - IBM Hacktiv8 AI for Programming*

#### Lihat Website: [Smart AI Expense Tracker](https://smartfinance-ai.vercel.app/)


## Ringkasan Proyek

**Smart AI Expense Tracker** adalah aplikasi manajemen keuangan pribadi modern yang memangkas *friction* pencatatan pengeluaran harian. Memanfaatkan kemampuan pemrosesan teks berbasis bahasa alami (*Natural Language Processing*), pengguna dapat mencatat transaksi cukup dengan mengetikkan kalimat bebas sehari-hari tanpa harus menginput formulir yang rumit satu per satu.

Seluruh data transaksi tersimpan secara aman di peramban pengguna melalui **LocalStorage**, cepat diakses, serta dioptimalkan secara penuh untuk perangkat seluler maupun desktop.



## Fitur Unggulan

- **Dual-Mode Input (AI Text & Manual Form)**: Ketik kalimat bebas seperti *"makan siang 25rb, ojek 15rb"*, AI secara otomatis mem-parsing nominal, kategori, dan deskripsi secara terstruktur.
- **Category Budget Limits & Smart Alerts**: Atur batas anggaran per kategori lengkap dengan indikator *progress bar* visual (*Green*, *Yellow*, dan *Red Alert* saat mendekati/melewati batas).
- **Recurring Expenses & Bills Tracker**: Kelola tagihan bulanan berulang (seperti langganan streaming, kos, internet) dengan indikator status pembayaran dan tanggal jatuh tempo.
- **Filter & Export System (CSV/PDF)**: Rekapitulasi transaksi bulanan/tahunan yang dapat difilter secara kustom serta diekspor ke format CSV atau PDF ringkas.
- **Light & Dark Mode Support**: Antarmuka modern dan elegan dengan dukungan transisi mode terang dan gelap berbasis Tailwind CSS.
- **Mobile-First & Fully Responsive**: Tampilan *dashboard grid* interaktif di desktop dan *cards view* intuitif di perangkat seluler.
- **Privacy-First & Hydration-Safe**: Data tersimpan aman di LocalStorage lokal dan diarsitektursikan bebas dari *hydration mismatch error* pada Next.js Client Component.



## Arsitektur Prompting (3-Layer Architecture)

Pengembangan proyek ini memanfaatkan **IBM Bob AI Agent** menggunakan pendekatan **3-Layer Prompting** untuk menjamin kualitas dan keandalan kode yang dihasilkan:

1. **Layer 1: Role & Context**  
   Menetapkan identitas AI Agent sebagai *Senior Full-Stack Engineer* yang membangun aplikasi Next.js (App Router), TypeScript, dan Tailwind CSS dengan standar arsitektur komponen modular dan *client-side persistence*.
2. **Layer 2: Task & Requirements**  
   Menjabarkan spesifikasi fitur secara presisi, mulai dari *Dual-Mode Input Panel*, logika penyinkronan *LocalStorage*, hingga sistem *Budget Alerts* dan fungsi ekspor rekapitulasi data.
3. **Layer 3: Constraints & Output**  
   Mengunci standar desain antarmuka (*Mobile-first layout*, palet warna kontras, standar aksesibilitas WCAG AA) serta format *output* berupa komponen kode TypeScript yang bersih tanpa *runtime error*.



## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Persistence**: React Hooks (`useState`, `useEffect`) & LocalStorage API
- **AI Development Tool**: IBM Bob (3-Layer Targeted Refinement)