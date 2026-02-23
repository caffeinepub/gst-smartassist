import { Button } from './ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';

interface ContextualUpgradePromptProps {
  context: 'invoice-limit' | 'premium-content' | 'ca-support';
}

interface MessageContent {
  title: string;
  description: string;
}

export default function ContextualUpgradePrompt({ context }: ContextualUpgradePromptProps) {
  const navigate = useNavigate();

  const messages: { [key: string]: MessageContent } = {
    'invoice-limit': {
      title: 'Invoice Limit Reached',
      description: "You've reached the 3 invoices per month limit on the Free plan. Upgrade to Premium for unlimited invoices.",
    },
    'premium-content': {
      title: 'Premium Content',
      description: 'This content is available exclusively for Premium members. Upgrade to access advanced tax tips and strategies.',
    },
    'ca-support': {
      title: 'CA Support Access',
      description: 'Connect with expert Chartered Accountants for personalized tax guidance. Available only on Premium plan.',
    },
  };

  const message = messages[context];

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">{message.title}</h3>
          <p className="text-muted-foreground mb-4">{message.description}</p>
          <Button onClick={() => navigate({ to: '/upgrade' })} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Upgrade to Premium
          </Button>
        </div>
      </div>
    </div>
  );
}
