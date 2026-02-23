import { useState } from 'react';
import { useGetCallerUserProfile, useCreateGstCalculation, useGetCalculationsByUser, useDeleteCalculation } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { calculateGst, getEnumFromSlab, getSlabFromEnum } from '../utils/gstCalculations';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import AdBanner from '../components/AdBanner';
import { format } from 'date-fns';

export default function Calculator() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: calculations = [] } = useGetCalculationsByUser(userProfile?.email || '');
  const createCalculation = useCreateGstCalculation();
  const deleteCalculation = useDeleteCalculation();

  const [baseAmount, setBaseAmount] = useState('');
  const [gstSlab, setGstSlab] = useState('18');
  const [isInclusive, setIsInclusive] = useState(false);

  const result = baseAmount && !isNaN(Number(baseAmount)) && Number(baseAmount) > 0
    ? calculateGst(Number(baseAmount), Number(gstSlab), isInclusive)
    : null;

  const handleSave = async () => {
    if (!userProfile?.email) {
      toast.error('User profile not found');
      return;
    }

    if (!baseAmount || isNaN(Number(baseAmount)) || Number(baseAmount) <= 0) {
      toast.error('Please enter a valid base amount');
      return;
    }

    try {
      await createCalculation.mutateAsync({
        userEmail: userProfile.email,
        baseAmount: Number(baseAmount),
        gstSlab: getEnumFromSlab(Number(gstSlab)),
        isInclusive,
      });
      toast.success('Calculation saved successfully!');
    } catch (error) {
      toast.error('Failed to save calculation');
    }
  };

  const handleDelete = async (timestamp: bigint) => {
    if (!userProfile?.email) return;
    try {
      await deleteCalculation.mutateAsync({ userEmail: userProfile.email, timestamp });
      toast.success('Calculation deleted');
    } catch (error) {
      toast.error('Failed to delete calculation');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">GST Calculator</h2>
        <p className="text-muted-foreground">Calculate GST amounts instantly</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calculate GST</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="baseAmount">Base Amount (₹)</Label>
            <Input
              id="baseAmount"
              type="number"
              value={baseAmount}
              onChange={(e) => setBaseAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <Label htmlFor="gstSlab">GST Slab</Label>
            <Select value={gstSlab} onValueChange={setGstSlab}>
              <SelectTrigger id="gstSlab">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="12">12%</SelectItem>
                <SelectItem value="18">18%</SelectItem>
                <SelectItem value="28">28%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isInclusive">GST Inclusive</Label>
            <Switch id="isInclusive" checked={isInclusive} onCheckedChange={setIsInclusive} />
          </div>

          {result && (
            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">GST Amount:</span>
                <span className="text-sm font-bold">₹{result.gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">CGST (50%):</span>
                <span className="text-sm">₹{result.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">SGST (50%):</span>
                <span className="text-sm">₹{result.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-lg text-primary">₹{result.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={!result || createCalculation.isPending} className="w-full">
            {createCalculation.isPending ? 'Saving...' : 'Save Calculation'}
          </Button>
        </CardContent>
      </Card>

      <AdBanner />

      <Card>
        <CardHeader>
          <CardTitle>Calculation History</CardTitle>
        </CardHeader>
        <CardContent>
          {calculations.length === 0 ? (
            <p className="text-muted-foreground text-sm">No saved calculations yet</p>
          ) : (
            <div className="space-y-3">
              {calculations.map((calc) => (
                <div key={Number(calc.timestamp)} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      ₹{calc.baseAmount.toFixed(2)} @ {getSlabFromEnum(calc.gstSlab)}% {calc.isInclusive ? '(Inclusive)' : '(Exclusive)'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      GST: ₹{calc.gstAmount.toFixed(2)} | Total: ₹{calc.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(Number(calc.timestamp) / 1000000), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(calc.timestamp)}
                    disabled={deleteCalculation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
