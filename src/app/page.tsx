'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'

// ─── Grenade SVG icons ───
const SmokeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <circle cx="12" cy="12" r="8" stroke="#4ea8d1" strokeWidth="2" />
    <path d="M8 12c0-2 2-4 4-4" stroke="#4ea8d1" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const FlashIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" fill="#d4a843" />
  </svg>
)
const MolotovIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M12 22c-4 0-7-3-7-7 0-4 7-11 7-11s7 7 7 11c0 4-3 7-7 7z" fill="#d14e4e" />
  </svg>
)
const HEIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <circle cx="12" cy="12" r="7" stroke="#4ed17a" strokeWidth="2" />
    <path d="M12 8v4M10 10h4" stroke="#4ed17a" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// ─── Animated counter ───
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {value}{suffix}
      </motion.span>
    </motion.span>
  )
}

// ─── Stagger wrapper ───
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
}

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="min-h-screen bg-[#0a0b10] text-white overflow-x-hidden">
      {/* ═══════ NOISE OVERLAY ═══════ */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ═══════ NAVBAR ═══════ */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 backdrop-blur-xl bg-[#0a0b10]/70">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4ea8d1] to-[#d14e4e] flex items-center justify-center text-xs font-black tracking-tighter">
              CS2
            </div>
            <span className="font-black text-lg tracking-tight">
              LINEUPS
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="px-5 py-2 text-sm font-semibold text-[#8b8fa3] hover:text-white transition-colors"
            >
              Приложение
            </Link>
            <Link
              href="/app"
              className="px-5 py-2.5 text-sm font-bold rounded-lg bg-gradient-to-r from-[#4ea8d1] to-[#3b82c4] hover:from-[#5bb8e1] hover:to-[#4b92d4] transition-all shadow-lg shadow-[#4ea8d1]/20"
            >
              Открыть карту
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Game screenshot background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/hero-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
          }}
        />
        {/* Dark overlays for readability */}
        <div className="absolute inset-0 bg-[#0a0b10]/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0b10] via-transparent to-[#0a0b10]" />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#4ea8d1]/8 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#d14e4e]/6 blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#d4a843]/5 blur-[100px]" />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#4ea8d1]/30 bg-[#4ea8d1]/5 text-[#4ea8d1] text-xs font-mono font-bold tracking-wider uppercase mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ea8d1] animate-pulse" />
            7 карт · 48 лайнапов · обновляется
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-6"
          >
            <span className="block">Раскиды для</span>
            <span className="block mt-2 bg-gradient-to-r from-[#4ea8d1] via-[#d4a843] to-[#d14e4e] bg-clip-text text-transparent">
              реальных пацанов
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg sm:text-xl text-[#8b8fa3] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Без воды, без булшита. Только рабочие лайнапы от про-игроков.
            <br />
            <span className="text-[#c0c4d6]">Выучи — закидай — стань красавцем.</span>
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/app"
              className="group relative px-8 py-4 rounded-xl font-bold text-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#4ea8d1] to-[#3b82c4] group-hover:from-[#5bb8e1] group-hover:to-[#4b92d4] transition-all" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]" />
              <span className="relative z-10">Открыть карту</span>
            </Link>
            <span className="text-sm text-[#555] font-mono">бесплатно · без регистрации</span>
          </motion.div>

          {/* Grenade icons floating */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="flex items-center justify-center gap-6 mt-16 text-[#555]"
          >
            {['Дымы', 'Флэшки', 'Молотовы', 'HE'].map((name, i) => (
              <motion.div
                key={name}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, delay: i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center gap-1.5 text-xs font-mono"
              >
                {i === 0 && <SmokeIcon />}
                {i === 1 && <FlashIcon />}
                {i === 2 && <MolotovIcon />}
                {i === 3 && <HEIcon />}
                {name}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-[#333] flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-[#555]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ PREVIEW ═══════ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4ea8d1]/3 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-6xl mx-auto"
        >
          <div className="rounded-2xl border border-white/10 bg-[#12131a] p-2 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-1.5 px-3 py-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#d14e4e]/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#d4a843]/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#4ed17a]/60" />
              <span className="ml-3 text-[10px] font-mono text-[#555]">cs2-lineups.netlify.app</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/5 aspect-[16/9] bg-[#0d0e14] flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-[#8b8fa3] font-mono text-sm">Интерактивная карта с лайнапами</p>
                <p className="text-[#555] font-mono text-xs mt-1">Кликни на маркер → получи инструкцию</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Всё что нужно для
              <span className="bg-gradient-to-r from-[#4ea8d1] to-[#4ed17a] bg-clip-text text-transparent"> побед</span>
            </h2>
            <p className="text-[#8b8fa3] text-lg max-w-xl mx-auto">
              Не просто картинки с прицелами. Полноценная система обучения гранатам.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[
              {
                icon: '🗺️',
                title: 'Интерактивная карта',
                desc: 'Leaflet-карта с маркерами гранат. Кликни → увидишь откуда и куда кидать. Траектория рисуется прямо на карте.',
                accent: '#4ea8d1',
              },
              {
                icon: '🎯',
                title: '7 карт, 48+ лайнапов',
                desc: 'Mirage, Inferno, Dust 2, Nuke, Anubis, Ancient, Overpass. Дымы, флэшки, молотовы, HE — всё на месте.',
                accent: '#d4a843',
              },
              {
                icon: '⚡',
                title: 'Фильтры за секунду',
                desc: 'Граната + сторона + карта. Три клика — и видишь только то, что нужно. URL обновляется — кидай ссылку тиммейту.',
                accent: '#4ed17a',
              },
              {
                icon: '🔐',
                title: 'Вход через Discord',
                desc: 'Залогинился — получил доступ к избранному, комментариям, добавлению своих лайнапов. Google тоже работает.',
                accent: '#7c6ee7',
              },
              {
                icon: '💬',
                title: 'Комментарии',
                desc: '«А ещё можно кинуть чуть левее» — обсуждай лайнапы с комьюнити. Редактируй и удаляй свои.',
                accent: '#d14e4e',
              },
              {
                icon: '📱',
                title: 'Работает везде',
                desc: 'Открой на телефоне перед каткой — посмотри лайнап, закрой, закинь. Никаких приложений, просто сайт.',
                accent: '#d4a843',
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="group relative p-6 rounded-2xl border border-white/5 bg-[#12131a] hover:border-white/10 transition-all duration-300"
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${feature.accent}08, transparent 70%)` }}
                />
                <div className="relative z-10">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-bold mb-2 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-[#8b8fa3] leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d14e4e]/3 to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">В цифрах</h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: 7, suffix: '', label: 'Карт', sub: 'Все актуальные' },
              { value: 48, suffix: '+', label: 'Лайнапов', sub: 'И растёт' },
              { value: 4, suffix: '', label: 'Типа гранат', sub: 'Smoke · Flash · Molotov · HE' },
              { value: 0, suffix: '₽', label: 'Цена', sub: 'Бесплатно навсегда' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center p-6 rounded-2xl border border-white/5 bg-[#12131a]"
              >
                <div className="text-4xl sm:text-5xl font-black tracking-tight mb-1">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-bold text-[#c0c4d6] mb-1">{stat.label}</div>
                <div className="text-xs text-[#555] font-mono">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Три шага до
              <span className="bg-gradient-to-r from-[#d4a843] to-[#d14e4e] bg-clip-text text-transparent"> красавца</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Открой карту', desc: 'Выбери карту, граната, сторону. Видишь маркеры — это точки бросков.', color: '#4ea8d1' },
              { step: '02', title: 'Изучи лайнап', desc: 'Кликни на маркер. Видео, описание, откуда встать, куда целиться. Всё разжёвано.', color: '#d4a843' },
              { step: '03', title: 'Закидай на катке', desc: 'Тиммейты в шоке. Противники в ярости. Ты — красавец.', color: '#4ed17a' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex items-start gap-6 p-6 rounded-2xl border border-white/5 bg-[#12131a] hover:border-white/10 transition-colors"
              >
                <div
                  className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl"
                  style={{ background: `${item.color}15`, color: item.color }}
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className="text-[#8b8fa3]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#4ea8d1]/5 blur-[150px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
            Хватит сливать
            <br />
            <span className="bg-gradient-to-r from-[#4ea8d1] via-[#d4a843] to-[#d14e4e] bg-clip-text text-transparent">
              из-за гранат
            </span>
          </h2>
          <p className="text-xl text-[#8b8fa3] mb-10">
            Выучи 10 лайнапов — и ты уже лучше 90% игроков в MM.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-xl font-bold text-lg bg-gradient-to-r from-[#4ea8d1] to-[#3b82c4] hover:from-[#5bb8e1] hover:to-[#4b92d4] transition-all shadow-xl shadow-[#4ea8d1]/20 hover:shadow-[#4ea8d1]/30"
          >
            Открыть карту
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#4ea8d1] to-[#d14e4e] flex items-center justify-center text-[9px] font-black">
              CS2
            </div>
            <span className="font-bold text-sm tracking-tight">LINEUPS</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#555] font-mono">
            <Link href="/app" className="hover:text-[#8b8fa3] transition-colors">Приложение</Link>
            <a href="https://github.com/mrkiwjr/cs2-lineups" target="_blank" rel="noopener" className="hover:text-[#8b8fa3] transition-colors">GitHub</a>
          </div>
          <div className="text-xs text-[#333] font-mono">
            {new Date().getFullYear()} · сделано с 💀
          </div>
        </div>
      </footer>

      {/* Shimmer keyframes */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -250% -250%; }
          100% { background-position: 250% 250%; }
        }
      `}</style>
    </div>
  )
}
