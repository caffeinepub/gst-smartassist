import { useGetCallerUserProfile } from './useQueries';
import { Plan } from '../backend';

export function useUserPlan() {
  const { data: userProfile } = useGetCallerUserProfile();

  const isPremium = userProfile?.plan === Plan.premium;
  const planType = isPremium ? 'premium' : 'free';
  const subscriptionExpiry = userProfile?.subscriptionExpiry;

  return {
    isPremium,
    planType,
    subscriptionExpiry,
    userProfile,
  };
}
