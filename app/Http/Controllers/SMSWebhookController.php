<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SMSWebhookController extends Controller
{
    public function handle(Request $request)
    {
        return response()->json(['status' => 'ok']);
    }
}

