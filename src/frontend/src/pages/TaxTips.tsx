import { useState } from 'react';
import { useGetTaxTips } from '../hooks/useQueries';
import { useUserPlan } from '../hooks/useUserPlan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import ContextualUpgradePrompt from '../components/ContextualUpgradePrompt';

export default function TaxTips() {
  const { data: tips = [] } = useGetTaxTips();
  const { isPremium } = useUserPlan();
  const [selectedTip, setSelectedTip] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Tax Tips</h2>
        <p className="text-muted-foreground">Expert advice for tax optimization</p>
      </div>

      {!isPremium && (
        <ContextualUpgradePrompt context="premium-content" />
      )}

      <div className="grid gap-4">
        {tips.map((tip, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedTip(tip)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{tip.title}</CardTitle>
                {tip.isPremiumOnly && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Premium
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tip.shortDescription}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedTip} onOpenChange={() => setSelectedTip(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTip?.title}
              {selectedTip?.isPremiumOnly && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Premium
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedTip && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedTip.fullContent}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
