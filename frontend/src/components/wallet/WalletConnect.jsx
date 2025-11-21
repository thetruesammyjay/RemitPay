import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Wrapper to style the default Solana Adapter button to match our theme
const WalletConnect = () => {
  return (
    <div className="remiteasy-wallet-btn">
      <WalletMultiButton />
    </div>
  );
};

export default WalletConnect;