'use client'

import { useEffect, useMemo, useState } from 'react'
import AuthPanel from '@/components/AuthPanel'
import { createClient } from '@/lib/supabase/client'

const typingPassages = [
  'Learning to type is learning to think faster. Keep your eyes on the words and let your fingers find the keys. Practice calmly, stay accurate, and let speed arrive naturally.',
  'Great software is built one small improvement at a time. Write clearly, test your ideas, learn from mistakes, and keep moving forward even when the first version is not perfect.',
  'Science becomes exciting when you connect a formula to the real world. A moving bicycle, a falling ball, a charging phone, and a glowing bulb can all become physics experiments.',
  'Mathematics is not only about getting an answer. It is about seeing patterns, asking better questions, choosing a method, and explaining why your solution makes sense.',
  'Your keyboard is an instrument for ideas. The more comfortable you become with typing, the less attention you spend on finding keys and the more attention you can give to creating.',
  'Every programmer starts with simple problems. Learn the basics deeply, build useful projects, read code written by others, and gradually turn difficult problems into smaller ones.',
]

const physicsLessons = [
  { title: 'Motion', icon: '🚗', text: 'Motion describes how an object changes position with time.', example: 'A bike travels 120 m in 20 s.', formula: 'Speed = Distance ÷ Time', unit: 'm/s' },
  { title: 'Velocity', icon: '🧭', text: 'Velocity is speed with a specified direction.', example: 'A car moves east at 20 m/s.', formula: 'Velocity = Displacement ÷ Time', unit: 'm/s' },
  { title: 'Acceleration', icon: '🏎️', text: 'Acceleration tells us how quickly velocity changes.', example: 'A scooter increases from 5 to 15 m/s in 5 s.', formula: 'a = (v − u) ÷ t', unit: 'm/s²' },
  { title: 'Force', icon: '💥', text: 'Force is a push or pull that can change an object’s motion.', example: 'Pushing a shopping cart changes its motion.', formula: 'F = ma', unit: 'N' },
  { title: 'Gravity', icon: '🌍', text: 'Gravity attracts masses toward one another.', example: 'A dropped ball accelerates toward Earth.', formula: 'Weight = mg', unit: 'N' },
  { title: 'Work', icon: '📦', text: 'Work is done when a force causes displacement in its direction.', example: 'Lifting a bag upward transfers energy to it.', formula: 'W = Fd cos θ', unit: 'J' },
  { title: 'Energy', icon: '⚡', text: 'Energy is the capacity to do work or cause change.', example: 'A moving cricket ball has kinetic energy.', formula: 'KE = ½mv²', unit: 'J' },
  { title: 'Power', icon: '🔋', text: 'Power measures how quickly work is done or energy is transferred.', example: 'A faster machine can transfer the same energy in less time.', formula: 'P = W ÷ t', unit: 'W' },
  { title: 'Pressure', icon: '🎈', text: 'Pressure is force distributed over an area.', example: 'A sharp pin creates high pressure over a tiny area.', formula: 'P = F ÷ A', unit: 'Pa' },
  { title: 'Heat', icon: '🔥', text: 'Heat is energy transferred because of a temperature difference.', example: 'A hot cup warms a cooler spoon.', formula: 'Q = mcΔT', unit: 'J' },
  { title: 'Light', icon: '💡', text: 'Light is electromagnetic radiation that carries energy.', example: 'A mirror changes the direction of reflected light.', formula: 'v = fλ', unit: 'm/s' },
  { title: 'Electricity', icon: '🔌', text: 'Electric circuits use potential difference to drive current through components.', example: 'A battery drives current through a lamp.', formula: 'V = IR', unit: 'V' },
]

const mathTopics = ['Arithmetic', 'Fractions', 'Percentages', 'Algebra', 'Geometry', 'Ratio', 'Speed & Distance', 'Exponents']

type Profile = { display_name: string | null; xp: number; streak: number; best_wpm: number }
type Stats = { profile: Profile; typingCount: number; mathCount: number; physicsDone: number }
type MathQuestion = { topic: string; question: string; answer: number; explanation: string }
type PhysicsQuestion = { topic: string; question: string; answer: string; options: string[]; explanation: string }

function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function shuffle<T>(items: T[]) { return [...items].sort(() => Math.random() - 0.5) }

