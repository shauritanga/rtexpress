<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeBaseArticle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class KnowledgeBaseController extends Controller
{
    /**
     * Display the help center home page.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        // Get featured articles
        $featuredArticles = KnowledgeBaseArticle::where('status', 'published')
            ->where('is_featured', true)
            ->orderBy('sort_order')
            ->limit(6)
            ->get();

        // Get popular articles
        $popularArticles = KnowledgeBaseArticle::where('status', 'published')
            ->orderBy('view_count', 'desc')
            ->limit(8)
            ->get();

        // Get articles by category
        $categories = [
            'getting_started' => 'Getting Started',
            'shipping' => 'Shipping & Tracking',
            'billing' => 'Billing & Payments',
            'returns' => 'Returns & Refunds',
            'account' => 'Account Management',
            'technical' => 'Technical Support',
        ];

        $articlesByCategory = [];
        foreach ($categories as $key => $name) {
            $articlesByCategory[$key] = [
                'name' => $name,
                'articles' => KnowledgeBaseArticle::where('status', 'published')
                    ->where('category', $key)
                    ->orderBy('sort_order')
                    ->limit(5)
                    ->get()
            ];
        }

        return Inertia::render('Customer/Help/Index', [
            'customer' => $customer,
            'featuredArticles' => $featuredArticles,
            'popularArticles' => $popularArticles,
            'categories' => $categories,
            'articlesByCategory' => $articlesByCategory,
        ]);
    }

    /**
     * Display articles in a specific category.
     */
    public function category(Request $request, string $category): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        $categories = [
            'getting_started' => 'Getting Started',
            'shipping' => 'Shipping & Tracking',
            'billing' => 'Billing & Payments',
            'returns' => 'Returns & Refunds',
            'account' => 'Account Management',
            'technical' => 'Technical Support',
        ];

        if (!isset($categories[$category])) {
            return redirect()->route('customer.help.index');
        }

        $query = KnowledgeBaseArticle::where('status', 'published')
            ->where('category', $category);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $articles = $query->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Customer/Help/Category', [
            'customer' => $customer,
            'category' => $category,
            'categoryName' => $categories[$category],
            'articles' => $articles,
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Display a specific article.
     */
    public function show(KnowledgeBaseArticle $article): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        if ($article->status !== 'published') {
            return redirect()->route('customer.help.index');
        }

        // Increment view count
        $article->increment('view_count');

        // Get related articles
        $relatedArticles = KnowledgeBaseArticle::where('status', 'published')
            ->where('category', $article->category)
            ->where('id', '!=', $article->id)
            ->orderBy('view_count', 'desc')
            ->limit(4)
            ->get();

        $categories = [
            'getting_started' => 'Getting Started',
            'shipping' => 'Shipping & Tracking',
            'billing' => 'Billing & Payments',
            'returns' => 'Returns & Refunds',
            'account' => 'Account Management',
            'technical' => 'Technical Support',
        ];

        return Inertia::render('Customer/Help/Article', [
            'customer' => $customer,
            'article' => $article,
            'relatedArticles' => $relatedArticles,
            'categories' => $categories,
        ]);
    }

    /**
     * Search articles.
     */
    public function search(Request $request): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        $query = $request->get('q', '');
        $articles = collect();

        if (strlen($query) >= 2) {
            $articles = KnowledgeBaseArticle::where('status', 'published')
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('content', 'like', "%{$query}%")
                      ->orWhere('excerpt', 'like', "%{$query}%");
                })
                ->orderBy('view_count', 'desc')
                ->paginate(15)
                ->withQueryString();
        }

        $categories = [
            'getting_started' => 'Getting Started',
            'shipping' => 'Shipping & Tracking',
            'billing' => 'Billing & Payments',
            'returns' => 'Returns & Refunds',
            'account' => 'Account Management',
            'technical' => 'Technical Support',
        ];

        return Inertia::render('Customer/Help/Search', [
            'customer' => $customer,
            'query' => $query,
            'articles' => $articles,
            'categories' => $categories,
        ]);
    }

    /**
     * Mark article as helpful or not helpful.
     */
    public function helpful(Request $request, KnowledgeBaseArticle $article)
    {
        $validated = $request->validate([
            'helpful' => 'required|boolean',
        ]);

        if ($validated['helpful']) {
            $article->increment('helpful_count');
        } else {
            $article->increment('not_helpful_count');
        }

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your feedback!'
        ]);
    }
}
