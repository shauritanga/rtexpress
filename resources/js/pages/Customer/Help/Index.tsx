import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Search,
    BookOpen,
    Package,
    CreditCard,
    RotateCcw,
    Settings,
    Bug,
    Star,
    Eye,
    ArrowRight,
    HelpCircle,
    MessageSquare,
    Phone
} from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    company_name: string;
    customer_code: string;
}

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    view_count: number;
    helpful_count: number;
    created_at: string;
}

interface Props {
    customer: Customer;
    featuredArticles: Article[];
    popularArticles: Article[];
    categories: Record<string, string>;
    articlesByCategory: Record<string, {
        name: string;
        articles: Article[];
    }>;
}

export default function HelpIndex({ 
    customer, 
    featuredArticles, 
    popularArticles, 
    categories, 
    articlesByCategory 
}: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/customer/help/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    const getCategoryIcon = (category: string) => {
        const icons = {
            getting_started: BookOpen,
            shipping: Package,
            billing: CreditCard,
            returns: RotateCcw,
            account: Settings,
            technical: Bug,
        };
        return icons[category as keyof typeof icons] || HelpCircle;
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            getting_started: 'bg-blue-100 text-blue-800',
            shipping: 'bg-green-100 text-green-800',
            billing: 'bg-yellow-100 text-yellow-800',
            returns: 'bg-orange-100 text-orange-800',
            account: 'bg-purple-100 text-purple-800',
            technical: 'bg-red-100 text-red-800',
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout>
            <Head title="Help Center" />
            
            <div className="space-y-8 px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            How can we help you?
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Search our knowledge base or browse categories to find answers
                        </p>
                        
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search for help articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 py-3 text-lg"
                            />
                            <Button 
                                type="submit" 
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                size="sm"
                            >
                                Search
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                            <h3 className="font-semibold mb-2">Create Support Ticket</h3>
                            <p className="text-sm text-gray-600 mb-4">Get personalized help from our support team</p>
                            <Button asChild>
                                <Link href="/customer/support/create">Create Ticket</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <Phone className="h-8 w-8 text-green-600 mx-auto mb-3" />
                            <h3 className="font-semibold mb-2">Call Support</h3>
                            <p className="text-sm text-gray-600 mb-4">Speak directly with our support team</p>
                            <Button variant="outline">
                                +1 (555) 123-4567
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                            <h3 className="font-semibold mb-2">Browse Categories</h3>
                            <p className="text-sm text-gray-600 mb-4">Find answers organized by topic</p>
                            <Button variant="outline">
                                Browse All
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Featured Articles */}
                {featuredArticles.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredArticles.map((article) => {
                                const Icon = getCategoryIcon(article.category);
                                return (
                                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Icon className="h-4 w-4" />
                                                <Badge className={getCategoryColor(article.category)}>
                                                    {categories[article.category]}
                                                </Badge>
                                            </div>
                                            <h3 className="font-semibold mb-2 line-clamp-2">
                                                <Link 
                                                    href={`/customer/help/article/${article.slug}`}
                                                    className="hover:text-blue-600"
                                                >
                                                    {article.title}
                                                </Link>
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                                {article.excerpt}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3" />
                                                        {article.view_count}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Star className="h-3 w-3" />
                                                        {article.helpful_count}
                                                    </span>
                                                </div>
                                                <ArrowRight className="h-3 w-3" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Categories */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(articlesByCategory).map(([categoryKey, categoryData]) => {
                            const Icon = getCategoryIcon(categoryKey);
                            return (
                                <Card key={categoryKey} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${getCategoryColor(categoryKey).replace('text-', 'bg-').replace('800', '100')}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">
                                                    <Link 
                                                        href={`/customer/help/category/${categoryKey}`}
                                                        className="hover:text-blue-600"
                                                    >
                                                        {categoryData.name}
                                                    </Link>
                                                </CardTitle>
                                                <CardDescription>
                                                    {categoryData.articles.length} articles
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {categoryData.articles.slice(0, 4).map((article) => (
                                                <div key={article.id}>
                                                    <Link 
                                                        href={`/customer/help/article/${article.slug}`}
                                                        className="text-sm text-gray-600 hover:text-blue-600 line-clamp-1"
                                                    >
                                                        {article.title}
                                                    </Link>
                                                </div>
                                            ))}
                                            {categoryData.articles.length > 4 && (
                                                <Link 
                                                    href={`/customer/help/category/${categoryKey}`}
                                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    View all {categoryData.articles.length} articles →
                                                </Link>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Popular Articles */}
                {popularArticles.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {popularArticles.slice(0, 6).map((article, index) => {
                                const Icon = getCategoryIcon(article.category);
                                return (
                                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Icon className="h-3 w-3" />
                                                        <Badge variant="outline" className="text-xs">
                                                            {categories[article.category]}
                                                        </Badge>
                                                    </div>
                                                    <h4 className="font-medium text-sm mb-1 line-clamp-2">
                                                        <Link 
                                                            href={`/customer/help/article/${article.slug}`}
                                                            className="hover:text-blue-600"
                                                        >
                                                            {article.title}
                                                        </Link>
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="h-3 w-3" />
                                                            {article.view_count}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Star className="h-3 w-3" />
                                                            {article.helpful_count}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Contact Section */}
                <Card className="bg-gray-50">
                    <CardContent className="p-8 text-center">
                        <h3 className="text-xl font-semibold mb-4">Still need help?</h3>
                        <p className="text-gray-600 mb-6">
                            Can't find what you're looking for? Our support team is here to help.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild>
                                <Link href="/customer/support/create">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Create Support Ticket
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/customer/support">
                                    View My Tickets
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
