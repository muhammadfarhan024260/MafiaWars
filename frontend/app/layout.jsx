import { Outfit, Bebas_Neue } from 'next/font/google';
import { SocketProvider } from '@/context/SocketContext';
import { GameProvider } from '@/context/GameContext';
import './globals.css';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
});

export const metadata = {
  title: 'MAFIA WARS | Digital Narrator',
  description: 'A premium, real-time game narrator and role distributor for Mafia.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${bebasNeue.variable}`}>
      <body className="bg-black text-white font-sans selection:bg-red-600/30">
        <SocketProvider>
          <GameProvider>
            {children}
          </GameProvider>
        </SocketProvider>
      </body>
    </html>
  );
}

