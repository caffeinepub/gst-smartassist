import { useState } from 'react';
import { useGetUpcomingDueDates, useGetUserCustomReminders, useCreateCustomReminder } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Type } from '../backend';

export default function Reminders() {
  const { data: dueDates = [] } = useGetUpcomingDueDates();
  const { data: customReminders = [] } = useGetUserCustomReminders();
  const createReminder = useCreateCustomReminder();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const allReminders = [...dueDates, ...customReminders].sort((a, b) => Number(a.dueDate - b.dueDate));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dueDateTimestamp = BigInt(new Date(dueDate).getTime() * 1000000);
      await createReminder.mutateAsync({
        title,
        description,
        dueDate: dueDateTimestamp,
        reminderEnabled,
      });
      toast.success('Reminder created successfully!');
      setOpen(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setReminderEnabled(true);
    } catch (error) {
      toast.error('Failed to create reminder');
    }
  };

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

  const getTypeColor = (type: Type) => {
    switch (type) {
      case Type.gstFiling:
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case Type.advanceTax:
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
      case Type.custom:
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Reminders</h2>
          <p className="text-muted-foreground">Never miss a filing deadline</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Reminder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reminderEnabled">Enable Reminder</Label>
                <Switch
                  id="reminderEnabled"
                  checked={reminderEnabled}
                  onCheckedChange={setReminderEnabled}
                />
              </div>
              <Button type="submit" disabled={createReminder.isPending} className="w-full">
                {createReminder.isPending ? 'Creating...' : 'Create Reminder'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {allReminders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming reminders</p>
          ) : (
            <div className="space-y-3">
              {allReminders.map((reminder, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{reminder.title}</h3>
                    <Badge className={getTypeColor(reminder.dueDateType)}>
                      {getTypeLabel(reminder.dueDateType)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{reminder.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {format(new Date(Number(reminder.dueDate) / 1000000), 'MMM dd, yyyy')}
                    </span>
                    <span className="font-medium text-primary">
                      {formatDistanceToNow(new Date(Number(reminder.dueDate) / 1000000), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
