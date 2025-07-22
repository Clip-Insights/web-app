import { RouterProvider } from 'react-router-dom'
import router from './routes/routes.jsx'
import './App.css'
import "@fontsource/inter"; // Defaults to weight 400
import "@fontsource/inter/700.css"; // Import additional weights as needed


function App() {

  return (
    <div className='font-primary'>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
