'use client'

import { useMemo, useState } from 'react'
import './maths.css'

type Problem = { question: string; answer: string; topic: string }
type Level = { title: string; subtitle: string; problems: Problem[] }

const levels: Level[] = [
  { title: 'Class 7', subtitle: 'Integers, Fractions, Simple Equations, Lines & Angles, Percentage', problems: [
    { topic: 'Integers', question: 'Simplify: (-15) + 8 - (-6) - 12', answer: '2' },
    { topic: 'Fractions', question: 'Evaluate: 3/4 + 5/6 - 1/3', answer: '13/12' },
    { topic: 'Simple Equations', question: 'Solve for x: 5x - 7 = 18', answer: 'x = 5' },
    { topic: 'Percentage', question: 'A shopkeeper marks an item at ₹500 and gives a 12% discount. Find the selling price.', answer: '₹440' },
    { topic: 'Lines & Angles', question: 'Two complementary angles are in the ratio 2:3. Find the angles.', answer: '36°, 54°' },
    { topic: 'Integers', question: 'Find the value of: (-8) × (-3) ÷ 4', answer: '6' },
    { topic: 'Percentage', question: 'If a number is increased by 20% it becomes 96. Find the original number.', answer: '80' },
    { topic: 'Geometry', question: 'The perimeter of a rectangle is 48 cm and its length is 14 cm. Find its breadth.', answer: '10 cm' },
    { topic: 'Simple Equations', question: 'Solve: 2(x + 3) = 3(x - 1)', answer: 'x = 9' },
    { topic: 'Fractions', question: 'Convert 0.375 into a fraction in its simplest form.', answer: '3/8' },
  ] },
  { title: 'Class 8', subtitle: 'Rational Numbers, Linear Equations, Mensuration, Exponents, Factorization', problems: [
    { topic: 'Linear Equations', question: 'Solve: 3x/2 - 1 = x/4 + 2', answer: 'x = 12/5' },
    { topic: 'Exponents', question: 'Simplify: (2³ × 2⁴) ÷ 2⁵', answer: '4' },
    { topic: 'Factorization', question: 'Factorize: x² + 7x + 12', answer: '(x+3)(x+4)' },
    { topic: 'Mensuration', question: 'Find the area of a trapezium with parallel sides 10 cm and 14 cm, and height 6 cm.', answer: '72 cm²' },
    { topic: 'Rational Numbers', question: 'Simplify: 5/7 ÷ (-15/28)', answer: '-4/3' },
    { topic: 'Compound Interest', question: 'A sum of ₹8,000 is invested at 10% p.a. compound interest for 2 years. Find the amount.', answer: '₹9,680' },
    { topic: 'Mensuration', question: 'If the sides of a cube are doubled, by what factor does its volume increase?', answer: '8 times' },
    { topic: 'Linear Equations', question: 'Solve: (x - 2)/3 + (x - 3)/4 = 1', answer: 'x = 23/7' },
    { topic: 'Exponents', question: 'Find the value of (-4)³ + (-2)⁴', answer: '-48' },
    { topic: 'Factorization', question: 'Factorize: 4x² - 9y²', answer: '(2x-3y)(2x+3y)' },
  ] },
  { title: 'Class 9', subtitle: 'Number Systems, Polynomials, Coordinate Geometry, Linear Equations, Triangles', problems: [
    { topic: 'Number Systems', question: 'Simplify: √50 + √18 - √8', answer: '4√2' },
    { topic: 'Polynomials', question: 'If p(x) = x³ - 3x² + 2x - 5, find p(2).', answer: '-5' },
    { topic: 'Polynomials', question: 'Factorize: x³ - 6x² + 11x - 6', answer: '(x-1)(x-2)(x-3)' },
    { topic: 'Coordinate Geometry', question: 'Find the distance between points A(3, 4) and B(-2, -8) using the distance formula concept (coordinate difference).', answer: '13 units' },
    { topic: 'Linear Equations', question: 'Solve the linear equation 2x + 3y = 12 for y when x = 3.', answer: 'y = 2' },
    { topic: 'Triangles', question: 'In a triangle, the angles are in the ratio 2:3:4. Find each angle.', answer: '40°, 60°, 80°' },
    { topic: 'Number Systems', question: 'Rationalize the denominator: 1/(√5 - √3)', answer: '(√5+√3)/2' },
    { topic: 'Triangles', question: 'Prove-type: If two sides and the included angle of one triangle equal those of another, state the congruence rule.', answer: 'SAS rule' },
    { topic: 'Polynomials', question: 'Find the zero of the polynomial p(x) = 3x - 9.', answer: 'x = 3' },
    { topic: 'Polynomials', question: 'Simplify using identities: (2x + 3y)²', answer: '4x² + 12xy + 9y²' },
  ] },
  { title: 'Class 10', subtitle: 'Quadratic Equations, AP, Trigonometry, Circles, Probability', problems: [
    { topic: 'Quadratic Equations', question: 'Solve: x² - 7x + 12 = 0', answer: 'x = 3, 4' },
    { topic: 'Arithmetic Progressions', question: 'Find the 15th term of the AP: 3, 7, 11, 15, ...', answer: '59' },
    { topic: 'Arithmetic Progressions', question: 'Find the sum of the first 20 terms of the AP: 2, 5, 8, 11, ...', answer: '610' },
    { topic: 'Trigonometry', question: 'If sin θ = 3/5, find cos θ and tan θ.', answer: 'cos θ = 4/5, tan θ = 3/4' },
    { topic: 'Trigonometry', question: 'Prove-type: Find the value of sin²30° + cos²60°.', answer: '1/2' },
    { topic: 'Circles', question: 'A tangent from a point 13 cm away from the center of a circle of radius 5 cm is drawn. Find the length of the tangent.', answer: '12 cm' },
    { topic: 'Quadratic Equations', question: 'Solve using the quadratic formula: 2x² - 5x + 2 = 0', answer: 'x = 2, 1/2' },
    { topic: 'Probability', question: 'Two dice are thrown together. Find the probability of getting a sum of 8.', answer: '5/36' },
    { topic: 'Quadratic Equations', question: 'Find the discriminant of 3x² - 4x + 1 = 0 and state the nature of roots.', answer: 'D = 4, real and distinct roots' },
    { topic: 'Trigonometry', question: 'The height of a tower is 30 m. Find the angle of elevation of the sun when the shadow is 30√3 m long.', answer: '30°' },
  ] },
  { title: 'Class 11', subtitle: 'Sets, Trigonometry, Complex Numbers, Sequences & Series, Straight Lines', problems: [
    { topic: 'Sets', question: 'If A = {1,2,3,4,5} and B = {3,4,5,6,7}, find A ∩ B and A ∪ B.', answer: 'A∩B={3,4,5}, A∪B={1,2,3,4,5,6,7}' },
    { topic: 'Trigonometric Functions', question: 'Prove-type: Find the value of sin 75°.', answer: '(√6+√2)/4' },
    { topic: 'Complex Numbers', question: 'Solve: x² + 4 = 0 (express roots in complex form)', answer: 'x = ±2i' },
    { topic: 'Sequences & Series', question: 'Find the sum to n terms of the GP: 2, 6, 18, 54, ...', answer: 'Sn = 3(3ⁿ - 1)' },
    { topic: 'Straight Lines', question: 'Find the equation of a line passing through (2, 3) with slope 4.', answer: 'y - 3 = 4(x - 2), i.e., 4x - y - 5 = 0' },
    { topic: 'Trigonometric Functions', question: 'Convert 210° into radians.', answer: '7π/6' },
    { topic: 'Complex Numbers', question: 'If z = 3 + 4i, find |z| and the conjugate of z.', answer: '|z| = 5, conjugate = 3 - 4i' },
    { topic: 'Permutations', question: 'Find the number of ways to arrange the letters of the word "MATHS".', answer: '120' },
    { topic: 'Sequences & Series', question: 'Find the sum of the first 10 terms of the AP whose nth term is 3n + 2.', answer: '185' },
    { topic: 'Straight Lines', question: 'Find the equation of the circle with center (0,0) and radius 7.', answer: 'x² + y² = 49' },
  ] },
  { title: 'Class 12', subtitle: 'Relations & Functions, Calculus, Vectors, Probability, Matrices', problems: [
    { topic: 'Differentiation', question: 'Differentiate: y = x³ sin x (use product rule)', answer: 'dy/dx = 3x²sin x + x³cos x' },
    { topic: 'Integration', question: 'Integrate: ∫(3x² + 2x + 1) dx', answer: 'x³ + x² + x + C' },
    { topic: 'Differentiation', question: 'Find dy/dx if y = e^(2x) · log(x)', answer: 'dy/dx = 2e^(2x)log(x) + e^(2x)/x' },
    { topic: 'Integration', question: 'Evaluate: ∫₀¹ (2x + 1) dx', answer: '2' },
    { topic: 'Matrices', question: 'If A = [[1,2],[3,4]] and B = [[2,0],[1,3]], find A + B and AB.', answer: 'A+B = [[3,2],[4,7]], AB = [[4,6],[10,12]]' },
    { topic: 'Differentiation', question: 'Find the derivative of f(x) = ln(sin x)', answer: 'cot x' },
    { topic: 'Probability', question: 'A bag contains 4 red and 6 black balls. Two balls are drawn without replacement. Find the probability both are red.', answer: '2/15' },
    { topic: 'Vectors', question: 'Find the angle between vectors a = (1, 2, 3) and b = (2, -1, 1) using the dot product formula.', answer: 'θ = cos⁻¹(3/(√14·√6))' },
    { topic: 'Applications of Derivatives', question: 'Find the maximum value of f(x) = -x² + 4x + 1 using derivatives.', answer: 'Maximum value = 5 at x = 2' },
    { topic: 'Integration', question: 'Evaluate: ∫ (1/(1+x²)) dx', answer: 'tan⁻¹(x) + C' },
  ] },
]

