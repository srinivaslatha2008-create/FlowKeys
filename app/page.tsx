'use client'

import { useEffect, useMemo, useState } from 'react'
import AuthPanel from '@/components/AuthPanel'
import { createClient } from '@/lib/supabase/client'
import { mathProblemsByClass, typingPassagesIndia } from '@/data/learningContent'

const classes = Object.keys(mathProblemsByClass)
const typingDurations = [30, 60, 120]
const physicsTopics = [
  ['Motion', '🚗', 'How position changes with time.', 'Speed = Distance ÷ Time', 'A bike travels 120 m in 20 s.'],
  ['Velocity', '🧭', 'Speed with direction.', 'Velocity = Displacement ÷ Time', 'A car moves east at 20 m/s.'],
  ['Acceleration', '🏎️', 'Rate of change of velocity.', 'a = (v − u) ÷ t', 'A scooter increases from 5 to 15 m/s in 5 s.'],
  ['Force', '💥', 'A push or pull that can change motion.', 'F = ma', 'A shopping cart accelerates when pushed.'],
  ['Gravity', '🌍', 'Attraction between masses.', 'Weight = mg', 'A dropped ball accelerates toward Earth.'],
  ['Work', '📦', 'Energy transferred by a force through a distance.', 'W = Fd cos θ', 'Lifting a bag transfers energy to it.'],
  ['Energy', '⚡', 'Capacity to do work or cause change.', 'KE = ½mv²', 'A moving cricket ball has kinetic energy.'],
  ['Power', '🔋', 'How quickly work is done.', 'P = W ÷ t', 'A powerful machine transfers energy faster.'],
  ['Pressure', '🎈', 'Force distributed over an area.', 'P = F ÷ A', 'A sharp pin produces high pressure on a tiny area.'],
  ['Heat', '🔥', 'Energy transferred because of temperature difference.', 'Q = mcΔT', 'A hot cup warms a cooler spoon.'],
  ['Light', '💡', 'Electromagnetic radiation carrying energy.', 'v = fλ', 'A mirror changes the direction of light.'],
  ['Electricity', '🔌', 'Electric circuits use potential difference to drive current.', 'V = IR', 'A battery drives current through a lamp.'],
]

type User = { id: string; email?: string }

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/,/g, '')
}

function typingStats(typed: string, target: string, durationSeconds: number) {
  let correct = 0
  const limit = Math.min(typed.length, target.length)
  for (let i = 0; i < limit; i++) if (typed[i] === target[i]) correct++
  const minutes = Math.max(durationSeconds, 1) / 60
  const incorrect = Math.max(0, typed.length - correct)
  return { wpm: Math.round((correct / 5) / minutes), accuracy: typed.length ? Math.round((correct / typed.length) * 100) : 100, correct, incorrect }
}

