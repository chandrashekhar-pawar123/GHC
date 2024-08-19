import React, { useState, useEffect } from 'react';
import { fetchIntervals, updateIntervals } from '../services/api';

const IntervalsForm = () => {
  const [intervals, setIntervals] = useState({
    firstMessageInterval: 1800000,  // 30 minutes default
    secondMessageInterval: 86400000, // 1 day default
    thirdMessageInterval: 259200000  // 3 days default
  });

  useEffect(() => {
    const getIntervals = async () => {
      const response = await fetchIntervals();
      setIntervals(response.data);
    };
    getIntervals();
  }, []);

  const handleChange = (e) => {
    setIntervals({ ...intervals, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateIntervals(intervals);
    alert('Intervals updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>First Message Interval (ms): </label>
        <input
          type="number"
          name="firstMessageInterval"
          value={intervals.firstMessageInterval}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Second Message Interval (ms): </label>
        <input
          type="number"
          name="secondMessageInterval"
          value={intervals.secondMessageInterval}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Third Message Interval (ms): </label>
        <input
          type="number"
          name="thirdMessageInterval"
          value={intervals.thirdMessageInterval}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Update Intervals</button>
    </form>
  );
};

export default IntervalsForm;