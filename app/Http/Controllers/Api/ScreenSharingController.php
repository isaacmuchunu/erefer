<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VideoCall;
use App\Models\AuditLog;
use App\Events\ScreenSharingStarted;
use App\Events\ScreenSharingStopped;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ScreenSharingController extends Controller
{
    /**
     * Start screen sharing in a video call
     */
    public function startScreenSharing(Request $request, VideoCall $videoCall): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user is a participant
            $participant = $videoCall->participants()->where('user_id', $user->id)->first();
            if (!$participant) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not a participant of this call'
                ], 403);
            }

            // Check if call is active
            if (!$videoCall->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Call is not active'
                ], 400);
            }

            // Check if screen sharing is enabled
            if (!$videoCall->isScreenSharingEnabled()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Screen sharing is not enabled for this call'
                ], 400);
            }

            // Check if someone else is already sharing
            $currentSharer = $videoCall->participants()
                ->where('is_screen_sharing', true)
                ->first();

            if ($currentSharer && $currentSharer->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Another participant is already sharing their screen',
                    'current_sharer' => $currentSharer->user->full_name
                ], 409);
            }

            // Start screen sharing
            $participant->update([
                'is_screen_sharing' => true,
                'screen_sharing_started_at' => now(),
            ]);

            // Broadcast screen sharing started
            broadcast(new ScreenSharingStarted($videoCall, $user))->toOthers();

            // Log the action
            AuditLog::logActivity(
                'video_call.screen_sharing.started',
                $videoCall,
                [],
                ['user_id' => $user->id],
                "Screen sharing started by {$user->full_name} in call '{$videoCall->title}'",
                'info',
                ['communication', 'video_call', 'screen_sharing']
            );

            return response()->json([
                'success' => true,
                'message' => 'Screen sharing started successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error starting screen sharing: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to start screen sharing',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Stop screen sharing in a video call
     */
    public function stopScreenSharing(Request $request, VideoCall $videoCall): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user is a participant
            $participant = $videoCall->participants()->where('user_id', $user->id)->first();
            if (!$participant) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not a participant of this call'
                ], 403);
            }

            // Check if user is currently sharing
            if (!$participant->is_screen_sharing) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not currently sharing your screen'
                ], 400);
            }

            // Stop screen sharing
            $participant->update([
                'is_screen_sharing' => false,
                'screen_sharing_stopped_at' => now(),
            ]);

            // Broadcast screen sharing stopped
            broadcast(new ScreenSharingStopped($videoCall, $user))->toOthers();

            // Log the action
            AuditLog::logActivity(
                'video_call.screen_sharing.stopped',
                $videoCall,
                [],
                ['user_id' => $user->id],
                "Screen sharing stopped by {$user->full_name} in call '{$videoCall->title}'",
                'info',
                ['communication', 'video_call', 'screen_sharing']
            );

            return response()->json([
                'success' => true,
                'message' => 'Screen sharing stopped successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error stopping screen sharing: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to stop screen sharing',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get current screen sharing status
     */
    public function getScreenSharingStatus(Request $request, VideoCall $videoCall): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user is a participant
            if (!$videoCall->participants()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not a participant of this call'
                ], 403);
            }

            // Get current screen sharer
            $currentSharer = $videoCall->participants()
                ->where('is_screen_sharing', true)
                ->with('user')
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'is_screen_sharing_active' => $currentSharer !== null,
                    'current_sharer' => $currentSharer ? [
                        'id' => $currentSharer->user->id,
                        'name' => $currentSharer->user->full_name,
                        'started_at' => $currentSharer->screen_sharing_started_at,
                    ] : null,
                    'can_start_sharing' => $currentSharer === null || $currentSharer->user_id === $user->id,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error getting screen sharing status: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get screen sharing status',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Request screen sharing permission (for participants)
     */
    public function requestScreenSharingPermission(Request $request, VideoCall $videoCall): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user is a participant
            $participant = $videoCall->participants()->where('user_id', $user->id)->first();
            if (!$participant) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not a participant of this call'
                ], 403);
            }

            // Check if screen sharing is enabled
            if (!$videoCall->isScreenSharingEnabled()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Screen sharing is not enabled for this call'
                ], 400);
            }

            // Notify hosts about the request
            $hosts = $videoCall->participants()->where('is_host', true)->with('user')->get();
            
            foreach ($hosts as $host) {
                // You could send a notification or broadcast an event here
                // For now, we'll just log it
                \Log::info("Screen sharing permission requested by {$user->full_name} in call {$videoCall->title}");
            }

            // Log the request
            AuditLog::logActivity(
                'video_call.screen_sharing.permission_requested',
                $videoCall,
                [],
                ['user_id' => $user->id],
                "Screen sharing permission requested by {$user->full_name} in call '{$videoCall->title}'",
                'info',
                ['communication', 'video_call', 'screen_sharing', 'permission']
            );

            return response()->json([
                'success' => true,
                'message' => 'Screen sharing permission requested. Waiting for host approval.',
                'data' => [
                    'hosts_notified' => $hosts->count(),
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error requesting screen sharing permission: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to request screen sharing permission',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Grant screen sharing permission (for hosts)
     */
    public function grantScreenSharingPermission(Request $request, VideoCall $videoCall): JsonResponse
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,id',
            ]);

            $user = Auth::user();

            // Check if user is a host
            $hostParticipant = $videoCall->participants()
                ->where('user_id', $user->id)
                ->where('is_host', true)
                ->first();

            if (!$hostParticipant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only hosts can grant screen sharing permissions'
                ], 403);
            }

            // Check if target user is a participant
            $targetParticipant = $videoCall->participants()
                ->where('user_id', $request->user_id)
                ->first();

            if (!$targetParticipant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Target user is not a participant of this call'
                ], 404);
            }

            // Grant permission (you could implement a permission system here)
            // For now, we'll just allow them to start sharing
            $targetUser = $targetParticipant->user;

            // Log the permission grant
            AuditLog::logActivity(
                'video_call.screen_sharing.permission_granted',
                $videoCall,
                [],
                [
                    'granted_by' => $user->id,
                    'granted_to' => $request->user_id,
                ],
                "Screen sharing permission granted to {$targetUser->full_name} by {$user->full_name} in call '{$videoCall->title}'",
                'info',
                ['communication', 'video_call', 'screen_sharing', 'permission']
            );

            return response()->json([
                'success' => true,
                'message' => "Screen sharing permission granted to {$targetUser->full_name}"
            ]);

        } catch (\Exception $e) {
            \Log::error('Error granting screen sharing permission: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to grant screen sharing permission',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
