// src/App.js
import React from "react";
import ProductPage from "./components/ProductPage";
import "./App.css";

function App() {
  return (
    <div>
      <ProductPage productId={1} />
    </div>
  );
}

export default App;
