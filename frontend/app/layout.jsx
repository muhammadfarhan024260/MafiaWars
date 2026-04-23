import { Outfit, Bebas_Neue } from 'next/font/google';
import { SocketProvider } from '@/context/SocketContext';
import { GameProvider } from '@/context/GameContext';
import StarField from '@/components/StarField';
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
  title: 'MAFIA WARS',
  description: 'Digital role dealer for Mafia game nights.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${bebasNeue.variable}`}>
      <body className="bg-space-900 text-white font-sans selection:bg-impostor/30">
        <StarField />
        <div className="relative z-10">
          <SocketProvider>
            <GameProvider>
              {children}
            </GameProvider>
          </SocketProvider>
        </div>
      </body>
    </html>
  );
}
