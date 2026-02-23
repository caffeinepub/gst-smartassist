import { useState } from 'react';
import { useGetCallerUserProfile, useCreateInvoice, useGetUserInvoices, useDeleteInvoice } from '../hooks/useQueries';
import { useUserPlan } from '../hooks/useUserPlan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Trash2, Eye } from 'lucide-react';
import { getCurrentMonthInvoiceCount, isInvoiceLimitReached } from '../utils/invoiceLimits';
import ContextualUpgradePrompt from '../components/ContextualUpgradePrompt';
import { format } from 'date-fns';
import { getSlabFromEnum } from '../utils/gstCalculations';
import { Slab } from '../backend';
import type { T__2 } from '../backend';

export default function Invoices() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: invoices = [] } = useGetUserInvoices(userProfile?.email || '');
  const { isPremium } = useUserPlan();
  const createInvoice = useCreateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [gstSlab, setGstSlab] = useState('18');
  const [selectedInvoice, setSelectedInvoice] = useState<T__2 | null>(null);

  const currentMonthCount = getCurrentMonthInvoiceCount(invoices);
  const limitReached = isInvoiceLimitReached(invoices, isPremium);

  const itemTotal = Number(quantity) * Number(price);
  const gstAmount = itemTotal * (Number(gstSlab) / 100);
  const grandTotal = itemTotal + gstAmount;

  const getSlabEnum = (slabValue: string): Slab => {
    switch (slabValue) {
      case '5':
        return Slab.slab5;
      case '12':
        return Slab.slab12;
      case '18':
        return Slab.slab18;
      case '28':
        return Slab.slab28;
      default:
        return Slab.slab18;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile?.email) {
      toast.error('User profile not found');
      return;
    }

    if (limitReached) {
      toast.error('Invoice limit reached. Upgrade to Premium for unlimited invoices.');
      return;
    }

    try {
      await createInvoice.mutateAsync({
        userEmail: userProfile.email,
        customerName,
        customerPhone,
        itemName,
        quantity: BigInt(quantity),
        price: Number(price),
        gstSlab: getSlabEnum(gstSlab),
      });
      toast.success('Invoice created successfully!');
      setCustomerName('');
      setCustomerPhone('');
      setItemName('');
      setQuantity('1');
      setPrice('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create invoice');
    }
  };

  const handleDelete = async (invoiceNumber: string) => {
    if (!userProfile?.email) return;
    try {
      await deleteInvoice.mutateAsync({ invoiceNumber, userEmail: userProfile.email });
      toast.success('Invoice deleted');
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Invoice Generator</h2>
        <p className="text-muted-foreground">Create and manage your invoices</p>
      </div>

      {!isPremium && (
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <p className="text-sm font-medium">
            Free Plan: {currentMonthCount} of 3 invoices used this month
          </p>
        </div>
      )}

      {limitReached ? (
        <ContextualUpgradePrompt context="invoice-limit" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create New Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
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

              {price && quantity && (
                <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Item Total:</span>
                    <span className="text-sm">₹{itemTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">GST ({gstSlab}%):</span>
                    <span className="text-sm">₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Grand Total:</span>
                    <span className="font-bold text-lg text-primary">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button type="submit" disabled={createInvoice.isPending} className="w-full">
                {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-muted-foreground text-sm">No invoices yet</p>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.invoiceNumber} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">#{invoice.invoiceNumber}</p>
                    <p className="text-sm">{invoice.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(Number(invoice.createdDate) / 1000000), 'MMM dd, yyyy')} | ₹{invoice.grandTotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(invoice)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(invoice.invoiceNumber)}
                      disabled={deleteInvoice.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="font-medium">#{selectedInvoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{selectedInvoice.customerName}</p>
                <p className="text-sm">{selectedInvoice.customerPhone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Item</p>
                <p className="font-medium">{selectedInvoice.itemName}</p>
                <p className="text-sm">Qty: {Number(selectedInvoice.quantity)} × ₹{selectedInvoice.price.toFixed(2)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Item Total:</span>
                  <span className="text-sm">₹{selectedInvoice.itemTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">GST ({getSlabFromEnum(selectedInvoice.gstSlab)}%):</span>
                  <span className="text-sm">₹{selectedInvoice.gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Grand Total:</span>
                  <span className="font-bold text-primary">₹{selectedInvoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                PDF generation coming soon
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
