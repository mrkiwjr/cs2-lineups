'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'

function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i))
        i++
      } else {
        clearInterval(interval)
      }
    }, 40)
    return () => clearInterval(interval)
  }, [started, text])

  return (
    <span>
      {displayed}
      <span className="animate-[blink-cursor_0.8s_infinite]">_</span>
    </span>
  )
}

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="crt-glow"
    >
      {value}{suffix}
    </motion.span>
  )
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="min-h-screen bg-black text-[#888888] overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-[#1c1c1c] bg-black">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-[#cccccc] font-bold text-sm crt-glow">[CS2]</span>
            <span className="text-[#888888] font-bold text-sm tracking-wider">LINEUPS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="px-4 py-1.5 text-xs font-medium text-[#444444] hover:text-[#888888] transition-colors"
            >
              Приложение
            </Link>
            <Link
              href="/app"
              className="px-4 py-1.5 text-xs font-medium border border-[#2a2a2a] text-[#cccccc] hover:bg-[#1a1a1a] hover:border-[#444444] transition-all"
            >
              [ ОТКРЫТЬ КАРТУ ]
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-14">
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 border border-[#1c1c1c] text-[#5a8a9e] text-xs font-bold tracking-wider uppercase mb-10"
          >
            <span className="w-1.5 h-1.5 bg-[#5a8a9e] animate-pulse" />
            7 карт // 48 лайнапов // active
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-8"
          >
            <span
              className="block text-[#cccccc] crt-glitch"
              data-text="РАСКИДЫ ДЛЯ"
            >
              РАСКИДЫ ДЛЯ
            </span>
            <span
              className="block mt-3 text-[#5a8a9e] crt-glitch crt-glow-smoke"
              data-text="РЕАЛЬНЫХ ПАЦАНОВ"
            >
              РЕАЛЬНЫХ ПАЦАНОВ
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-sm sm:text-base text-[#444444] max-w-xl mx-auto mb-10 leading-relaxed"
          >
            <TypingText
              text="Без воды, без булшита. Только рабочие лайнапы от про-игроков."
              delay={1200}
            />
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/app"
              className="group px-8 py-3 border border-[#2a2a2a] text-[#cccccc] font-bold text-sm hover:bg-[#1a1a1a] hover:border-[#5a8a9e] transition-all crt-glow"
            >
              {'>'} ОТКРЫТЬ КАРТУ<span className="animate-[blink-cursor_0.8s_infinite]">_</span>
            </Link>
            <span className="text-xs text-[#2a2a2a]">бесплатно // без регистрации</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="flex items-center justify-center gap-8 mt-16"
          >
            {[
              { name: 'SMOKE', color: '#5a8a9e' },
              { name: 'FLASH', color: '#a89a3a' },
              { name: 'MOLOTOV', color: '#9e3e2a' },
              { name: 'HE', color: '#3e8a2e' },
            ].map((g, i) => (
              <motion.span
                key={g.name}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                className="text-xs font-bold tracking-wider"
                style={{ color: g.color }}
              >
                [{g.name}]
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[#2a2a2a] text-lg"
          >
            V
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#cccccc] crt-glow mb-3">
              {'>'} ВОЗМОЖНОСТИ
            </h2>
            <p className="text-[#444444] text-sm">
              // не просто картинки с прицелами
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              {
                icon: '[MAP]',
                title: 'Интерактивная карта',
                desc: 'Маркеры гранат на карте. Кликни — увидишь откуда и куда кидать.',
                accent: '#5a8a9e',
              },
              {
                icon: '[7x48+]',
                title: '7 карт, 48+ лайнапов',
                desc: 'Mirage, Inferno, Dust 2, Nuke, Anubis, Ancient, Overpass.',
                accent: '#a89a3a',
              },
              {
                icon: '[>>]',
                title: 'Фильтры за секунду',
                desc: 'Граната + сторона + карта. Три клика — видишь только нужное.',
                accent: '#3e8a2e',
              },
              {
                icon: '[KEY]',
                title: 'Вход через Discord',
                desc: 'Избранное, комментарии, свои лайнапы. Google тоже работает.',
                accent: '#5a8a9e',
              },
              {
                icon: '[///]',
                title: 'Комментарии',
                desc: 'Обсуждай лайнапы с комьюнити. Редактируй и удаляй свои.',
                accent: '#9e3e2a',
              },
              {
                icon: '[MOB]',
                title: 'Работает везде',
                desc: 'Открой на телефоне перед каткой. Никаких приложений.',
                accent: '#a89a3a',
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="group p-5 border border-[#1c1c1c] bg-black hover:bg-[#0a0a0a] hover:border-[#2a2a2a] transition-all duration-300"
              >
                <div
                  className="text-sm font-bold mb-3 tracking-wider"
                  style={{ color: feature.accent }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold mb-2 text-[#cccccc]">{feature.title}</h3>
                <p className="text-xs text-[#444444] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#cccccc] crt-glow">
              {'>'} В ЦИФРАХ
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: 7, suffix: '', label: 'КАРТ', sub: 'все актуальные' },
              { value: 48, suffix: '+', label: 'ЛАЙНАПОВ', sub: 'и растёт' },
              { value: 4, suffix: '', label: 'ТИПА ГРАНАТ', sub: 'smoke // flash // molotov // he' },
              { value: 0, suffix: '₽', label: 'ЦЕНА', sub: 'бесплатно навсегда' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center p-5 border border-[#1c1c1c] border-dashed"
              >
                <div className="text-3xl sm:text-4xl font-black tracking-tight mb-1 text-[#cccccc]">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] font-bold text-[#444444] uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-[10px] text-[#2a2a2a]">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#cccccc] crt-glow">
              {'>'} ТРИ ШАГА
            </h2>
          </motion.div>

          <div className="space-y-3">
            {[
              { step: '01', title: 'Открой карту', desc: 'Выбери карту, граната, сторону. Видишь маркеры — это точки бросков.', color: '#5a8a9e' },
              { step: '02', title: 'Изучи лайнап', desc: 'Кликни на маркер. Видео, описание, откуда встать, куда целиться.', color: '#a89a3a' },
              { step: '03', title: 'Закидай на катке', desc: 'Тиммейты в шоке. Противники в ярости. Ты — красавец.', color: '#3e8a2e' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="flex items-start gap-5 p-5 border border-[#1c1c1c] hover:border-[#2a2a2a] transition-colors"
              >
                <span
                  className="text-lg font-black shrink-0"
                  style={{ color: item.color }}
                >
                  {item.step} {'>'}
                </span>
                <div>
                  <h3 className="text-sm font-bold mb-1 text-[#cccccc]">{item.title}</h3>
                  <p className="text-xs text-[#444444]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6 text-[#cccccc] crt-glow">
            ХВАТИТ СЛИВАТЬ
            <br />
            <span className="text-[#5a8a9e] crt-glow-smoke">ИЗ-ЗА ГРАНАТ</span>
          </h2>
          <p className="text-sm text-[#444444] mb-8">
            // выучи 10 лайнапов — и ты уже лучше 90% игроков в MM
          </p>
          <Link
            href="/app"
            className="inline-block px-10 py-4 border border-[#2a2a2a] text-[#cccccc] font-bold text-sm hover:bg-[#1a1a1a] hover:border-[#5a8a9e] transition-all crt-glow"
          >
            {'['} ОТКРЫТЬ КАРТУ → {']'}
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1c1c1c] py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#cccccc] font-bold text-xs crt-glow">[CS2]</span>
            <span className="text-[#444444] font-bold text-xs">LINEUPS</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#2a2a2a]">
            <Link href="/app" className="hover:text-[#444444] transition-colors">Приложение</Link>
            <span className="text-[#1c1c1c]">|</span>
            <a href="https://github.com/mrkiwjr/cs2-lineups" target="_blank" rel="noopener" className="hover:text-[#444444] transition-colors">GitHub</a>
          </div>
          <div className="text-xs text-[#1c1c1c]">
            ═══ {new Date().getFullYear()} ═══
          </div>
        </div>
      </footer>
    </div>
  )
}
