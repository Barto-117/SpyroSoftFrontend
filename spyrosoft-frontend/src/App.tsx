import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

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
} as const;

interface MixItem {
  fuel: keyof typeof colors;
  perc: number;
}

interface DayData {
  cleanEnergyPercentage: number;
  mix: MixItem[];
}

interface EnergyData {
  day1: DayData;
  day2: DayData;
  day3: DayData;
}

interface ChargingWindow {
  startDate: string;
  endDate: string;
  averageCleanEnergyPer: number;
}

function App() {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [duration, setDuration] = useState<number>(1);
  const [chargingWindow, setChargingWindow] =
    useState<ChargingWindow | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchEnergyData();
  }, []);

  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('pl-PL');
  };

  const getDayLabel = (index: number): string => {
    return ['Dzisiaj', 'Jutro', 'Pojutrze'][index];
  };

  const fetchEnergyData = async (): Promise<void> => {
    try {
      const today = new Date();
      const twoDaysLater = new Date(today);
      twoDaysLater.setDate(today.getDate() + 2);

      const from = formatDate(today);
      const to = formatDate(twoDaysLater);

      const res = await fetch(`https://spyrosoftbackend.onrender.com/${from}/${to}`);
      const data: EnergyData = await res.json();
      setEnergyData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChargingWindow = async (): Promise<void> => {
    setLoading(true);
    try {
      const today = new Date();
      const twoDaysLater = new Date(today);
      twoDaysLater.setDate(today.getDate() + 2);

      const from = formatDate(today);
      const to = formatDate(twoDaysLater);

      const res = await fetch(
        `https://spyrosoftbackend.onrender.com/${from}/${to}/${duration}`
      );
      const data: ChargingWindow = await res.json();
      setChargingWindow(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createChartData = (day?: DayData) => {
    if (!day) return undefined;

    return {
      labels: day.mix.map(m => m.fuel),
      datasets: [
        {
          data: day.mix.map(m => m.perc),
          backgroundColor: day.mix.map(m => colors[m.fuel])
        }
      ]
    };
  };

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Dashboard Energetyczny</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {energyData &&
          ['day1', 'day2', 'day3'].map((day, idx) => (
            <Card key={day} title={getDayLabel(idx)}>
              <strong>
                {energyData[day as keyof EnergyData].cleanEnergyPercentage.toFixed(1)}%
              </strong>
              <Chart
                type="pie"
                data={createChartData(energyData[day as keyof EnergyData])}
              />
            </Card>
          ))}
      </div>

      <Card title="Optymalne okno ładowania" style={{ marginTop: 30 }}>
        <InputNumber
          value={duration}
          min={1}
          max={6}
          step={1}
          onValueChange={(e) => {
            if (e.value !== null) setDuration(e.value);
          }}
        />
        <Button
          label="Znajdź"
          onClick={fetchChargingWindow}
          loading={loading}
          style={{ marginLeft: 10 }}
        />

        {chargingWindow && (
          <div style={{ marginTop: 20 }}>
            <div>Start: {formatDateTime(chargingWindow.startDate)}</div>
            <div>Koniec: {formatDateTime(chargingWindow.endDate)}</div>
            <div>
              Średnia: {chargingWindow.averageCleanEnergyPer.toFixed(2)}%
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default App;
