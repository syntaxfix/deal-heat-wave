
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Flame } from 'lucide-react';
import { toast } from 'sonner';

interface VotingSystemProps {
  dealId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialHeatScore: number;
}

const VotingSystem = ({ dealId, initialUpvotes, initialDownvotes, initialHeatScore }: VotingSystemProps) => {
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

    const { data } = await supabase
      .from('deal_votes')
      .select('vote_type')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .single();

    if (data) {
      setUserVote(data.vote_type as 'up' | 'down');
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    setIsLoading(true);

    try {
      // Remove existing vote if same type
      if (userVote === voteType) {
        const { error } = await supabase
          .from('deal_votes')
          .delete()
          .eq('deal_id', dealId)
          .eq('user_id', user.id);

        if (error) throw error;

        setUserVote(null);
        if (voteType === 'up') {
          setUpvotes(prev => prev - 1);
          setHeatScore(prev => prev - 2);
        } else {
          setDownvotes(prev => prev - 1);
          setHeatScore(prev => prev + 1);
        }
      } else {
        // Insert or update vote
        const { error } = await supabase
          .from('deal_votes')
          .upsert({
            deal_id: dealId,
            user_id: user.id,
            vote_type: voteType
          });

        if (error) throw error;

        // Update local state
        if (userVote) {
          // Switching vote type
          if (userVote === 'up' && voteType === 'down') {
            setUpvotes(prev => prev - 1);
            setDownvotes(prev => prev + 1);
            setHeatScore(prev => prev - 3); // -2 for removing upvote, -1 for adding downvote
          } else if (userVote === 'down' && voteType === 'up') {
            setDownvotes(prev => prev - 1);
            setUpvotes(prev => prev + 1);
            setHeatScore(prev => prev + 3); // +1 for removing downvote, +2 for adding upvote
          }
        } else {
          // New vote
          if (voteType === 'up') {
            setUpvotes(prev => prev + 1);
            setHeatScore(prev => prev + 2);
          } else {
            setDownvotes(prev => prev + 1);
            setHeatScore(prev => prev - 1);
          }
        }

        setUserVote(voteType);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }

    setIsLoading(false);
  };

  const getHeatColor = () => {
    if (heatScore >= 50) return 'text-red-600';
    if (heatScore >= 20) return 'text-orange-500';
    if (heatScore >= 10) return 'text-yellow-500';
    return 'text-gray-500';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote('up')}
          disabled={isLoading}
          className={`p-1 h-8 ${userVote === 'up' ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:text-green-600'}`}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[2rem] text-center">
          {upvotes}
        </span>
      </div>

      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote('down')}
          disabled={isLoading}
          className={`p-1 h-8 ${userVote === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-500 hover:text-red-600'}`}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[2rem] text-center">
          {downvotes}
        </span>
      </div>

      <div className="flex items-center space-x-1 ml-2">
        <Flame className={`h-4 w-4 ${getHeatColor()}`} />
        <span className={`text-sm font-bold ${getHeatColor()}`}>
          {heatScore}°
        </span>
      </div>
    </div>
  );
};

export default VotingSystem;
