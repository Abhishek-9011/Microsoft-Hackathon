import LandingPage from "./pages/LandingPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ObjectDetection from "./pages/ObjectDetection";
import ImageUploadDialog from "./pages/ImageUploadDialog";
import ImageUploadPage from "./pages/ImageUploadPage";

function App() {
  return <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage/>}></Route>
        <Route path="/temp" element={<ObjectDetection/>}></Route>
        <Route path="/upload" element={<ImageUploadPage/>}></Route>
      </Routes>
    </BrowserRouter>
  </>;
}

export default App;