function makeMathQuestion(topic: string, difficulty: string): MathQuestion {
  const boost = difficulty === 'Hard' ? 2 : difficulty === 'Medium' ? 1 : 0
  if (topic === 'Fractions') {
    const d = randomInt(2, 8 + boost * 3), a = randomInt(1, d - 1), b = randomInt(1, d - 1)
    return { topic, question: `What is ${a}/${d} + ${b}/${d}? Give the decimal answer.`, answer: Number(((a + b) / d).toFixed(4)), explanation: `Same denominator: (${a} + ${b})/${d} = ${((a + b) / d).toFixed(2)}.` }
  }
  if (topic === 'Percentages') {
    const percent = randomInt(5, 50), value = randomInt(4, 20) * 10
    return { topic, question: `What is ${percent}% of ${value}?`, answer: percent * value / 100, explanation: `${percent}% means ${percent}/100, so ${value} × ${percent}/100 = ${percent * value / 100}.` }
  }
  if (topic === 'Algebra') {
    const x = randomInt(2, 15 + boost * 10), a = randomInt(2, 9), b = randomInt(1, 20)
    return { topic, question: `Solve for x: ${a}x + ${b} = ${a * x + b}.`, answer: x, explanation: `Subtract ${b}, then divide by ${a}. The answer is x = ${x}.` }
  }
  if (topic === 'Geometry') {
    const length = randomInt(4, 20 + boost * 10), width = randomInt(3, 15 + boost * 5)
    return { topic, question: `A rectangle is ${length} cm long and ${width} cm wide. What is its area in cm²?`, answer: length * width, explanation: `Area = length × width = ${length} × ${width} = ${length * width} cm².` }
  }
  if (topic === 'Ratio') {
    const a = randomInt(2, 9), b = randomInt(2, 9), total = (a + b) * randomInt(2, 8)
    return { topic, question: `A total of ${total} is split in the ratio ${a}:${b}. What is the first share?`, answer: total * a / (a + b), explanation: `Total parts = ${a + b}. First share = ${total} × ${a}/${a + b} = ${total * a / (a + b)}.` }
  }
  if (topic === 'Speed & Distance') {
    const speed = randomInt(20, 80), time = randomInt(2, 6)
    return { topic, question: `A vehicle travels at ${speed} km/h for ${time} hours. What distance does it cover?`, answer: speed * time, explanation: `Distance = speed × time = ${speed} × ${time} = ${speed * time} km.` }
  }
  if (topic === 'Exponents') {
    const base = randomInt(2, 6), power = randomInt(2, 3 + boost)
    return { topic, question: `Calculate ${base}^${power}.`, answer: base ** power, explanation: `${base} multiplied by itself ${power} times equals ${base ** power}.` }
  }
  const a = randomInt(2, 12 + boost * 8), b = randomInt(2, 12 + boost * 8), op = shuffle(['+', '−', '×'])[0]
  const answer = op === '+' ? a + b : op === '−' ? a - b : a * b
  return { topic: 'Arithmetic', question: `Calculate ${a} ${op} ${b}.`, answer, explanation: `${a} ${op} ${b} = ${answer}.` }
}

