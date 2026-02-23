import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile, useGetUpcomingDueDates } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UpgradeBanner from '../components/UpgradeBanner';
import AdBanner from '../components/AdBanner';
import { Calculator, FileText, TrendingUp, Lightbulb } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Type } from '../backend';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: dueDates = [] } = useGetUpcomingDueDates();

  const upcomingDueDates = dueDates
    .sort((a, b) => Number(a.dueDate - b.dueDate))
    .slice(0, 3);

  const getTypeLabel = (type: Type) => {
    switch (type) {
      case Type.gstFiling:
        return 'GST Filing';
      case Type.advanceTax:
        return 'Advance Tax';
      case Type.custom:
        return 'Custom';
      default:
        return 'Other';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back, {userProfile?.name || 'User'}!</h2>
        <p className="text-muted-foreground">Manage your GST compliance with ease</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => navigate({ to: '/calculator' })}
          className="h-24 flex flex-col items-center justify-center gap-2"
          variant="outline"
        >
          <Calculator className="w-8 h-8" />
          <span className="text-sm font-semibold">GST Calculator</span>
        </Button>
        <Button
          onClick={() => navigate({ to: '/invoices' })}
          className="h-24 flex flex-col items-center justify-center gap-2"
          variant="outline"
        >
          <FileText className="w-8 h-8" />
          <span className="text-sm font-semibold">Create Invoice</span>
        </Button>
        <Button
          onClick={() => navigate({ to: '/tax-tips' })}
          className="h-24 flex flex-col items-center justify-center gap-2"
          variant="outline"
        >
          <Lightbulb className="w-8 h-8" />
          <span className="text-sm font-semibold">Tax Tips</span>
        </Button>
        <Button
          onClick={() => navigate({ to: '/upgrade' })}
          className="h-24 flex flex-col items-center justify-center gap-2"
          variant="outline"
        >
          <TrendingUp className="w-8 h-8" />
          <span className="text-sm font-semibold">Upgrade</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Due Dates</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingDueDates.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming due dates</p>
          ) : (
            <div className="space-y-3">
              {upcomingDueDates.map((dueDate, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{dueDate.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(Number(dueDate.dueDate) / 1000000), { addSuffix: true })}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded">
                    {getTypeLabel(dueDate.dueDateType)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Button onClick={() => navigate({ to: '/reminders' })} variant="link" className="mt-4 w-full">
            View All Reminders
          </Button>
        </CardContent>
      </Card>

      <UpgradeBanner />
      <AdBanner />
    </div>
  );
}
