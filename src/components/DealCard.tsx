
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, ExternalLink, Store } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import VotingSystem from './VotingSystem';

interface DealCardProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  category: string;
  categorySlug: string;
  shop: string;
  shopSlug: string;
  shopLogo?: string;
  heatScore: number;
  upvotes: number;
  downvotes: number;
  postedTime: string;
  affiliateLink?: string;
}

const DealCard = ({
  id,
  title,
  description,
  image,
  originalPrice,
  discountedPrice,
  discountPercentage,
  category,
  categorySlug,
  shop,
  shopSlug,
  shopLogo,
  heatScore,
  upvotes,
  downvotes,
  postedTime,
  affiliateLink
}: DealCardProps) => {
  const getHeatColor = (score: number) => {
    if (score >= 90) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 0) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md">
      <CardContent className="p-0">
        {/* Image Section */}
        <Link to={`/deal/${id}`}>
          <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                <Store className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {/* Discount Badge */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-600 hover:bg-green-700 text-white font-bold">
                {discountPercentage}% OFF
              </Badge>
            </div>
          </div>
        </Link>

        <div className="p-4 space-y-3">
          {/* Category and Shop */}
          <div className="flex items-center justify-between">
            <Link 
              to={`/category/${categorySlug}`}
              className="text-xs text-primary hover:underline font-medium"
            >
              {category}
            </Link>
            <div className="flex items-center space-x-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={shopLogo} />
                <AvatarFallback className="text-xs">
                  {shop.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Link 
                to={`/shop/${shopSlug}`}
                className="text-xs text-gray-600 hover:text-primary"
              >
                {shop}
              </Link>
            </div>
          </div>

          {/* Title */}
          <Link to={`/deal/${id}`}>
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {description}
            </p>
          )}

          {/* Price Section */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-green-600">
              ${discountedPrice.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 line-through">
              ${originalPrice.toFixed(2)}
            </span>
          </div>

          {/* Voting and Time */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <VotingSystem
              dealId={id}
              initialUpvotes={upvotes}
              initialDownvotes={downvotes}
              initialHeatScore={heatScore}
            />
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(postedTime), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Action Button */}
          {affiliateLink && (
            <a
              href={affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Get Deal</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DealCard;
