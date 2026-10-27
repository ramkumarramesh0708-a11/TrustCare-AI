import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { api } from '../services/api';

export default function MainLayout() {
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const stats = await api.getOverviewStats();
        setActiveAlertsCount(stats.active_alerts || 0);
      } catch (err) {
        console.error("Failed to load alert stats:", err);
      }
    };
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <Sidebar alertCount={activeAlertsCount} />
      <div className="main-content">
        <Navbar />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