export default function MathsPage() {
  const [level, setLevel] = useState(0)
  const [index, setIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [topic, setTopic] = useState('All')
  const [solved, setSolved] = useState(0)

  const currentLevel = levels[level]
  const topics = useMemo(() => ['All', ...Array.from(new Set(currentLevel.problems.map(p => p.topic)))], [currentLevel])
  const filtered = topic === 'All' ? currentLevel.problems : currentLevel.problems.filter(p => p.topic === topic)
  const problem = filtered[index % filtered.length]

  function changeLevel(next: number) {
    setLevel(next); setIndex(0); setTopic('All'); setShowAnswer(false)
  }
  function nextProblem() { setIndex(i => i + 1); setShowAnswer(false) }
  function markSolved() { setSolved(s => s + 1); nextProblem() }

  return (
    <main className="mathsPage">
      <section className="mathsHero">
        <div>
          <span className="pill">FLOWKEYS • MATHS LAB</span>
          <h1>Maths practice that grows with you. 🧮</h1>
          <p>Choose your class level, pick a topic, solve the problem yourself, then reveal the answer. Start at Class 7 and progress all the way to Class 12.</p>
        </div>
        <div className="mathsScore"><strong>{solved}</strong><span>solved this session</span></div>
      </section>
      <section className="levelGrid">
        {levels.map((item, i) => <button key={item.title} className={`levelCard ${i === level ? 'active' : ''}`} onClick={() => changeLevel(i)}><strong>{item.title}</strong><span>{item.problems.length} problems</span><small>{item.subtitle}</small></button>)}
      </section>
      <section className="mathsWorkspace">
        <div className="topicRail"><h3>{currentLevel.title}</h3>{topics.map(t => <button key={t} className={topic === t ? 'selected' : ''} onClick={() => { setTopic(t); setIndex(0); setShowAnswer(false) }}>{t}</button>)}</div>
        <article className="problemCard">
          <div className="problemMeta"><span>{currentLevel.title}</span><span>{problem.topic}</span></div>
          <p className="problemNumber">Problem {((index % filtered.length) + 1)} of {filtered.length}</p>
          <h2>{problem.question}</h2>
          <p className="hint">💡 Try it on paper first. FlowKeys should help you learn the method, not just reveal the answer.</p>
          {showAnswer && <div className="answerBox"><strong>Answer</strong><p>{problem.answer}</p></div>}
          <div className="problemActions"><button className="primary" onClick={() => setShowAnswer(v => !v)}>{showAnswer ? 'Hide answer' : 'Reveal answer'}</button><button className="secondary" onClick={markSolved}>I solved it ✓</button><button className="secondary" onClick={nextProblem}>Next problem →</button></div>
        </article>
      </section>
    </main>
  )
}
