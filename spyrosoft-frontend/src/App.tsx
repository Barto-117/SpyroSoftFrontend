import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function App() {
  const [energyData, setEnergyData] = useState(null);
  const [duration, setDuration] = useState(1);
  const [chargingWindow, setChargingWindow] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEnergyData();
  }, []);

  const fetchEnergyData = async () => {
    try {
      const today = new Date();
      const twoDaysLater = new Date(today);
      twoDaysLater.setDate(twoDaysLater.getDate() + 2);

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const from = formatDate(today);
      const to = formatDate(twoDaysLater);

      const response = await fetch(`https://spyrosoftbackend.onrender.com/${from}/${to}`);
      const data = await response.json();
      setEnergyData(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchChargingWindow = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const twoDaysLater = new Date(today);
      twoDaysLater.setDate(twoDaysLater.getDate() + 2);

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const from = formatDate(today);
      const to = formatDate(twoDaysLater);

      const response = await fetch(`https://spyrosoftbackend.onrender.com/${from}/${to}/${duration}`);
      const data = await response.json();
      setChargingWindow(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createChartData = (dayData) => {
    if (!dayData || !dayData.mix) return null;

    const colors = {
      biomass: '#10b981',
      coal: '#1f2937',
      imports: '#8b5cf6',
      gas: '#f59e0b',
      nuclear: '#3b82f6',
      other: '#6b7280',
      hydro: '#06b6d4',
      solar: '#fbbf24',
      wind: '#10b981'
    };

    return {
      labels: dayData.mix.map(item => item.fuel),
      datasets: [{
        data: dayData.mix.map(item => item.perc),
        backgroundColor: dayData.mix.map(item => colors[item.fuel] || '#gray')
      }]
    };
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  const getDayLabel = (index) => {
    const labels = ['Dzisiaj', 'Jutro', 'Pojutrze'];
    return labels[index];
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pl-PL');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Dashboard Energetyczny</h1>

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {energyData && ['day1', 'day2', 'day3'].map((day, index) => (
          <Card key={day} title={getDayLabel(index)}>
            <div style={{ textAlign: 'center', marginBottom: '15px', padding: '10px', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#059669' }}>Czysta Energia</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#047857' }}>
                {energyData[day]?.cleanEnergyPercentage?.toFixed(1)}%
              </div>
            </div>
            <Chart type="pie" data={createChartData(energyData[day])} options={chartOptions} />
          </Card>
        ))}
      </div>

      <Card title="Optymalne Okno Ładowania">
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
            Czas ładowania (godziny):
          </label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <InputNumber 
              value={duration} 
              onValueChange={(e) => setDuration(e.value)} 
              min={1} 
              max={6}
              style={{ width: '150px' }}
              step={1}
              maxFractionDigits={0}
            />
            <Button 
              label="Znajdź okno" 
              icon="pi pi-search"
              onClick={fetchChargingWindow}
              loading={loading}
            />
          </div>
        </div>

        {chargingWindow && (
          <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
            <h3 style={{ color: '#047857', marginTop: 0 }}>Najlepszy okres do ładowania</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <strong>Start:</strong> {formatDateTime(chargingWindow.startDate)}
              </div>
              <div>
                <strong>Koniec:</strong> {formatDateTime(chargingWindow.endDate)}
              </div>
              <div>
                <strong>Średnia czystej energii:</strong>{' '}
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#047857' }}>
                  {chargingWindow.averageCleanEnergyPer?.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default App;