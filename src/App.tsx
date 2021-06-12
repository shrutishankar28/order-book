import React from "react";
import { OrderBook } from "./features/orderBook/OrderBook";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <i className="fa fa-chevron-down" style={{ marginRight: 10 }}></i>
        Order Book
      </header>
      <main className="App-body">
        <OrderBook />
      </main>
    </div>
  );
}

export default App;
