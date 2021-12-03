import {BrowserRouter as Router, Route, Routes} from "react-router-dom"
import Login from './Login'
import Card from './Card'
import User from './User'
import HomePage from './HomePage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/User' element={<User/>}/>
        <Route path='/Card' element={<Card/>}/>
        <Route path='/HomePage' element={<HomePage/>}/>
      </Routes>
    </Router>
    
  );
}

export default App;
