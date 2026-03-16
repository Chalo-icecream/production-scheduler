import { useState } from 'react'
import InputScreen from './components/InputScreen.jsx'
import OutputView from './components/OutputView.jsx'
import './App.css'

function App() {
  const [order, setOrder] = useState(null)

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-header__eyebrow">Chalo</span>
        <h1 className="app-header__title">Production Tracker</h1>
      </header>
      <main className={`app-main ${order ? 'app-main--wide' : ''}`}>
        {order
          ? <OutputView order={order} onBack={() => setOrder(null)} />
          : <InputScreen onSubmit={setOrder} />
        }
      </main>
    </div>
  )
}

export default App
