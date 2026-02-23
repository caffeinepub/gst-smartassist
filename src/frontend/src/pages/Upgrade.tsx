import { useUserPlan } from '../hooks/useUserPlan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export default function Upgrade() {
  const { isPremium, subscriptionExpiry } = useUserPlan();

  const features = [
    { name: 'GST Calculator', free: true, premium: true },
    { name: 'Invoice Generation', free: '3/month', premium: 'Unlimited' },
    { name: 'Due Date Reminders', free: true, premium: true },
    { name: 'Learning Content', free: true, premium: true },
    { name: 'Basic Tax Tips', free: true, premium: true },
    { name: 'Advanced Tax Tips', free: false, premium: true },
    { name: 'CA Support', free: false, premium: true },
    { name: 'Ad-Free Experience', free: false, premium: true },
  ];

  const handleUpgrade = () => {
    window.open('https://razorpay.com', '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Upgrade to Premium</h2>
        <p className="text-muted-foreground">Unlock all features and grow your business</p>
      </div>

      {isPremium ? (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <img src="/assets/generated/premium-badge.dim_96x96.png" alt="Premium" className="w-12 h-12" />
              <div>
                <CardTitle>You're on Premium!</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {subscriptionExpiry
                    ? `Expires on ${format(new Date(Number(subscriptionExpiry) / 1000000), 'MMM dd, yyyy')}`
                    : 'Active subscription'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Thank you for being a Premium member. Enjoy unlimited access to all features!</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Premium Plan</CardTitle>
                <p className="text-3xl font-bold text-primary">₹49<span className="text-base font-normal text-muted-foreground">/month</span></p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">Unlimited invoice generation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">Advanced tax-saving tips</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">Priority CA support</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">Ad-free experience</span>
              </div>
            </div>
            <Button onClick={handleUpgrade} size="lg" className="w-full">
              Upgrade Now
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              After payment, our admin will activate your Premium access within 24 hours
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Feature</th>
                  <th className="text-center py-3 px-2">Free</th>
                  <th className="text-center py-3 px-2">Premium</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-2 text-sm">{feature.name}</td>
                    <td className="py-3 px-2 text-center">
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm">{feature.free}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {typeof feature.premium === 'boolean' ? (
                        feature.premium ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-medium">{feature.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