function makePhysicsQuestion(topic: string): PhysicsQuestion {
  const bank: Record<string, PhysicsQuestion[]> = {
    Motion: [
      { topic, question: 'A runner covers 100 m in 20 s. What is the speed?', answer: '5 m/s', options: ['2 m/s', '5 m/s', '20 m/s', '50 m/s'], explanation: 'Speed = distance ÷ time = 100 ÷ 20 = 5 m/s.' },
      { topic, question: 'Which quantity tells how far an object moves per unit time?', answer: 'Speed', options: ['Mass', 'Speed', 'Force', 'Power'], explanation: 'Speed is distance travelled per unit time.' },
    ],
    Velocity: [
      { topic, question: 'Velocity differs from speed because velocity includes…', answer: 'Direction', options: ['Mass', 'Direction', 'Temperature', 'Pressure'], explanation: 'Velocity has magnitude and direction.' },
      { topic, question: 'A car travels 60 m east in 3 s. Its velocity is…', answer: '20 m/s east', options: ['20 m/s east', '20 m/s', '180 m/s east', '63 m/s'], explanation: 'Displacement ÷ time = 60 ÷ 3 = 20 m/s east.' },
    ],
    Acceleration: [
      { topic, question: 'Velocity changes from 5 m/s to 15 m/s in 5 s. What is acceleration?', answer: '2 m/s²', options: ['1 m/s²', '2 m/s²', '4 m/s²', '10 m/s²'], explanation: 'a = (15 − 5) ÷ 5 = 2 m/s².' },
      { topic, question: 'What happens to acceleration when velocity changes more rapidly?', answer: 'It increases', options: ['It decreases', 'It increases', 'It becomes mass', 'Nothing'], explanation: 'Acceleration measures the rate of change of velocity.' },
    ],
    Force: [
      { topic, question: 'What force acts on a 4 kg object accelerating at 3 m/s²?', answer: '12 N', options: ['1.3 N', '7 N', '12 N', '24 N'], explanation: 'F = ma = 4 × 3 = 12 N.' },
      { topic, question: 'The SI unit of force is…', answer: 'Newton', options: ['Joule', 'Watt', 'Newton', 'Pascal'], explanation: 'Force is measured in newtons (N).' },
    ],
    Gravity: [
      { topic, question: 'Using g = 10 m/s², what is the weight of a 5 kg object?', answer: '50 N', options: ['5 N', '10 N', '50 N', '500 N'], explanation: 'Weight = mg = 5 × 10 = 50 N.' },
      { topic, question: 'Gravity on Earth pulls objects generally…', answer: 'Toward Earth', options: ['Away from Earth', 'Toward Earth', 'Sideways only', 'Nowhere'], explanation: 'Earth attracts objects toward its centre.' },
    ],
    Work: [
      { topic, question: 'A 20 N force moves an object 3 m in the same direction. Work done?', answer: '60 J', options: ['6 J', '17 J', '60 J', '600 J'], explanation: 'W = Fd = 20 × 3 = 60 J.' },
      { topic, question: 'The SI unit of work is…', answer: 'Joule', options: ['Newton', 'Joule', 'Watt', 'Volt'], explanation: 'Work is measured in joules (J).' },
    ],
    Energy: [
      { topic, question: 'What is the kinetic energy of a 2 kg object moving at 4 m/s?', answer: '16 J', options: ['4 J', '8 J', '16 J', '32 J'], explanation: 'KE = ½mv² = ½ × 2 × 4² = 16 J.' },
      { topic, question: 'Energy stored because of position is called…', answer: 'Potential energy', options: ['Kinetic energy', 'Potential energy', 'Sound', 'Current'], explanation: 'Potential energy depends on position or configuration.' },
    ],
    Power: [
      { topic, question: 'A machine does 600 J of work in 20 s. Its power is…', answer: '30 W', options: ['20 W', '30 W', '120 W', '620 W'], explanation: 'P = W ÷ t = 600 ÷ 20 = 30 W.' },
      { topic, question: 'Power measures how quickly…', answer: 'Work is done', options: ['Mass changes', 'Work is done', 'Temperature freezes', 'Distance disappears'], explanation: 'Power is the rate of doing work or transferring energy.' },
    ],
    Pressure: [
      { topic, question: 'A 100 N force acts over 5 m². What pressure is produced?', answer: '20 Pa', options: ['5 Pa', '20 Pa', '95 Pa', '500 Pa'], explanation: 'P = F ÷ A = 100 ÷ 5 = 20 Pa.' },
      { topic, question: 'For the same force, decreasing area makes pressure…', answer: 'Increase', options: ['Increase', 'Decrease', 'Stay zero', 'Become mass'], explanation: 'Pressure = force ÷ area, so smaller area gives greater pressure.' },
    ],
    Heat: [
      { topic, question: 'Heat naturally transfers from a…', answer: 'Hotter object to cooler object', options: ['Cooler object to hotter object', 'Hotter object to cooler object', 'Vacuum to mass', 'Smaller object to larger object'], explanation: 'Thermal energy transfers from hotter to cooler regions.' },
      { topic, question: 'Temperature is related to the average…', answer: 'Kinetic energy of particles', options: ['Mass of a body', 'Kinetic energy of particles', 'Number of planets', 'Electric charge only'], explanation: 'Temperature is related to average particle kinetic energy.' },
    ],
    Light: [
      { topic, question: 'The bouncing of light from a surface is called…', answer: 'Reflection', options: ['Refraction', 'Reflection', 'Conduction', 'Convection'], explanation: 'Reflection is light bouncing from a surface.' },
      { topic, question: 'The relationship v = fλ connects wave speed, frequency and…', answer: 'Wavelength', options: ['Mass', 'Pressure', 'Wavelength', 'Force'], explanation: 'λ represents wavelength.' },
    ],
    Electricity: [
      { topic, question: 'If R = 5 Ω and I = 2 A, what is V?', answer: '10 V', options: ['2.5 V', '7 V', '10 V', '25 V'], explanation: 'Ohm’s law: V = IR = 2 × 5 = 10 V.' },
      { topic, question: 'Electric current is measured in…', answer: 'Ampere', options: ['Volt', 'Ohm', 'Ampere', 'Watt'], explanation: 'Current is measured in amperes (A).' },
    ],
  }
  return shuffle(bank[topic] ?? bank.Motion)[0]
}

