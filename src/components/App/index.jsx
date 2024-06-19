import './index.css';
import { Route, Routes, Navigate } from 'react-router-dom';
import Transition from '../Transition';
import Home from '../Home';
import Project from '../Project';

function App() {
  return <div className='app'>
    <Transition />
    <Routes>
      <Route exact path='/' element={<Home />} />
      <Route path='/:projectId' element={<Project />} />
      <Route path='*' element={<Navigate replace to='/' />} />
    </Routes>
  </div>
}

export default App;