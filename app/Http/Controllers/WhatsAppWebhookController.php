<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WhatsAppWebhookController extends Controller
{
    public function handle(Request $request)
    {
        // Accept and acknowledge webhook; processing can be queued
        return response()->json(['status' => 'ok']);
    }
}

