import React from 'react';
import IntervalsForm from './components/IntervalsForm';
import MessageTable from './components/MessageTable';
import OrderTable from './components/OrderTable';

function App() {
  return (
    <div className="App">
      <h1>Abandoned Checkout Recovery Plugin</h1>
      <IntervalsForm />
      <MessageTable />
      <OrderTable />
    </div>
  );
}

export default App;
