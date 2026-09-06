'use client'

import { useEffect, useMemo, useState } from 'react'
import AuthPanel from '@/components/AuthPanel'
import { createClient } from '@/lib/supabase/client'

const typingText = 'Learning to type is learning to think faster. Keep your eyes on the words and let your fingers find the keys.'
const physics = [
  { title: 'Motion', icon: '🚗', text: 'Motion means an object changes its position with time.', example: 'A bike moving from your house to school is in motion.', formula: 'Speed = Distance ÷ Time' },
  { title: 'Force', icon: '💥', text: 'A force is a push or a pull that can change motion.', example: 'Pushing a shopping cart applies force.', formula: 'Force = Mass × Acceleration' },
  { title: 'Gravity', icon: '🌍', text: 'Gravity attracts objects toward Earth.', example: 'A ball falls down because Earth pulls it.', formula: 'Weight = Mass × g' },
  { title: 'Energy', icon: '⚡', text: 'Energy is the ability to do work or cause change.', example: 'Food gives your body chemical energy.', formula: 'Kinetic Energy = ½mv²' },
]

type Profile = { display_name: string | null; xp: number; streak: number; best_wpm: number }
type Stats = { profile: Profile; typingCount: number; mathCount: number; physicsDone: number; recentWpm: number }

export default function Home() {
  const supabase = createClient()
  const [tab, setTab] = useState('home')
  const [seconds, setSeconds] = useState(60)
  const [started, setStarted] = useState(false)
  const [typed, setTyped] = useState('')
  const [math, setMath] = useState({ a: 7, b: 8, op: '×', answer: '' })
  const [mathScore, setMathScore] = useState(0)
  const [mathQuestions, setMathQuestions] = useState(0)
  const [topic, setTopic] = useState(0)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
      setUserId(data.user?.id ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
      setUserId(session?.user?.id ?? null)
      if (!session) setStats(null)
    })
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (userId) loadStats(userId)
  }, [userId])

  useEffect(() => {
    if (!started || seconds <= 0) return
    const t = setInterval(() => setSeconds(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [started, seconds])

  useEffect(() => {
    if (started && seconds === 0) finishTyping()
  }, [seconds, started])

  const accuracy = useMemo(() => {
    if (!typed.length) return 100
    let correct = 0
    for (let i = 0; i < typed.length; i++) if (typed[i] === typingText[i]) correct++
    return Math.round(correct / typed.length * 100)
  }, [typed])
  const elapsed = Math.max(60 - seconds, 1)
  const wpm = Math.round(typed.trim().split(/\s+/).filter(Boolean).length / (elapsed / 60))

  async function loadStats(id: string) {
    const [{ data: profile }, { count: typingCount }, { count: mathCount }, { data: physicsData }, { data: recent }] = await Promise.all([
      supabase.from('profiles').select('display_name,xp,streak,best_wpm').eq('user_id', id).maybeSingle(),
      supabase.from('typing_results').select('id', { count: 'exact', head: true }).eq('user_id', id),
      supabase.from('math_results').select('id', { count: 'exact', head: true }).eq('user_id', id),
      supabase.from('physics_progress').select('completed').eq('user_id', id),
      supabase.from('typing_results').select('wpm').eq('user_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ])
    if (profile) setStats({ profile, typingCount: typingCount ?? 0, mathCount: mathCount ?? 0, physicsDone: physicsData?.filter(p => p.completed).length ?? 0, recentWpm: Number(recent?.wpm ?? 0) })
  }

  async function awardXp(points: number, bestWpm?: number) {
    if (!userId) return
    const { data: profile } = await supabase.from('profiles').select('xp,streak,best_wpm').eq('user_id', userId).maybeSingle()
    if (!profile) {
      await supabase.from('profiles').upsert({ user_id: userId, display_name: userEmail?.split('@')[0] ?? 'Student', xp: points, streak: 1, best_wpm: bestWpm ?? 0 })
    } else {
      await supabase.from('profiles').update({ xp: Number(profile.xp ?? 0) + points, best_wpm: Math.max(Number(profile.best_wpm ?? 0), bestWpm ?? 0) }).eq('user_id', userId)
    }
    await loadStats(userId)
  }

  async function finishTyping() {
    if (!userId || !typed.trim() || saving) return
    setSaving(true)
    const correctChars = typed.split('').filter((c, i) => c === typingText[i]).length
    const incorrectChars = typed.length - correctChars
    await supabase.from('typing_results').insert({ user_id: userId, duration_seconds: Math.max(60 - seconds, 1), wpm, accuracy, correct_chars: correctChars, incorrect_chars: incorrectChars })
    await awardXp(Math.max(10, Math.round(wpm / 2)), wpm)
    setSaving(false)
  }

  function startTyping() {
    setStarted(true); setSeconds(60); setTyped('')
  }

  function newMath() {
    const a = Math.floor(Math.random() * 12) + 2, b = Math.floor(Math.random() * 12) + 2
    setMath({ a, b, op: '×', answer: '' })
  }

  async function checkMath() {
    const correct = Number(math.answer) === math.a * math.b
    if (correct) setMathScore(s => s + 10)
    setMathQuestions(q => q + 1)
    if (userId) {
      await supabase.from('math_results').insert({ user_id: userId, topic: 'multiplication', difficulty: 'easy', score: correct ? 10 : 0, total_questions: 1 })
      await awardXp(correct ? 10 : 2)
    }
    newMath()
  }

  async function completePhysics() {
    if (!userId) return
    await supabase.from('physics_progress').upsert({ user_id: userId, topic: physics[topic].title.toLowerCase(), completed: true, quiz_score: 100, updated_at: new Date().toISOString() }, { onConflict: 'user_id,topic' })
    await awardXp(15)
  }

  async function logout() {
    await supabase.auth.signOut()
    setUserEmail(null); setUserId(null); setStats(null); setTab('home')
  }

  return <main>
    <nav className="nav"><div className="brand"><span className="logo">F</span><span>FlowKeys</span></div><div className="navlinks"><button onClick={() => setTab('home')}>Home</button><button onClick={() => setTab('dashboard')}>Dashboard</button><button onClick={() => setTab('typing')}>Typing</button><button onClick={() => setTab('maths')}>Maths</button><button onClick={() => setTab('physics')}>Physics</button></div><button className="profile" onClick={() => userEmail ? logout() : setAuthOpen(true)}>{userEmail ? userEmail.slice(0, 2).toUpperCase() : 'Log in'}</button></nav>

    {tab === 'home' && <section className="hero page"><div><div className="pill">✦ Learn by doing</div><h1>Build skills.<br/><span>Find your flow.</span></h1><p className="lead">Practice typing, sharpen your maths, and understand physics — one small win at a time.</p><div className="actions"><button className="primary" onClick={() => setTab('typing')}>Start practicing →</button><button className="secondary" onClick={() => setTab('physics')}>Explore Physics</button></div></div><div className="heroCard"><div className="orb">⌨️</div><p>Today's challenge</p><h3>Type for 60 seconds</h3><div className="miniStat"><b>{userEmail ? 'LIVE' : '—'}</b><span>{userEmail ? 'Progress will be saved to your account' : 'Log in to save your progress'}</span></div><button onClick={() => userEmail ? setTab('typing') : setAuthOpen(true)}>{userEmail ? 'Try challenge →' : 'Log in & start →'}</button></div></section>}

    {tab === 'dashboard' && <section className="page"><Header title="Your dashboard" subtitle={userEmail ? `Welcome back, ${stats?.profile.display_name ?? userEmail.split('@')[0]}.` : 'Log in to start building your learning history.'}/>{!userEmail ? <div className="emptyState"><div className="orb">🔐</div><h2>Your progress lives here.</h2><p>Create a FlowKeys account to save WPM, maths scores, physics lessons, XP and streaks.</p><button className="primary" onClick={() => setAuthOpen(true)}>Log in / Sign up →</button></div> : <><div className="statGrid"><Stat label="TOTAL XP" value={stats?.profile.xp ?? 0} icon="⚡"/><Stat label="DAY STREAK" value={`${stats?.profile.streak ?? 0} days`} icon="🔥"/><Stat label="BEST WPM" value={Math.round(stats?.profile.best_wpm ?? 0)} icon="⌨️"/><Stat label="LEVEL" value={Math.floor((stats?.profile.xp ?? 0) / 100) + 1} icon="🏆"/></div><div className="dashboardGrid"><div className="dashCard"><div className="dashLabel">LEARNING ACTIVITY</div><h2>You're building momentum.</h2><div className="activityRow"><span>⌨️ Typing tests</span><b>{stats?.typingCount ?? 0}</b></div><div className="activityRow"><span>➗ Maths attempts</span><b>{stats?.mathCount ?? 0}</b></div><div className="activityRow"><span>⚛️ Physics lessons</span><b>{stats?.physicsDone ?? 0} / {physics.length}</b></div></div><div className="dashCard dark"><div className="dashLabel">NEXT WIN</div><h2>{stats?.profile.best_wpm ? 'Beat your typing record.' : 'Complete your first typing test.'}</h2><p>Small sessions compound. Keep your streak alive and collect XP as you learn.</p><button className="secondary" onClick={() => setTab('typing')}>Practice now →</button></div></div></>}</section>}

    {tab === 'typing' && <section className="page"><Header title="Typing Lab" subtitle="Train your accuracy first. Speed follows."/><div className="typingTop"><div><span>TIME</span><b>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</b></div><div><span>WPM</span><b>{started ? wpm : 0}</b></div><div><span>ACCURACY</span><b>{accuracy}%</b></div><button className="primary" onClick={startTyping}>{started ? 'Restart test' : 'Start test'}</button></div><div className="typingBox"><p>{typingText.split('').map((c, i) => <span className={i < typed.length ? (typed[i] === c ? 'correct' : 'wrong') : ''} key={i}>{c}</span>)}</p><textarea autoFocus value={typed} onChange={e => { if (!started) setStarted(true); setTyped(e.target.value.slice(0, typingText.length)) }} placeholder="Start typing here…"/></div><div className="saveHint">{userEmail ? (saving ? 'Saving result…' : '✓ Results will be saved automatically when you finish.') : 'Log in to save your results and earn XP.'}</div><div className="practiceCards"><Card icon="🎯" title="Accuracy first" text="Aim for 95%+ accuracy before chasing speed."/><Card icon="🔥" title="Daily streak" text="A few focused minutes every day compounds fast."/><Card icon="⌨️" title="Home row" text="Keep your fingers anchored on ASDF and JKL;."/></div></section>}

    {tab === 'maths' && <section className="page"><Header title="Maths Arena" subtitle="Solve. Check. Level up."/><div className="mathLayout"><div className="mathCard"><div className="level">LEVEL 1 · MULTIPLICATION</div><div className="problem">{math.a} <span>{math.op}</span> {math.b} = ?</div><input type="number" value={math.answer} onChange={e => setMath(m => ({ ...m, answer: e.target.value }))} onKeyDown={e => e.key === 'Enter' && checkMath()} placeholder="Your answer"/><button className="primary wide" onClick={checkMath}>Check answer</button><button className="skip" onClick={newMath}>Skip →</button></div><aside className="score"><span>SESSION SCORE</span><strong>{mathScore}</strong><p>{mathQuestions} questions attempted</p><div className="progress"><i style={{ width: `${Math.min(mathScore, 100)}%` }}/></div></aside></div><div className="saveHint">{userEmail ? '✓ Each answer is saved to your FlowKeys history.' : 'Log in to save attempts and earn XP.'}</div><div className="practiceCards"><Card icon="➕" title="Arithmetic" text="Build fluency with operations and mental maths."/><Card icon="📐" title="Geometry" text="Explore shapes, angles, area and volume."/><Card icon="🧠" title="Word problems" text="Turn real-world situations into equations."/></div></section>}

    {tab === 'physics' && <section className="page"><Header title="Physics, made simple" subtitle="Understand the idea first. The formula comes second."/><div className="topicGrid">{physics.map((p, i) => <button className={`topic ${topic === i ? 'selected' : ''}`} key={p.title} onClick={() => setTopic(i)}><span>{p.icon}</span><b>{p.title}</b><small>{p.text}</small></button>)}</div><div className="lesson"><div className="lessonIcon">{physics[topic].icon}</div><div><div className="level">REAL LIFE PHYSICS</div><h2>{physics[topic].title}</h2><p>{physics[topic].text}</p><div className="example"><b>💡 Imagine this</b><br/>{physics[topic].example}</div><div className="formula">{physics[topic].formula}</div><div><button className="lessonButton" onClick={completePhysics}>{userId ? 'Mark lesson complete +15 XP' : 'Log in to save lesson'}</button></div></div></div></section>}

    {authOpen && <AuthPanel onClose={() => { setAuthOpen(false); if (userId) loadStats(userId) }} />}
    <footer>FlowKeys · Learn a little. Improve a lot. ✦</footer>
  </main>
}

function Header({ title, subtitle }: { title: string; subtitle: string }) { return <div className="header"><div><div className="pill">FLOWKEYS LAB</div><h1>{title}</h1><p>{subtitle}</p></div></div> }
function Card({ icon, title, text }: { icon: string; title: string; text: string }) { return <div className="infoCard"><span>{icon}</span><div><b>{title}</b><p>{text}</p></div></div> }
function Stat({ label, value, icon }: { label: string; value: string | number; icon: string }) { return <div className="statCard"><span>{icon}</span><small>{label}</small><strong>{value}</strong></div> }