export default function Home() {
  const supabase = createClient()
  const [tab, setTab] = useState('home')
  const [duration, setDuration] = useState(60)
  const [seconds, setSeconds] = useState(60)
  const [started, setStarted] = useState(false)
  const [typed, setTyped] = useState('')
  const [passageIndex, setPassageIndex] = useState(0)
  const [mathTopic, setMathTopic] = useState('Arithmetic')
  const [mathDifficulty, setMathDifficulty] = useState('Easy')
  const [math, setMath] = useState<MathQuestion>(() => makeMathQuestion('Arithmetic', 'Easy'))
  const [mathScore, setMathScore] = useState(0)
  const [mathQuestions, setMathQuestions] = useState(0)
  const [mathStreak, setMathStreak] = useState(0)
  const [physicsTopic, setPhysicsTopic] = useState('Motion')
  const [physics, setPhysics] = useState<PhysicsQuestion>(() => makePhysicsQuestion('Motion'))
  const [physicsScore, setPhysicsScore] = useState(0)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  const typingText = typingPassages[passageIndex]
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUserEmail(data.user?.email ?? null); setUserId(data.user?.id ?? null) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { setUserEmail(session?.user?.email ?? null); setUserId(session?.user?.id ?? null); if (!session) setStats(null) })
    return () => listener.subscription.unsubscribe()
  }, [supabase])
  useEffect(() => { if (userId) loadStats(userId) }, [userId])
  useEffect(() => { if (!started || seconds <= 0) return; const t = setInterval(() => setSeconds(s => s - 1), 1000); return () => clearInterval(t) }, [started, seconds])
  useEffect(() => { if (started && seconds === 0) finishTyping() }, [seconds, started])

  const accuracy = useMemo(() => {
    if (!typed.length) return 100
    let correct = 0
    for (let i = 0; i < typed.length; i++) if (typed[i] === typingText[i]) correct++
    return Math.round(correct / typed.length * 100)
  }, [typed, typingText])
  const elapsed = Math.max(duration - seconds, 1)
  const wpm = Math.round(typed.trim().split(/\s+/).filter(Boolean).length / (elapsed / 60))

  async function loadStats(id: string) {
    const [{ data: profile }, { count: typingCount }, { count: mathCount }, { data: physicsData }] = await Promise.all([
      supabase.from('profiles').select('display_name,xp,streak,best_wpm').eq('user_id', id).maybeSingle(),
      supabase.from('typing_results').select('id', { count: 'exact', head: true }).eq('user_id', id),
      supabase.from('math_results').select('id', { count: 'exact', head: true }).eq('user_id', id),
      supabase.from('physics_progress').select('completed').eq('user_id', id),
    ])
    if (profile) setStats({ profile, typingCount: typingCount ?? 0, mathCount: mathCount ?? 0, physicsDone: physicsData?.filter(p => p.completed).length ?? 0 })
  }
  async function awardXp(points: number, bestWpm?: number) {
    if (!userId) return
    const { data: profile } = await supabase.from('profiles').select('xp,streak,best_wpm').eq('user_id', userId).maybeSingle()
    if (!profile) await supabase.from('profiles').upsert({ user_id: userId, display_name: userEmail?.split('@')[0] ?? 'Student', xp: points, streak: 1, best_wpm: bestWpm ?? 0 })
    else await supabase.from('profiles').update({ xp: Number(profile.xp ?? 0) + points, best_wpm: Math.max(Number(profile.best_wpm ?? 0), bestWpm ?? 0) }).eq('user_id', userId)
    await loadStats(userId)
  }
  async function finishTyping() {
    if (!userId || !typed.trim() || saving) return
    setSaving(true)
    const correctChars = typed.split('').filter((c, i) => c === typingText[i]).length
    await supabase.from('typing_results').insert({ user_id: userId, duration_seconds: Math.max(duration - seconds, 1), wpm, accuracy, correct_chars: correctChars, incorrect_chars: typed.length - correctChars })
    await awardXp(Math.max(10, Math.round(wpm / 2)), wpm)
    setSaving(false); setStarted(false)
  }
  function startTyping() { setStarted(true); setSeconds(duration); setTyped(''); setFeedback('') }
  function changeDuration(value: number) { setDuration(value); setSeconds(value); setStarted(false); setTyped('') }
  function newPassage() { let next = randomInt(0, typingPassages.length - 1); if (next === passageIndex) next = (next + 1) % typingPassages.length; setPassageIndex(next); setTyped(''); setSeconds(duration); setStarted(false) }
  function newMath() { setMath(makeMathQuestion(mathTopic, mathDifficulty)); setFeedback(''); const input = document.getElementById('math-answer') as HTMLInputElement | null; if (input) input.value = '' }
  async function checkMath() {
    const value = Number((document.getElementById('math-answer') as HTMLInputElement)?.value)
    const correct = Math.abs(value - math.answer) < 0.001
    setFeedback(correct ? `✓ Correct! ${math.explanation}` : `Not quite. ${math.explanation}`)
    setMathQuestions(q => q + 1); setMathScore(s => s + (correct ? 10 : 0)); setMathStreak(correct ? s => s + 1 : 0)
    if (userId) { await supabase.from('math_results').insert({ user_id: userId, topic: math.topic, difficulty: mathDifficulty.toLowerCase(), score: correct ? 10 : 0, total_questions: 1 }); await awardXp(correct ? 10 : 2) }
  }
  function changeMathSettings(topic: string, difficulty: string) { setMathTopic(topic); setMathDifficulty(difficulty); setMath(makeMathQuestion(topic, difficulty)); setFeedback('') }
  function nextPhysics() { setPhysics(makePhysicsQuestion(physicsTopic)); setFeedback('') }
  async function answerPhysics(option: string) {
    const correct = option === physics.answer
    setFeedback(correct ? `✓ Correct! ${physics.explanation}` : `Not quite. ${physics.explanation}`)
    if (correct) setPhysicsScore(s => s + 10)
    if (userId && correct) await awardXp(8)
  }
  async function completePhysics() {
    if (!userId) { setAuthOpen(true); return }
    await supabase.from('physics_progress').upsert({ user_id: userId, topic: physicsTopic.toLowerCase(), completed: true, quiz_score: physicsScore, updated_at: new Date().toISOString() }, { onConflict: 'user_id,topic' })
    await awardXp(15); setFeedback('✓ Chapter completed. +15 XP added to your account.')
  }
  async function logout() { await supabase.auth.signOut(); setUserEmail(null); setUserId(null); setStats(null); setTab('home') }

  return <main>
    <nav className="nav"><div className="brand"><span className="logo">F</span><span>FlowKeys</span></div><div className="navlinks"><button onClick={() => setTab('home')}>Home</button><button onClick={() => setTab('dashboard')}>Dashboard</button><button onClick={() => setTab('typing')}>Typing</button><button onClick={() => setTab('maths')}>Maths</button><button onClick={() => setTab('physics')}>Physics</button></div><button className="profile" onClick={() => userEmail ? logout() : setAuthOpen(true)}>{userEmail ? userEmail.slice(0, 2).toUpperCase() : 'Log in'}</button></nav>

    {tab === 'home' && <section className="hero page"><div><div className="pill">✦ YOUR PERSONAL LEARNING LAB</div><h1>Practice more.<br/><span>Understand more.</span></h1><p className="lead">FlowKeys turns typing, mathematics and physics into short, interactive practice sessions with instant feedback, XP and progress tracking.</p><div className="actions"><button className="primary" onClick={() => setTab('maths')}>Solve a problem →</button><button className="secondary" onClick={() => setTab('physics')}>Explore Physics</button></div><div className="homeStats"><span><b>8</b> maths tracks</span><span><b>12</b> physics chapters</span><span><b>6</b> typing passages</span></div></div><div className="heroCard"><div className="orb">🧠</div><p>DAILY LEARNING LOOP</p><h3>Type → Solve → Understand</h3><div className="miniStat"><b>∞</b><span>New questions are generated from multiple topics and difficulty levels.</span></div><button onClick={() => setTab('dashboard')}>Open my dashboard →</button></div></section>}

    {tab === 'dashboard' && <section className="page"><Header title="Your dashboard" subtitle={userEmail ? `Welcome back, ${stats?.profile.display_name ?? userEmail.split('@')[0]}. Keep the momentum going.` : 'Create an account to save your learning history.'}/>{!userEmail ? <div className="emptyState"><div className="orb">🔐</div><h2>Your progress lives here.</h2><p>Save WPM, maths attempts, physics lessons, XP and your personal best across devices.</p><button className="primary" onClick={() => setAuthOpen(true)}>Log in / Sign up →</button></div> : <><div className="statGrid"><Stat label="TOTAL XP" value={stats?.profile.xp ?? 0} icon="⚡"/><Stat label="DAY STREAK" value={`${stats?.profile.streak ?? 0} days`} icon="🔥"/><Stat label="BEST WPM" value={Math.round(stats?.profile.best_wpm ?? 0)} icon="⌨️"/><Stat label="LEVEL" value={Math.floor((stats?.profile.xp ?? 0) / 100) + 1} icon="🏆"/></div><div className="dashboardGrid"><div className="dashCard"><div className="dashLabel">LEARNING ACTIVITY</div><h2>Build a little every day.</h2><div className="activityRow"><span>⌨️ Typing tests</span><b>{stats?.typingCount ?? 0}</b></div><div className="activityRow"><span>➗ Maths attempts</span><b>{stats?.mathCount ?? 0}</b></div><div className="activityRow"><span>⚛️ Physics lessons</span><b>{stats?.physicsDone ?? 0} / {physicsLessons.length}</b></div></div><div className="dashCard dark"><div className="dashLabel">CURRENT SESSION</div><h2>{mathStreak > 1 ? `${mathStreak} maths answers in a row.` : 'Your next win is one problem away.'}</h2><p>Practice consistently, then use the dashboard to see your history grow.</p><button className="secondary" onClick={() => setTab('maths')}>Continue learning →</button></div></div></>}</section>}

    {tab === 'typing' && <section className="page"><Header title="Typing Lab" subtitle="Multiple passages, real multi-line practice, live WPM and accuracy."/><div className="typingControls"><div className="durationGroup"><span>TEST LENGTH</span>{[30, 60, 120].map(d => <button key={d} className={duration === d ? 'active' : ''} onClick={() => changeDuration(d)}>{d}s</button>)}</div><button className="secondary" onClick={newPassage}>New passage ↻</button></div><div className="typingTop"><div><span>TIME</span><b>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</b></div><div><span>WPM</span><b>{started ? wpm : 0}</b></div><div><span>ACCURACY</span><b>{accuracy}%</b></div><button className="primary" onClick={startTyping}>{started ? 'Restart test' : 'Start test'}</button></div><div className="typingBox"><div className="passageMeta"><span>PASSAGE {passageIndex + 1} / {typingPassages.length}</span><span>{typingText.split(/\s+/).length} words</span></div><div className="typingText">{typingText.split('').map((c, i) => <span className={i < typed.length ? (typed[i] === c ? 'correct' : 'wrong') : i === typed.length ? 'current' : ''} key={i}>{c}</span>)}</div><textarea autoFocus value={typed} onChange={e => { if (!started) setStarted(true); const value = e.target.value.slice(0, typingText.length); setTyped(value); if (value.length === typingText.length) setTimeout(finishTyping, 0) }} placeholder="Start typing here…" /></div><div className="saveHint">{userEmail ? (saving ? 'Saving result…' : '✓ Your result is saved when the test ends.') : 'Log in to save results and earn XP.'}</div><div className="practiceCards"><Card icon="🎯" title="Accuracy first" text="Aim for clean keystrokes before chasing WPM."/><Card icon="📄" title="Multiple passages" text="Rotate through different topics so practice never feels like one repeated line."/><Card icon="🔥" title="Daily practice" text="30–120 second sessions fit easily into a study routine."/></div></section>}

    {tab === 'maths' && <section className="page"><Header title="Maths Arena" subtitle="A growing problem engine across arithmetic, algebra, geometry and real-world maths."/><div className="filters"><label>TOPIC<select value={mathTopic} onChange={e => changeMathSettings(e.target.value, mathDifficulty)}>{mathTopics.map(t => <option key={t}>{t}</option>)}</select></label><label>DIFFICULTY<select value={mathDifficulty} onChange={e => changeMathSettings(mathTopic, e.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select></label><button className="secondary" onClick={newMath}>New problem ↻</button></div><div className="mathLayout"><div className="mathCard"><div className="level">{math.topic.toUpperCase()} · {mathDifficulty.toUpperCase()}</div><div className="problemText">{math.question}</div><input id="math-answer" type="number" placeholder="Type your answer" onKeyDown={e => e.key === 'Enter' && checkMath()} /><button className="primary wide" onClick={checkMath}>Check answer</button>{feedback && <div className={`feedback ${feedback.startsWith('✓') ? 'good' : 'bad'}`}>{feedback}</div>}<button className="skip" onClick={newMath}>Next problem →</button></div><aside className="score"><span>SESSION SCORE</span><strong>{mathScore}</strong><p>{mathQuestions} attempted · {mathStreak} correct streak</p><div className="progress"><i style={{ width: `${Math.min(mathScore, 100)}%` }}/></div><div className="scoreNote">Randomized combinations let you keep practicing instead of seeing one fixed question.</div></aside></div><div className="topicChips">{mathTopics.map(t => <button key={t} onClick={() => changeMathSettings(t, mathDifficulty)} className={mathTopic === t ? 'selectedChip' : ''}>{t}</button>)}</div></section>}

    {tab === 'physics' && <section className="page"><Header title="Physics Universe" subtitle="Learn the concept, see the formula, solve a question, then test yourself."/><div className="topicGrid">{physicsLessons.map(p => <button className={`topic ${physicsTopic === p.title ? 'selected' : ''}`} key={p.title} onClick={() => { setPhysicsTopic(p.title); setPhysics(makePhysicsQuestion(p.title)); setFeedback('') }}><span>{p.icon}</span><b>{p.title}</b><small>{p.text}</small></button>)}</div><div className="lesson"><div className="lessonIcon">{physicsLessons.find(p => p.title === physicsTopic)?.icon}</div><div><div className="level">{physicsTopic.toUpperCase()} · REAL WORLD PHYSICS</div><h2>{physicsTopic}</h2><p>{physicsLessons.find(p => p.title === physicsTopic)?.text}</p><div className="formulaRow"><span className="formula">{physicsLessons.find(p => p.title === physicsTopic)?.formula}</span><span className="unitBadge">SI: {physicsLessons.find(p => p.title === physicsTopic)?.unit}</span></div><div className="example"><b>💡 Real-world example</b><br/>{physicsLessons.find(p => p.title === physicsTopic)?.example}</div><div className="quiz"><div className="quizLabel">QUICK CHECK</div><h3>{physics.question}</h3><div className="optionGrid">{physics.options.map(o => <button key={o} onClick={() => answerPhysics(o)}>{o}</button>)}</div>{feedback && <div className="quizFeedback">{feedback}</div>}</div><div className="lessonActions"><button className="secondary" onClick={nextPhysics}>Another question ↻</button><button className="lessonButton" onClick={completePhysics}>{userId ? 'Complete chapter +15 XP' : 'Log in to save chapter'}</button></div></div></div><div className="physicsFooter"><b>{physicsScore} quiz points</b><span>12 core chapters · concepts + formulas + examples + quizzes</span></div></section>}

    {authOpen && <AuthPanel onClose={() => { setAuthOpen(false); if (userId) loadStats(userId) }} />}
    <footer>FlowKeys · Learn a little. Improve a lot. ✦</footer>
  </main>
}

function Header({ title, subtitle }: { title: string; subtitle: string }) { return <div className="header"><div><div className="pill">FLOWKEYS LAB</div><h1>{title}</h1><p>{subtitle}</p></div></div> }
function Card({ icon, title, text }: { icon: string; title: string; text: string }) { return <div className="infoCard"><span>{icon}</span><div><b>{title}</b><p>{text}</p></div></div> }
function Stat({ label, value, icon }: { label: string; value: string | number; icon: string }) { return <div className="statCard"><span>{icon}</span><small>{label}</small><strong>{value}</strong></div> }
