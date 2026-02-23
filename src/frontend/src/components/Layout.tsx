import { ReactNode } from 'react';
import BottomNav from './BottomNav';
import { useUserPlan } from '../hooks/useUserPlan';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isPremium } = useUserPlan();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/generated/app-logo.dim_256x256.png" alt="GST SmartAssist" className="w-10 h-10" />
            <h1 className="text-xl font-bold">GST SmartAssist</h1>
          </div>
          {isPremium && (
            <div className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
              <img src="/assets/generated/premium-badge.dim_96x96.png" alt="Premium" className="w-5 h-5" />
              <span className="text-sm font-semibold">Premium</span>
            </div>
          )}
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  );
}
