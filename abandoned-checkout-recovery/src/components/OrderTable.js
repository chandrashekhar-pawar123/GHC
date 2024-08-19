import React, { useState, useEffect } from 'react';
import { fetchOrders } from '../services/api';

const OrderTable = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const getOrders = async () => {
      const response = await fetchOrders();
      setOrders(response.data);
    };
    getOrders();
  }, []);

  return (
    <div>
      <h2>Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Order Details</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.email}</td>
              <td>{order.orderDetails}</td>
              <td>{new Date(order.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;