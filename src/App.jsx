import { useState } from 'react'
import InputScreen from './components/InputScreen.jsx'
import OutputView from './components/OutputView.jsx'
import FlyerGenerator from './components/FlyerGenerator.jsx'
import './App.css'

function App() {
  const [view, setView]   = useState('tracker')  // 'tracker' | 'flyer'
  const [order, setOrder] = useState(null)

  const isFlyerWide  = view === 'flyer'
  const isTrackerWide = view === 'tracker' && order !== null

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__top">
          <div className="app-header__brand">
            <span className="app-header__eyebrow">Chalo</span>
            <h1 className="app-header__title">
              {view === 'tracker' ? 'Production Tracker' : 'Flyer Generator'}
            </h1>
          </div>
          <nav className="app-nav">
            <button
              className={`app-nav__btn ${view === 'tracker' ? 'app-nav__btn--active' : ''}`}
              onClick={() => setView('tracker')}
            >
              Tracker
            </button>
            <button
              className={`app-nav__btn ${view === 'flyer' ? 'app-nav__btn--active' : ''}`}
              onClick={() => setView('flyer')}
            >
              Flyer Generator
            </button>
          </nav>
        </div>
      </header>

      <main className={`app-main ${isTrackerWide || isFlyerWide ? 'app-main--wide' : ''} ${isFlyerWide ? 'app-main--flyer' : ''}`}>
        {view === 'tracker' && (
          order
            ? <OutputView order={order} onBack={() => setOrder(null)} />
            : <InputScreen onSubmit={setOrder} />
        )}
        {view === 'flyer' && <FlyerGenerator />}
      </main>
    </div>
  )
}

export default App
