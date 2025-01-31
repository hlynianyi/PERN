// frontend/src/App.jsx
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "./components/products/ProductList";
import ProductCreate from "./components/products/ProductCreate";
import ProductEdit from "./components/products/ProductEdit";

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/admin/products" element={<ProductList />} />
          <Route path="/admin/products/create" element={<ProductCreate />} />
          <Route path="/admin/products/edit/:id" element={<ProductEdit />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
