<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    protected function fetchWithFallback($model, $id, $relations = [])
    {
        try {
            return $model::with($relations)->findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            abort(404, 'Requested resource not found');
        }
    }

    protected function apiResponse($data, $status = 200)
    {
        return response()->json([
            'data' => $data,
            'meta' => [
                'timestamp' => now()->toISOString(),
                'version' => config('app.version')
            ]
        ], $status);
    }
}
