import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store/store'
import './styles/theme.css'
import './styles/globals.css'

createRoot(document.getElementById('root')).render(
	<Provider store={store}>
		<App />
	</Provider>
)
