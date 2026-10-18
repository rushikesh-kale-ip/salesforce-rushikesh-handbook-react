
import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom';

import LearningRoute from './pages/LearningRoute';

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/learningroute" element={<LearningRoute />} />
          <Route path="/learningroute/:topicId/:rank" element={<LearningRoute />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;