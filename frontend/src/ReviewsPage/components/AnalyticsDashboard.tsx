import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Star, TrendingUp, Users, MessageSquare, BarChart3 } from "lucide-react";

interface AnalyticsDashboardProps {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
}

export function AnalyticsDashboard({ 
  totalReviews, 
  averageRating, 
  ratingDistribution 
}: AnalyticsDashboardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : star <= rating
                ? "fill-yellow-200 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getProgressColor = (rating: number) => {
    if (rating >= 4) return "bg-green-500";
    if (rating >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const maxCount = Math.max(...Object.values(ratingDistribution));

  const insights = [
    {
      title: "Customer Satisfaction",
      value: `${Math.round((averageRating / 5) * 100)}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Total Customers",
      value: "247",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Response Rate",
      value: "89%",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h2>
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          <BarChart3 className="h-3 w-3 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Average Rating Card */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex flex-col">
                {renderStars(averageRating)}
                <span className="text-xs text-gray-500 mt-1">
                  Based on {totalReviews} reviews
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights Cards */}
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                  <div className={`p-1 rounded ${insight.bgColor}`}>
                    <Icon className={`h-4 w-4 ${insight.color}`} />
                  </div>
                  <span>{insight.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-gray-900">{insight.value}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 min-w-[80px]">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <Progress 
                      value={percentage} 
                      className="h-3"
                    />
                    <div 
                      className={`absolute top-0 left-0 h-3 rounded-full ${getProgressColor(rating)} transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="min-w-[60px] text-right">
                  <span className="text-sm text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New 5-star review received</p>
                <p className="text-xs text-gray-600">House Cleaning service • 2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Average rating improved</p>
                <p className="text-xs text-gray-600">From 4.2 to 4.4 stars • 1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Review pending moderation</p>
                <p className="text-xs text-gray-600">Garden Maintenance service • 3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}