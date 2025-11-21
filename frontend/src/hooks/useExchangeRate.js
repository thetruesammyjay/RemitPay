import { useState, useEffect } from 'react';
// import api from '../services/api'; // Uncomment when backend endpoint is ready

export const useExchangeRate = () => {
  const [rates, setRates] = useState({
    solToUsd: 0,
    usdcToNgn: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Mocking the API response for now since backend might not be fully populated
        // In production: const { data } = await api.get('/rates/exchange');
        
        // Simulating API delay
        await new Promise(r => setTimeout(r, 1000));
        
        setRates({
          solToUsd: 145.20, // Example rate
          usdcToNgn: 1650.00
        });
      } catch (error) {
        console.error("Failed to fetch rates", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  return { rates, loading };
};