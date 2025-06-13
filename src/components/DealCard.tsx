
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  ExternalLink,
  Clock,
  Eye,
  Tag
} from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  description: string;
  image: string;
  shopName: string;
  shopLogo: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  heatScore: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  views: number;
  expiry: string;
  category: string;
  affiliateLink: string;
  postedBy: string;
  postedTime: string;
}

interface DealCardProps {
  deal: Deal;
}

const getHeatColor = (score: number) => {
  if (score >= 80) return 'heat-gradient-hot';
  if (score >= 60) return 'heat-gradient-warm';
  if (score >= 40) return 'heat-gradient-cool';
  return 'heat-gradient-cold';
};

const getHeatLevel = (score: number) => {
  if (score >= 80) return 'Fire';
  if (score >= 60) return 'Hot';
  if (score >= 40) return 'Warm';
  return 'Cool';
};

const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const handleAffiliateClick = () => {
    // Cloaked affiliate link handling
    console.log('Redirecting to:', deal.affiliateLink);
    window.open(deal.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-48 h-48 sm:h-32">
            <img 
              src={deal.image} 
              alt={deal.title}
              className="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
              loading="lazy"
            />
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {deal.category}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                  {deal.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {deal.description}
                </p>
              </div>
              
              {/* Heat Score */}
              <div className="flex flex-col items-center ml-4">
                <div className={`
                  w-16 h-16 rounded-full flex flex-col items-center justify-center text-white font-bold text-sm
                  ${getHeatColor(deal.heatScore)} animate-heat-pulse
                `}>
                  <Flame className="w-4 h-4 mb-1" />
                  {deal.heatScore}°
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {getHeatLevel(deal.heatScore)}
                </span>
              </div>
            </div>

            {/* Shop and Price */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <img 
                  src={deal.shopLogo} 
                  alt={deal.shopName}
                  className="w-6 h-6 rounded"
                />
                <span className="text-sm font-medium">{deal.shopName}</span>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-deals-hot">
                    £{deal.discountedPrice}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    £{deal.originalPrice}
                  </span>
                </div>
                <Badge variant="destructive" className="text-xs">
                  -{deal.discountPercentage}%
                </Badge>
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{deal.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{deal.comments}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{deal.expiry}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="ml-1 text-xs">{deal.upvotes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <ThumbsDown className="w-4 h-4" />
                    <span className="ml-1 text-xs">{deal.downvotes}</span>
                  </Button>
                </div>
                
                <Button 
                  onClick={handleAffiliateClick}
                  className="bg-deals-hot hover:bg-deals-fire"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Get Deal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealCard;
