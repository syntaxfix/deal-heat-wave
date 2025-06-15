
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, ExternalLink, Store, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import VotingSystem from './VotingSystem';

interface Deal {
  id: string;
  title: string;
  description?: string;
  summary?: string;
  image_url?: string;
  original_price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  slug?: string;
  created_at: string;
  upvotes?: number;
  downvotes?: number;
  heat_score?: number;
  affiliate_link?: string;
  categories?: { name: string; slug: string };
  shops?: { name: string; slug: string; logo_url?: string };
}

interface DealCardFullProps {
  deal: Deal;
}

const DealCardFull = ({ deal }: DealCardFullProps) => {
  const {
    id,
    title,
    description,
    summary,
    image_url,
    original_price = 0,
    discounted_price = 0,
    discount_percentage = 0,
    slug,
    created_at,
    upvotes = 0,
    downvotes = 0,
    heat_score = 0,
    affiliate_link,
    categories,
    shops
  } = deal;

  const displayDescription = description || summary || '';
  const dealSlug = slug || id;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Image Section */}
          <div className="lg:w-80 flex-shrink-0">
            <Link to={`/deal/${dealSlug}`}>
              <div className="relative aspect-video lg:aspect-square bg-gray-100 overflow-hidden">
                {image_url ? (
                  <img
                    src={image_url}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                    <Store className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Discount Badge */}
                {discount_percentage > 0 && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-3 py-1">
                      {discount_percentage}% OFF
                    </Badge>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 space-y-4">
            {/* Category and Shop */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {categories && (
                  <Link 
                    to={`/category/${categories.slug}`}
                    className="flex items-center space-x-1 text-sm text-primary hover:underline font-medium"
                  >
                    <Tag className="h-3 w-3" />
                    <span>{categories.name}</span>
                  </Link>
                )}
                {shops && (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={shops.logo_url} />
                      <AvatarFallback className="text-xs">
                        {shops.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Link 
                      to={`/shop/${shops.slug}`}
                      className="text-sm text-gray-600 hover:text-primary font-medium"
                    >
                      {shops.name}
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(created_at), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Title */}
            <Link to={`/deal/${dealSlug}`}>
              <h2 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                {title}
              </h2>
            </Link>

            {/* Description */}
            {displayDescription && (
              <p className="text-gray-600 line-clamp-3 text-lg leading-relaxed">
                {displayDescription}
              </p>
            )}

            {/* Price and Action Section */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                {/* Price Section */}
                {original_price > 0 && discounted_price > 0 && (
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-green-600">
                      ${discounted_price.toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${original_price.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Voting */}
                <VotingSystem
                  dealId={id}
                  initialUpvotes={upvotes}
                  initialDownvotes={downvotes}
                  initialHeatScore={heat_score}
                />
              </div>

              {/* Action Button */}
              {affiliate_link && (
                <a
                  href={affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg text-lg font-semibold flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Get Deal</span>
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealCardFull;
