import {BrowserRouter as Router, Route, Routes} from "react-router-dom"
import Login from './Components/Login'
import Card from './Components/Card'
import User from './Components/User'
import HomePage from './Components/HomePage'

function App() {
  return (
    <Router>
      <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/User' element={<User/>}/>
          <Route path='/Card/:cardId' element={<Card/>}/>
          <Route path='/HomePage' element={<HomePage/>}/>
      </Routes>
    </Router>
    
  );
}

export default App;
