<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EmailWebhookController extends Controller
{
    public function handle(Request $request)
    {
        return response()->json(['status' => 'ok']);
    }
}

