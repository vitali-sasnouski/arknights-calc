import { useState } from 'react'
import { calculate } from './calc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableFooter, TableRow } from '@/components/ui/table'
import { ChevronDown, ChevronRight } from 'lucide-react'
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

const PRIME_TO_ORUNDUM = 180

function StockpileSummaryBlock({ result, stockPrime: primeStr, stockOrundum: orundumStr, stockHhPermit: hhStr }) {
  const c = result.constants
  const prime      = parseInt(primeStr)  || 0
  const stockOr    = parseInt(orundumStr) || 0
  const stockHh    = parseInt(hhStr)     || 0

  const primeOrundum  = prime * PRIME_TO_ORUNDUM
  const totalOrundum  = primeOrundum + stockOr + result.orundum.grand_total

  const hhFromPeriod  = result.hh.grand_total
  const hhDirect      = stockHh + hhFromPeriod

  const hhFromOrundum = Math.floor(totalOrundum / c.ORUNDUM_PER_HH)
  const grandTotal    = hhFromOrundum + hhDirect

  const orIcon = <ResourceIcon src={orundumIcon} alt="Orundum" />
  const hhIcon = <ResourceIcon src={hhPermitIcon} alt="HH Permit" />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hhIcon} Total HH Projection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="text-muted-foreground">Originite Prime → Orundum</TableCell>
              <TableCell className="text-muted-foreground">{prime} × {PRIME_TO_ORUNDUM}</TableCell>
              <TableCell className="text-right">{primeOrundum.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-muted-foreground">Stockpile Orundum</TableCell>
              <TableCell className="text-muted-foreground"></TableCell>
              <TableCell className="text-right">{stockOr.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-muted-foreground">Period Orundum</TableCell>
              <TableCell className="text-muted-foreground"></TableCell>
              <TableCell className="text-right">{result.orundum.grand_total.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="font-semibold">Total Orundum</TableCell>
              <TableCell className="text-right font-semibold">
                <span className="inline-flex items-center gap-1.5 justify-end">{orIcon}{totalOrundum.toLocaleString()}</span>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="text-muted-foreground">Stockpile HH Permit</TableCell>
              <TableCell className="text-muted-foreground"></TableCell>
              <TableCell className="text-right">{stockHh.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-muted-foreground">Period HH Permit</TableCell>
              <TableCell className="text-muted-foreground"></TableCell>
              <TableCell className="text-right">{hhFromPeriod.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="font-semibold">HH Permit (direct)</TableCell>
              <TableCell className="text-right font-semibold">
                <span className="inline-flex items-center gap-1.5 justify-end">{hhIcon}{hhDirect.toLocaleString()}</span>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="text-muted-foreground">Orundum → HH</TableCell>
              <TableCell className="text-muted-foreground">{totalOrundum.toLocaleString()} ÷ {c.ORUNDUM_PER_HH}</TableCell>
              <TableCell className="text-right">{hhFromOrundum.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-muted-foreground">Direct HH Permit</TableCell>
              <TableCell className="text-muted-foreground"></TableCell>
              <TableCell className="text-right">{hhDirect.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="font-semibold">Total HH Permit</TableCell>
              <TableCell className="text-right font-semibold">
                <span className="inline-flex items-center gap-1.5 justify-end">{hhIcon}{grandTotal.toLocaleString()}</span>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}

const STORAGE_KEYS = {
  dateStart:    'ak_dateStart',
  dateEnd:      'ak_dateEnd',
  stockPrime:   'ak_stockPrime',
  stockOrundum: 'ak_stockOrundum',
  stockHhPermit:'ak_stockHhPermit',
}

function App() {
  const today = new Date()
  const nextMonth = new Date(today)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  const toInputValue = d => d.toISOString().slice(0, 10)

  const [dateStart, setDateStart] = useState(() => localStorage.getItem(STORAGE_KEYS.dateStart)    ?? toInputValue(today))
  const [dateEnd, setDateEnd]     = useState(() => localStorage.getItem(STORAGE_KEYS.dateEnd)      ?? toInputValue(nextMonth))
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState('')

  const [stockOpen, setStockOpen]         = useState(() =>
    !!(localStorage.getItem(STORAGE_KEYS.stockPrime) || localStorage.getItem(STORAGE_KEYS.stockOrundum) || localStorage.getItem(STORAGE_KEYS.stockHhPermit))
  )
  const [stockPrime, setStockPrime]       = useState(() => localStorage.getItem(STORAGE_KEYS.stockPrime)    ?? '')
  const [stockOrundum, setStockOrundum]   = useState(() => localStorage.getItem(STORAGE_KEYS.stockOrundum)  ?? '')
  const [stockHhPermit, setStockHhPermit] = useState(() => localStorage.getItem(STORAGE_KEYS.stockHhPermit) ?? '')

  const [saved, setSaved] = useState(false)

  function handleCalculate() {
    setError('')
    setResult(null)
    setSaved(false)

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

  function handleSave() {
    localStorage.setItem(STORAGE_KEYS.dateStart,     dateStart)
    localStorage.setItem(STORAGE_KEYS.dateEnd,       dateEnd)
    localStorage.setItem(STORAGE_KEYS.stockPrime,    stockPrime)
    localStorage.setItem(STORAGE_KEYS.stockOrundum,  stockOrundum)
    localStorage.setItem(STORAGE_KEYS.stockHhPermit, stockHhPermit)
    setSaved(true)
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

            <div className="border border-input rounded-md">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-left"
                onClick={() => setStockOpen(o => !o)}
              >
                {stockOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                Current Stockpile
              </button>
              {stockOpen && (
                <div className="px-3 pb-3 space-y-3 border-t border-input">
                  <div className="flex flex-col gap-1 pt-3">
                    <label className="text-sm text-muted-foreground">Originite Prime</label>
                    <input
                      type="number"
                      min="0"
                      value={stockPrime}
                      onChange={e => setStockPrime(e.target.value)}
                      placeholder="0"
                      className="border border-input rounded-md px-3 py-2 text-sm bg-background"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <ResourceIcon src={orundumIcon} alt="Orundum" /> Orundum
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stockOrundum}
                      onChange={e => setStockOrundum(e.target.value)}
                      placeholder="0"
                      className="border border-input rounded-md px-3 py-2 text-sm bg-background"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <ResourceIcon src={hhPermitIcon} alt="HH Permit" /> HH Permit
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stockHhPermit}
                      onChange={e => setStockHhPermit(e.target.value)}
                      placeholder="0"
                      className="border border-input rounded-md px-3 py-2 text-sm bg-background"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button className="w-full" onClick={handleCalculate}>Calculate</Button>

            {result && (
              <Button
                className="w-full"
                variant={saved ? 'outline' : undefined}
                onClick={handleSave}
                style={saved ? undefined : { backgroundColor: '#16a34a', color: '#fff' }}
              >
                {saved ? 'Saved!' : 'Save'}
              </Button>
            )}

            {error && <p className="text-destructive text-sm">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <>
            <OrundumBlock orundum={result.orundum} constants={result.constants} />
            <HhBlock orundum={result.orundum} hh={result.hh} constants={result.constants} />
            {(stockPrime || stockOrundum || stockHhPermit) && (
              <StockpileSummaryBlock
                result={result}
                stockPrime={stockPrime}
                stockOrundum={stockOrundum}
                stockHhPermit={stockHhPermit}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
