import { useState } from 'react'
import { calculate } from './calc'
import './App.css'

function ResultRow({ label, count, rate, total }) {
  return (
    <tr>
      <td>{label}</td>
      <td>{count} day(s) × {rate}</td>
      <td>= {total.toLocaleString()}</td>
    </tr>
  )
}

function TotalRow({ label, value }) {
  return (
    <tr>
      <td colSpan={2}><strong>{label}</strong></td>
      <td><strong>{value.toLocaleString()}</strong></td>
    </tr>
  )
}

function OrundumBlock({ orundum, constants: c }) {
  return (
    <div>
      <h2>Orundum</h2>
      <table>
        <tbody>
          <ResultRow label="Daily base"   count={orundum.days}        rate={c.ORUNDUM_PER_DAY}     total={orundum.daily_total} />
          <ResultRow label="Monday bonus" count={orundum.mondays}     rate={c.ORUNDUM_MONDAY}      total={orundum.monday_total} />
          <ResultRow label="Wednesday"    count={orundum.wednesdays}  rate={c.ORUNDUM_WEDNESDAY}   total={orundum.wednesday_total} />
          <ResultRow label="Month start"  count={orundum.month_firsts} rate={c.ORUNDUM_MONTH_FIRST} total={orundum.month_first_total} />
          <TotalRow label="Total Orundum" value={orundum.grand_total} />
        </tbody>
      </table>
    </div>
  )
}

function HhBlock({ orundum, hh, constants: c }) {
  return (
    <div>
      <h2>HH Permit</h2>
      <table>
        <tbody>
          <ResultRow label="Month start"  count={hh.month_firsts}     rate={c.HH_MONTH_FIRST} total={hh.month_first_total} />
          <ResultRow label="Day 17 bonus" count={hh.day_seventeenths} rate={c.HH_DAY_17}      total={hh.day_17_total} />
          <TotalRow label="HH from period" value={hh.grand_total} />
          <tr>
            <td>Orundum → HH</td>
            <td>{orundum.grand_total.toLocaleString()} ÷ {c.ORUNDUM_PER_HH}</td>
            <td>= {hh.from_orundum.toLocaleString()}</td>
          </tr>
          <TotalRow label="Total HH Permit" value={hh.total} />
        </tbody>
      </table>
    </div>
  )
}

function Results({ result }) {
  return (
    <div>
      <OrundumBlock orundum={result.orundum} constants={result.constants} />
      <HhBlock orundum={result.orundum} hh={result.hh} constants={result.constants} />
    </div>
  )
}

function App() {
  const today = new Date()
  const nextMonth = new Date(today)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  const toInputValue = d => d.toISOString().slice(0, 10)

  const [dateStart, setDateStart] = useState(toInputValue(today))
  const [dateEnd, setDateEnd]     = useState(toInputValue(nextMonth))
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState('')

  function handleCalculate() {
    setError('')
    setResult(null)

    if (!dateStart || !dateEnd) {
      setError('Please enter both dates.')
      return
    }

    try {
      setResult(calculate(new Date(dateStart), new Date(dateEnd)))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="card">
      <h1>Arknights Calculator</h1>

      <div>
        <label>
          Start date
          <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} />
        </label>
        <label>
          End date
          <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
        </label>
      </div>

      <button onClick={handleCalculate}>Calculate</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && <Results result={result} />}
    </div>
  )
}

export default App
