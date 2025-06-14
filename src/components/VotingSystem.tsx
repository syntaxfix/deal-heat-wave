import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Flame } from 'lucide-react';
import { toast } from 'sonner';

interface VotingSystemProps {
  dealId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  initialHeatScore?: number;
}

export default function VotingSystem({ 
  dealId, 
  initialUpvotes = 0, 
  initialDownvotes = 0, 
  initialHeatScore = 0 
}: VotingSystemProps) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [heatScore, setHeatScore] = useState(initialHeatScore);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserVote();
    }
  }, [user, dealId]);

  const fetchUserVote = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('deal_votes')
      .select('vote_type')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setUserVote(data.vote_type as 'up' | 'down');
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('Please sign in to vote on deals');
      return;
    }

    try {
      // If user already voted the same way, remove the vote
      if (userVote === voteType) {
        const { error } = await supabase
          .from('deal_votes')
          .delete()
          .eq('deal_id', dealId)
          .eq('user_id', user.id);

        if (error) {
          toast.error('Unable to remove vote. Please try again.');
          return;
        }

        setUserVote(null);
        if (voteType === 'up') {
          setUpvotes(upvotes - 1);
        } else {
          setDownvotes(downvotes - 1);
        }
        toast.success('Vote removed');
      } else {
        // Insert or update vote
        const { error } = await supabase
          .from('deal_votes')
          .upsert({
            deal_id: dealId,
            user_id: user.id,
            vote_type: voteType,
          });

        if (error) {
          toast.error('Unable to cast vote. Please try again.');
          return;
        }

        // Update local state
        const previousVote = userVote;
        setUserVote(voteType);

        if (previousVote === 'up' && voteType === 'down') {
          setUpvotes(upvotes - 1);
          setDownvotes(downvotes + 1);
        } else if (previousVote === 'down' && voteType === 'up') {
          setDownvotes(downvotes - 1);
          setUpvotes(upvotes + 1);
        } else if (voteType === 'up') {
          setUpvotes(upvotes + 1);
        } else {
          setDownvotes(downvotes + 1);
        }

        toast.success(`Deal ${voteType}voted!`);
      }
    } catch (error) {
      console.error('Error handling vote:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const getHeatDisplay = () => {
    if (heatScore >= 90) return { temp: `${heatScore}°`, icon: '🔥', color: 'text-red-600' };
    if (heatScore >= 50) return { temp: `${heatScore}°`, icon: '🌡️', color: 'text-orange-500' };
    if (heatScore >= 0) return { temp: `${heatScore}°`, icon: '😐', color: 'text-yellow-500' };
    return { temp: `${heatScore}°`, icon: '🧊', color: 'text-blue-500' };
  };

  const heat = getHeatDisplay();

  return (
    <div className="flex items-center space-x-4">
      {/* Voting Buttons */}
      <div className="flex flex-col items-center space-y-1">
        <Button
          size="sm"
          variant={userVote === 'up' ? 'default' : 'outline'}
          onClick={() => handleVote('up')}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{upvotes}</span>
      </div>

      <div className="flex flex-col items-center space-y-1">
        <Button
          size="sm"
          variant={userVote === 'down' ? 'destructive' : 'outline'}
          onClick={() => handleVote('down')}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{downvotes}</span>
      </div>

      {/* Heat Score */}
      <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
        <span className="text-lg">{heat.icon}</span>
        <span className={`font-bold ${heat.color}`}>{heat.temp}</span>
      </div>
    </div>
  );
}
