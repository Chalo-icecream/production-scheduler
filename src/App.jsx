import { useState } from 'react'
import InputScreen from './components/InputScreen.jsx'
import OutputView from './components/OutputView.jsx'
import FlyerGenerator from './components/FlyerGenerator.jsx'
import PriceTracker from './components/PriceTracker.jsx'
import './App.css'

const NAV = [
  { id: 'tracker', label: 'Tracker'       },
  { id: 'prices',  label: 'Price Tracker' },
  { id: 'flyer',   label: 'Flyer'         },
]

const VIEW_TITLES = {
  tracker: 'Production Tracker',
  prices:  'Price Tracker',
  flyer:   'Flyer Generator',
}

function App() {
  const [view, setView]   = useState('tracker')
  const [order, setOrder] = useState(null)

  const isWide = view !== 'tracker' || order !== null
  const isFlyer = view === 'flyer'

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__top">
          <div className="app-header__brand">
            <span className="app-header__eyebrow">Chalo</span>
            <h1 className="app-header__title">{VIEW_TITLES[view]}</h1>
          </div>
          <nav className="app-nav">
            {NAV.map(item => (
              <button
                key={item.id}
                className={`app-nav__btn ${view === item.id ? 'app-nav__btn--active' : ''}`}
                onClick={() => setView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className={[
        'app-main',
        isWide  ? 'app-main--wide'  : '',
        isFlyer ? 'app-main--flyer' : '',
      ].filter(Boolean).join(' ')}>
        {view === 'tracker' && (
          order
            ? <OutputView order={order} onBack={() => setOrder(null)} />
            : <InputScreen onSubmit={setOrder} />
        )}
        {view === 'prices' && <PriceTracker order={order} />}
        {view === 'flyer'  && <FlyerGenerator />}
      </main>
    </div>
  )
}

export default App
