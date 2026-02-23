import { useUserPlan } from '../hooks/useUserPlan';
import { useNavigate } from '@tanstack/react-router';

export default function AdBanner() {
  const { isPremium } = useUserPlan();
  const navigate = useNavigate();

  if (isPremium) return null;

  return (
    <div className="my-6 rounded-lg overflow-hidden shadow-md cursor-pointer" onClick={() => navigate({ to: '/upgrade' })}>
      <img src="/assets/generated/ad-banner.dim_800x200.png" alt="Upgrade to Premium" className="w-full h-auto" />
    </div>
  );
}
