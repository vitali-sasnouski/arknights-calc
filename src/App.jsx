import { useState } from 'react'
import { calculate } from './calc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableFooter, TableRow } from '@/components/ui/table'
import orundumIcon from './assets/orundum.png'
import hhPermitIcon from './assets/hh_permit.png'
import './App.css'

function ResourceIcon({ src, alt }) {
  return <img src={src} alt={alt} className="inline-block h-5 w-5 object-contain" />
}

function ResultTable({ rows, footer }) {
  return (
    <Table>
      <TableBody>
        {rows.map(({ label, count, rate, total }) => (
          <TableRow key={label}>
            <TableCell className="text-muted-foreground">{label}</TableCell>
            <TableCell className="text-muted-foreground">{count} × {rate}</TableCell>
            <TableCell className="text-right">{total.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        {footer.map(({ label, value, icon }) => (
          <TableRow key={label}>
            <TableCell colSpan={2} className="font-semibold">{label}</TableCell>
            <TableCell className="text-right font-semibold">
              <span className="inline-flex items-center gap-1.5 justify-end">
                {icon}
                {value.toLocaleString()}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableFooter>
    </Table>
  )
}

function OrundumBlock({ orundum, constants: c }) {
  const rows = [
    { label: 'Daily base',   count: orundum.days,         rate: c.ORUNDUM_PER_DAY,     total: orundum.daily_total },
    { label: 'Monday bonus', count: orundum.mondays,      rate: c.ORUNDUM_MONDAY,      total: orundum.monday_total },
    { label: 'Wednesday',    count: orundum.wednesdays,   rate: c.ORUNDUM_WEDNESDAY,   total: orundum.wednesday_total },
    { label: 'Month start',  count: orundum.month_firsts, rate: c.ORUNDUM_MONTH_FIRST, total: orundum.month_first_total },
  ]
  const icon = <ResourceIcon src={orundumIcon} alt="Orundum" />
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon} Orundum
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResultTable rows={rows} footer={[{ label: 'Total Orundum', value: orundum.grand_total, icon }]} />
      </CardContent>
    </Card>
  )
}

function HhBlock({ orundum, hh, constants: c }) {
  const rows = [
    { label: 'Month start',  count: hh.month_firsts,     rate: c.HH_MONTH_FIRST, total: hh.month_first_total },
    { label: 'Day 17 bonus', count: hh.day_seventeenths, rate: c.HH_DAY_17,      total: hh.day_17_total },
    {
      label: 'Orundum → HH',
      count: `${orundum.grand_total.toLocaleString()} ÷ ${c.ORUNDUM_PER_HH}`,
      rate: '',
      total: hh.from_orundum,
    },
  ]
  const icon = <ResourceIcon src={hhPermitIcon} alt="HH Permit" />
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon} HH Permit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResultTable
          rows={rows}
          footer={[
            { label: 'HH from period', value: hh.grand_total, icon },
            { label: 'Total HH Permit', value: hh.total,       icon },
          ]}
        />
      </CardContent>
    </Card>
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
    <div className="min-h-screen flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-xl space-y-6">
        <h1 className="text-3xl font-bold">Arknights Calculator</h1>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm text-muted-foreground">Start date</label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={e => setDateStart(e.target.value)}
                  className="border border-input rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm text-muted-foreground">End date</label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={e => setDateEnd(e.target.value)}
                  className="border border-input rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleCalculate}>Calculate</Button>

            {error && <p className="text-destructive text-sm">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <>
            <OrundumBlock orundum={result.orundum} constants={result.constants} />
            <HhBlock orundum={result.orundum} hh={result.hh} constants={result.constants} />
          </>
        )}
      </div>
    </div>
  )
}

export default App
