import './style.css'
import { createRoot } from 'react-dom/client'
import FlagGame from './FlagGame'

const container = document.getElementById('app')!
const root = createRoot(container)
root.render(<FlagGame />)
