<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class KnowledgeBaseController extends Controller
{
    public function index()
    {
        return Inertia::render('knowledge-base/Index', [
            'categories' => [
                'Getting Started', 
                'Referral Process',
                'Facility Management'
            ],
            'popularArticles' => [
                ['title' => 'Creating New Referrals', 'views' => 345],
                ['title' => 'Bed Availability Checks', 'views' => 278],
            ]
        ]);
    }

    public function show(string $slug)
    {
        return Inertia::render('knowledge-base/Show', [
            'article' => [
                'title' => 'Detailed Referral Process',
                'content' => 'Step-by-step guide for creating and managing referrals...',
                'lastUpdated' => '2024-02-15'
            ]
        ]);
    }
}