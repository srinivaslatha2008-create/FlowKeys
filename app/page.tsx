'use client'

import { useEffect, useMemo, useState } from 'react'

const typingText = 'Learning to type is learning to think faster. Keep your eyes on the words and let your fingers find the keys.'
const physics = [
  { title: 'Motion', icon: '🚗', text: 'Motion means an object changes its position with time.', example: 'A bike moving from your house to school is in motion.', formula: 'Speed = Distance ÷ Time' },
  { title: 'Force', icon: '💥', text: 'A force is a push or a pull that can change motion.', example: 'Pushing a shopping cart applies force.', formula: 'Force = Mass × Acceleration' },
  { title: 'Gravity', icon: '🌍', text: 'Gravity attracts objects toward Earth.', example: 'A ball falls down because Earth pulls it.', formula: 'Weight = Mass × g' },
  { title: 'Energy', icon: '⚡', text: 'Energy is the ability to do work or cause change.', example: 'Food gives your body chemical energy.', formula: 'Kinetic Energy = ½mv²' },
]

export default function Home() {
  const [tab, setTab] = useState('home')
  const [seconds, setSeconds] = useState(60)
  const [started, setStarted] = useState(false)
  const [typed, setTyped] = useState('')
  const [math, setMath] = useState({ a: 7, b: 8, op: '×', answer: '' })
  const [mathScore, setMathScore] = useState(0)
  const [topic, setTopic] = useState(0)

  useEffect(() => {
    if (!started || seconds <= 0) return
    const t = setInterval(() => setSeconds(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [started, seconds])

  const accuracy = useMemo(() => {
    if (!typed.length) return 100
    let correct = 0
    for (let i = 0; i < typed.length; i++) if (typed[i] === typingText[i]) correct++
    return Math.round(correct / typed.length * 100)
  }, [typed])
  const wpm = Math.round(typed.trim().split(/\s+/).filter(Boolean).length / Math.max((60 - seconds) / 60, 1/60))

  function newMath() {
    const a = Math.floor(Math.random()*12)+2, b = Math.floor(Math.random()*12)+2
    setMath({ a, b, op: '×', answer: '' })
  }
  function checkMath() {
    if (Number(math.answer) === math.a * math.b) setMathScore(s => s + 10)
    newMath()
  }

  return <main>
    <nav className="nav"><div className="brand"><span className="logo">F</span><span>FlowKeys</span></div><div className="navlinks"><button onClick={() => setTab('home')}>Home</button><button onClick={() => setTab('typing')}>Typing</button><button onClick={() => setTab('maths')}>Maths</button><button onClick={() => setTab('physics')}>Physics</button></div><button className="profile">JD</button></nav>

    {tab === 'home' && <section className="hero page"><div><div className="pill">✦ Learn by doing</div><h1>Build skills.<br/><span>Find your flow.</span></h1><p className="lead">Practice typing, sharpen your maths, and understand physics — one small win at a time.</p><div className="actions"><button className="primary" onClick={() => setTab('typing')}>Start practicing →</button><button className="secondary" onClick={() => setTab('physics')}>Explore Physics</button></div></div><div className="heroCard"><div className="orb">⌨️</div><p>Today's challenge</p><h3>Type for 60 seconds</h3><div className="miniStat"><b>42</b><span>WPM personal best</span></div><button onClick={() => setTab('typing')}>Try challenge →</button></div></section>}

    {tab === 'typing' && <section className="page"><Header title="Typing Lab" subtitle="Train your accuracy first. Speed follows."/><div className="typingTop"><div><span>TIME</span><b>{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</b></div><div><span>WPM</span><b>{started ? wpm : 0}</b></div><div><span>ACCURACY</span><b>{accuracy}%</b></div><button className="primary" onClick={() => {setStarted(true);setSeconds(60);setTyped('')}}>{started ? 'Restart test' : 'Start test'}</button></div><div className="typingBox"><p>{typingText.split('').map((c,i)=><span className={i < typed.length ? (typed[i]===c?'correct':'wrong') : ''} key={i}>{c}</span>)}</p><textarea autoFocus value={typed} onChange={e => {setStarted(true);setTyped(e.target.value.slice(0, typingText.length))}} placeholder="Start typing here…"/></div><div className="practiceCards"><Card icon="🎯" title="Accuracy first" text="Aim for 95%+ accuracy before chasing speed."/><Card icon="🔥" title="Daily streak" text="A few focused minutes every day compounds fast."/><Card icon="⌨️" title="Home row" text="Keep your fingers anchored on ASDF and JKL;."/></div></section>}

    {tab === 'maths' && <section className="page"><Header title="Maths Arena" subtitle="Solve. Check. Level up."/><div className="mathLayout"><div className="mathCard"><div className="level">LEVEL 1 · MULTIPLICATION</div><div className="problem">{math.a} <span>{math.op}</span> {math.b} = ?</div><input type="number" value={math.answer} onChange={e=>setMath(m=>({...m,answer:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&checkMath()} placeholder="Your answer"/><button className="primary wide" onClick={checkMath}>Check answer</button><button className="skip" onClick={newMath}>Skip →</button></div><aside className="score"><span>YOUR SCORE</span><strong>{mathScore}</strong><p>+10 for every correct answer</p><div className="progress"><i style={{width:`${Math.min(mathScore,100)}%`}}/></div></aside></div><div className="practiceCards"><Card icon="➕" title="Arithmetic" text="Build fluency with operations and mental maths."/><Card icon="📐" title="Geometry" text="Explore shapes, angles, area and volume."/><Card icon="🧠" title="Word problems" text="Turn real-world situations into equations."/></div></section>}

    {tab === 'physics' && <section className="page"><Header title="Physics, made simple" subtitle="Understand the idea first. The formula comes second."/><div className="topicGrid">{physics.map((p,i)=><button className={`topic ${topic===i?'selected':''}`} key={p.title} onClick={()=>setTopic(i)}><span>{p.icon}</span><b>{p.title}</b><small>{p.text}</small></button>)}</div><div className="lesson"><div className="lessonIcon">{physics[topic].icon}</div><div><div className="level">REAL LIFE PHYSICS</div><h2>{physics[topic].title}</h2><p>{physics[topic].text}</p><div className="example"><b>💡 Imagine this</b><br/>{physics[topic].example}</div><div className="formula">{physics[topic].formula}</div></div></div></section>}

    <footer>FlowKeys · Learn a little. Improve a lot. ✦</footer>
  </main>
}

function Header({title,subtitle}:{title:string,subtitle:string}) { return <div className="header"><div><div className="pill">FLOWKEYS LAB</div><h1>{title}</h1><p>{subtitle}</p></div></div> }
function Card({icon,title,text}:{icon:string,title:string,text:string}) { return <div className="infoCard"><span>{icon}</span><div><b>{title}</b><p>{text}</p></div></div> }