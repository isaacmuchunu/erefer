<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class WebhookVerify
{
    public function handle(Request $request, Closure $next): Response
    {
        $signatureHeader = $request->header('X-Signature');
        $secret = config('services.webhooks.secret');

        if (!$secret) {
            return $next($request);
        }

        $payload = $request->getContent();
        $computed = base64_encode(hash_hmac('sha256', $payload, $secret, true));

        if (!$signatureHeader || !hash_equals($computed, $signatureHeader)) {
            return response()->json(['message' => 'Invalid webhook signature'], 401);
        }

        return $next($request);
    }
}

