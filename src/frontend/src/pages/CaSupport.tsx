import { useState } from 'react';
import { useGetUserCaLeads, useSubmitCaLead } from '../hooks/useQueries';
import { useUserPlan } from '../hooks/useUserPlan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ContextualUpgradePrompt from '../components/ContextualUpgradePrompt';
import { format } from 'date-fns';
import { Status } from '../backend';

export default function CaSupport() {
  const { isPremium } = useUserPlan();
  const { data: leads = [] } = useGetUserCaLeads();
  const submitLead = useSubmitCaLead();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitLead.mutateAsync({
        name,
        phone,
        queryDescription: query,
        fileUpload: null,
      });
      toast.success('Query submitted successfully! Our CA will contact you soon.');
      setName('');
      setPhone('');
      setQuery('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit query');
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.pending:
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
      case Status.assigned:
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case Status.closed:
        return 'bg-green-500/10 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: Status) => {
    switch (status) {
      case Status.pending:
        return 'Pending';
      case Status.assigned:
        return 'Assigned';
      case Status.closed:
        return 'Closed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">CA Support</h2>
        <p className="text-muted-foreground">Get expert assistance from chartered accountants</p>
      </div>

      {!isPremium ? (
        <ContextualUpgradePrompt context="ca-support" />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Query</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="query">Your Query</Label>
                  <Textarea
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" disabled={submitLead.isPending} className="w-full">
                  {submitLead.isPending ? 'Submitting...' : 'Submit Query'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Queries</CardTitle>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <p className="text-muted-foreground text-sm">No queries submitted yet</p>
              ) : (
                <div className="space-y-3">
                  {leads.map((lead, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.phone}</p>
                        </div>
                        <Badge className={getStatusColor(lead.status)}>
                          {getStatusLabel(lead.status)}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{lead.queryDescription}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(Number(lead.createdDate) / 1000000), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
