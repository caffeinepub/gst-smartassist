import { useUserPlan } from '../hooks/useUserPlan';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function UpgradeBanner() {
  const { isPremium } = useUserPlan();
  const navigate = useNavigate();

  if (isPremium) return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Upgrade to Premium</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Get unlimited invoices, advanced tips, and priority support for just ₹49/month
          </p>
          <Button onClick={() => navigate({ to: '/upgrade' })} size="sm">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
}
