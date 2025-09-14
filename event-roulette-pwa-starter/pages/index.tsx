import { useState } from 'react'

export default function Home(){
  const [city, setCity] = useState('Middlesbrough')
  const [category, setCategory] = useState('random')
  const [budget, setBudget] = useState('£10–£20')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string| null>(null)

  const spin = async () => {
    setLoading(true); setError(null); setResult(null);
    try{
      const params = new URLSearchParams({ city, category, budget })
      const res = await fetch('/api/spin?'+params.toString())
      if(!res.ok){ throw new Error((await res.json()).error || 'Failed') }
      const data = await res.json()
      setResult(data)
    }catch(e:any){
      setError(e.message || 'Error')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>LocalRoulette</h1>
        <p className="small">Spin to discover something to do around Teesside — venues, family spots, date nights, seasonal events.</p>

        <label>City</label>
        <input value={city} onChange={e=>setCity(e.target.value)} placeholder="Middlesbrough" />

        <div className="row">
          <div>
            <label>Category</label>
            <select value={category} onChange={e=>setCategory(e.target.value)}>
              <option value="random">Random</option>
              <option value="date_night">Date Night</option>
              <option value="nightlife">Nightlife</option>
              <option value="family">Family</option>
              <option value="activities">Activities</option>
              <option value="outdoors">Outdoors</option>
              <option value="culture">Culture</option>
              <option value="cinema">Cinema</option>
              <option value="live_music">Live Music</option>
              <option value="seasonal">Seasonal</option>
            </select>
          </div>
          <div>
            <label>Budget</label>
            <select value={budget} onChange={e=>setBudget(e.target.value)}>
              <option>£10–£20</option>
              <option>Under £10</option>
              <option>£20–£50</option>
              <option>£50+ (big night)</option>
            </select>
          </div>
        </div>

        <button onClick={spin} style={{marginTop:12}} disabled={loading}>
          {loading ? 'Spinning…' : 'Spin'}
        </button>

        {error && <div className="result">{error}</div>}
        {result && (
          <div className="result">
            <div style={{fontSize:18, fontWeight:700, marginBottom:6}}>{result.name}</div>
            <div className="small">{result.city ? result.city+' • ' : ''}{(result.category||'').replace('_',' ')}</div>
            {result.source_url && <div style={{marginTop:8}}><a className="link" target="_blank" href={result.source_url}>More info ↗</a></div>}
            <div className="small" style={{marginTop:8}}>lat {result.lat?.toFixed(4)}, lon {result.lon?.toFixed(4)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