export default function Home() {
  const supabase = createClient()
  const [tab, setTab] = useState('home')
  const [user, setUser] = useState<User | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [duration, setDuration] = useState(60)
  const [seconds, setSeconds] = useState(60)
  const [started, setStarted] = useState(false)
  const [typed, setTyped] = useState('')
  const [passageIndex, setPassageIndex] = useState(0)
  const [typingMessage, setTypingMessage] = useState('Type the full paragraph exactly, then press Enter to continue.')
  const [typingDone, setTypingDone] = useState(0)

  const [mathClass, setMathClass] = useState('Class 7')
  const [mathIndex, setMathIndex] = useState(0)
  const [mathAnswer, setMathAnswer] = useState('')
  const [mathMessage, setMathMessage] = useState('')
  const [mathScore, setMathScore] = useState(0)
  const [mathSolved, setMathSolved] = useState(0)

  const [physicsIndex, setPhysicsIndex] = useState(0)
  const [physicsQuiz, setPhysicsQuiz] = useState('')
  const [physicsScore, setPhysicsScore] = useState(0)
  const [profileName, setProfileName] = useState('Student')
  const [bestWpm, setBestWpm] = useState(0)

  const passage = typingPassagesIndia[passageIndex]
  const currentMath = mathProblemsByClass[mathClass][mathIndex % mathProblemsByClass[mathClass].length]
  const currentPhysics = physicsTopics[physicsIndex]
  const typingLive = useMemo(() => typingStats(typed, passage, duration), [typed, passage, duration])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUser({ id: data.user.id, email: data.user.email })
      const { data: profile } = await supabase.from('profiles').select('display_name,best_wpm').eq('user_id', data.user.id).maybeSingle()
      if (profile) {
        setProfileName(profile.display_name || 'Student')
        setBestWpm(Number(profile.best_wpm || 0))
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ? { id: session.user.id, email: session.user.email } : null))
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (!started || seconds <= 0) return
    const timer = window.setInterval(() => setSeconds(value => value - 1), 1000)
    return () => window.clearInterval(timer)
  }, [started, seconds])

  useEffect(() => {
    if (started && seconds === 0) finishTyping(false)
  }, [seconds, started])

  function startTyping() {
    setTyped('')
    setSeconds(duration)
    setStarted(true)
    setTypingMessage('Type the paragraph below. When you finish it, press Enter for the next paragraph.')
  }

  async function finishTyping(manual: boolean) {
    const result = typingStats(typed, passage, duration)
    setStarted(false)
    if (manual) setTypingMessage('Paragraph completed! Loading the next India passage…')
    if (user && typed.length) {
      await supabase.from('typing_results').insert({ duration_seconds: duration, wpm: result.wpm, accuracy: result.accuracy, correct_chars: result.correct, incorrect_chars: result.incorrect })
      if (result.wpm > bestWpm) {
        setBestWpm(result.wpm)
        await supabase.from('profiles').update({ best_wpm: result.wpm }).eq('user_id', user.id)
      }
    }
  }

  function nextPassage() {
    setPassageIndex(value => (value + 1) % typingPassagesIndia.length)
    setTyped('')
    setStarted(false)
    setSeconds(duration)
    setTypingDone(value => Math.min(typingPassagesIndia.length, value + 1))
    setTypingMessage('Next India passage loaded. Start typing and press Enter after completing it.')
  }

  function handleTypingKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (normalizeAnswer(typed) === normalizeAnswer(passage)) {
      finishTyping(true)
      nextPassage()
    } else {
      setTypingMessage('Keep going — complete the entire paragraph before pressing Enter.')
    }
  }

  function newMathQuestion() {
    setMathIndex(value => value + 1)
    setMathAnswer('')
    setMathMessage('')
  }

  async function checkMath() {
    if (!mathAnswer.trim()) return setMathMessage('Type an answer first.')
    const correct = normalizeAnswer(mathAnswer) === normalizeAnswer(currentMath.answer)
    setMathSolved(value => value + 1)
    if (correct) setMathScore(value => value + 1)
    setMathMessage(correct ? `✅ Correct! ${currentMath.explanation}` : `❌ Correct answer: ${currentMath.answer}. ${currentMath.explanation}`)
    if (user) await supabase.from('math_results').insert({ topic: `${mathClass} • Curriculum`, difficulty: 'Level-based', score: correct ? 1 : 0, total_questions: 1 })
  }

  function chooseClass(value: string) {
    setMathClass(value)
    setMathIndex(0)
    setMathAnswer('')
    setMathMessage('')
    setMathScore(0)
    setMathSolved(0)
  }

  function physicsAnswer(value: string) {
    setPhysicsQuiz(value)
    if (value === 'yes') setPhysicsScore(score => score + 1)
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfileName('Student')
  }

  return (
    <>
      <nav className="nav">
        <div className="brand"><span className="logo">F</span> FlowKeys</div>
        <div className="navlinks"><button onClick={() => setTab('home')}>Home</button><button onClick={() => setTab('dashboard')}>Dashboard</button><button onClick={() => setTab('typing')}>Typing</button><button onClick={() => setTab('maths')}>Maths</button><button onClick={() => setTab('physics')}>Physics</button></div>
        {user ? <button className="profile" onClick={logout}>{profileName.slice(0, 2).toUpperCase()} · Log out</button> : <button className="profile" onClick={() => setAuthOpen(true)}>Log in</button>}
      </nav>

      <main className="page">
        {tab === 'home' && <section className="hero"><div><div className="pill">LEARN BY DOING</div><h1>Build skills.<br /><span>Find your flow.</span></h1><p className="lead">A real practice platform for typing, school mathematics, and physics — with level-based problems and continuous practice.</p><div className="actions"><button className="primary" onClick={() => setTab('typing')}>Start typing</button><button className="secondary" onClick={() => setTab('maths')}>Solve maths</button><button className="secondary" onClick={() => setTab('physics')}>Explore physics</button></div><div className="homeStats"><span><b>20</b> India passages</span><span><b>60</b> maths problems</span><span><b>12</b> physics chapters</span></div></div><div className="heroCard"><div className="orb">⌨️</div><p>TODAY'S CHALLENGE</p><h3>Choose your level. Practice without limits.</h3><div className="miniStat"><b>{bestWpm || '—'}</b><span>best WPM</span></div><button onClick={() => setTab('dashboard')}>View your progress →</button></div></section>}

        {tab === 'dashboard' && <section><div className="header"><div className="pill">STUDENT DASHBOARD</div><h1>Your learning flow.</h1><p>Welcome, {profileName}. Practice consistently and build your personal record.</p></div><div className="statGrid"><div className="statCard"><span>⌨️</span><small>BEST WPM</small><strong>{bestWpm || '—'}</strong></div><div className="statCard"><span>🇮🇳</span><small>PASSAGES</small><strong>{typingDone}/20</strong></div><div className="statCard"><span>🧮</span><small>MATH SCORE</small><strong>{mathScore}/{mathSolved}</strong></div><div className="statCard"><span>⚛️</span><small>PHYSICS QUIZ</small><strong>{physicsScore}</strong></div></div><div className="dashboardGrid"><div className="dashCard dark"><div className="dashLabel">RECOMMENDED</div><h2>{mathClass} Mathematics</h2><p>10 curriculum problems are ready at this level.</p><button className="lessonButton" onClick={() => setTab('maths')}>Practice now</button></div><div className="dashCard"><div className="dashLabel">TYPING JOURNEY</div><h2>20 India passages</h2><p>Heritage, democracy, technology, economy, science and global influence.</p><button className="primary" onClick={() => setTab('typing')}>Continue typing</button></div></div></section>}

        {tab === 'typing' && <section><div className="header"><div className="pill">INDIA TYPING JOURNEY</div><h1>Type. Learn. Continue.</h1><p>20 long-form India passages. Finish one and press <b>Enter</b> to continue automatically to the next paragraph.</p></div><div className="typingControls"><div className="durationGroup"><span>TIME</span>{typingDurations.map(value => <button key={value} className={duration === value ? 'active' : ''} onClick={() => { setDuration(value); setSeconds(value); setStarted(false) }}>{value}s</button>)}</div><button className="secondary" onClick={nextPassage}>Skip passage →</button></div><div className="typingTop"><div><span>PASSAGE</span><b>{passageIndex + 1}/20</b></div><div><span>TIME</span><b>{seconds}s</b></div><div><span>LIVE WPM</span><b>{typingLive.wpm}</b></div><button className="primary" onClick={startTyping}>{started ? 'Restart' : 'Start test'}</button></div><div className="typingBox"><div className="passageMeta"><span>INDIA • PARAGRAPH {passageIndex + 1}</span><span>{passage.length} CHARACTERS</span></div><div className="typingText">{passage.split('').map((char, index) => <span key={`${passageIndex}-${index}`} className={index < typed.length ? typed[index] === char ? 'correct' : 'wrong' : index === typed.length ? 'current' : ''}>{char}</span>)}</div><textarea value={typed} onChange={e => { setTyped(e.target.value); if (!started) setStarted(true) }} onKeyDown={handleTypingKey} placeholder="Start typing the paragraph here…" spellCheck={false} autoCapitalize="off" /><p className="saveHint">{typingMessage}</p><div className="homeStats"><span><b>{typingLive.accuracy}%</b> accuracy</span><span><b>{typingLive.correct}</b> correct characters</span><span><b>{typingLive.incorrect}</b> incorrect</span></div></div></section>}

        {tab === 'maths' && <section><div className="header"><div className="pill">LEVEL-BASED MATHEMATICS</div><h1>Maths, from Class 7 to 12.</h1><p>Select a class and solve curriculum-style problems. Every level has 10 problems and can be practiced repeatedly.</p></div><div className="filters"><label>CLASS LEVEL<select value={mathClass} onChange={e => chooseClass(e.target.value)}>{classes.map(item => <option key={item}>{item}</option>)}</select></label></div><div className="topicChips">{classes.map(item => <button key={item} className={item === mathClass ? 'selectedChip' : ''} onClick={() => chooseClass(item)}>{item}</button>)}</div><div className="mathLayout"><div className="mathCard"><div className="pill">PROBLEM {mathIndex % 10 + 1} / 10</div><div className="problemText">{currentMath.question}</div><input value={mathAnswer} onChange={e => setMathAnswer(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') checkMath() }} placeholder="Type your answer" /><button className="primary wide" onClick={checkMath}>Check answer</button><button className="skip" onClick={newMathQuestion}>Next problem →</button>{mathMessage && <div className={`feedback ${normalizeAnswer(mathAnswer) === normalizeAnswer(currentMath.answer) ? 'good' : 'bad'}`}>{mathMessage}</div>}</div><aside className="score"><span>{mathClass.toUpperCase()}</span><strong>{mathScore}</strong><p>Correct answers this session.</p><div className="progress"><i style={{ width: `${mathSolved ? Math.min(100, (mathScore / mathSolved) * 100) : 0}%` }} /></div><div className="scoreNote">Problems are organized by Class 7, 8, 9, 10, 11 and 12 so students can practice at an appropriate level.</div></aside></div></section>}

        {tab === 'physics' && <section><div className="header"><div className="pill">PHYSICS LAB</div><h1>Understand the world.</h1><p>Learn the concept, connect it to a real situation, remember the formula, and test yourself.</p></div><div className="topicGrid">{physicsTopics.map((topic, index) => <button key={topic[0]} className={`topic ${index === physicsIndex ? 'selected' : ''}`} onClick={() => { setPhysicsIndex(index); setPhysicsQuiz('') }}><span>{topic[1]}</span><b>{topic[0]}</b><small>{topic[2]}</small></button>)}</div><div className="lesson"><div className="lessonIcon">{currentPhysics[1]}</div><div><div className="pill">CHAPTER {physicsIndex + 1} / 12</div><h2>{currentPhysics[0]}</h2><p>{currentPhysics[2]}</p><div className="example"><b>REAL-WORLD EXAMPLE</b><br />{currentPhysics[4]}</div><div className="formulaRow"><span className="formula">{currentPhysics[3]}</span><span className="unitBadge">FORMULA</span></div><div className="quiz"><div className="quizLabel">QUICK CHECK</div><h3>Does this concept help explain everyday situations?</h3><div className="optionGrid"><button onClick={() => physicsAnswer('yes')}>Yes — absolutely</button><button onClick={() => physicsAnswer('no')}>Not sure yet</button></div>{physicsQuiz && <div className="quizFeedback">{physicsQuiz === 'yes' ? '✅ Correct. Connecting physics to real situations is the goal.' : '💡 Review the example and formula, then try the next chapter.'}</div>}</div><div className="lessonActions"><button className="lessonButton" onClick={() => { setPhysicsIndex(value => (value + physicsTopics.length - 1) % physicsTopics.length); setPhysicsQuiz('') }}>← Previous</button><button className="lessonButton" onClick={() => { setPhysicsIndex(value => (value + 1) % physicsTopics.length); setPhysicsQuiz('') }}>Next chapter →</button></div></div></div></section>}
      </main>
      <footer>FlowKeys · Learn a little. Improve a lot.</footer>
      {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} />}
    </>
  )
}
