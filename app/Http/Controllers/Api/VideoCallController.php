<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VideoCall;
use App\Models\User;
use App\Models\AuditLog;
use App\Events\CallInitiated;
use App\Events\CallEnded;
use App\Events\CallJoined;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class VideoCallController extends Controller
{
    /**
     * Initiate a video call
     */
    public function initiateCall(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'participants' => 'required|array|min:1',
                'participants.*' => 'exists:users,id',
                'type' => 'in:one_on_one,group,consultation,emergency',
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string|max:1000',
                'scheduled_at' => 'nullable|date|after:now',
                'duration_minutes' => 'nullable|integer|min:5|max:480', // 8 hours max
                'is_recording_enabled' => 'boolean',
                'is_screen_sharing_enabled' => 'boolean',
            ]);

            $user = Auth::user();

            // Check if user can initiate video calls
            if (!Gate::allows('access-communication-system')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to initiate video calls'
                ], 403);
            }

            // Generate unique call ID and room ID
            $callId = Str::uuid();
            $roomId = 'room_' . Str::random(12);

            // Create video call record
            $videoCall = VideoCall::create([
                'call_id' => $callId,
                'room_id' => $roomId,
                'initiator_id' => $user->id,
                'type' => $request->type ?? 'one_on_one',
                'title' => $request->title ?? 'Video Call',
                'description' => $request->description,
                'status' => $request->scheduled_at ? 'scheduled' : 'initiated',
                'scheduled_at' => $request->scheduled_at,
                'duration_minutes' => $request->duration_minutes ?? 60,
                'settings' => [
                    'is_recording_enabled' => $request->is_recording_enabled ?? false,
                    'is_screen_sharing_enabled' => $request->is_screen_sharing_enabled ?? true,
                    'max_participants' => $request->type === 'group' ? 10 : 2,
                    'quality' => 'hd',
                    'audio_only' => false,
                ],
                'metadata' => [
                    'user_agent' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                ],
            ]);

            // Add participants
            $participants = collect($request->participants)->unique();
            foreach ($participants as $participantId) {
                if ($participantId != $user->id) {
                    $videoCall->participants()->create([
                        'user_id' => $participantId,
                        'status' => 'invited',
                        'invited_at' => now(),
                    ]);
                }
            }

            // Add initiator as participant
            $videoCall->participants()->create([
                'user_id' => $user->id,
                'status' => 'joined',
                'joined_at' => now(),
                'is_host' => true,
            ]);

            // Generate WebRTC configuration
            $webrtcConfig = $this->generateWebRTCConfig($roomId);

            // Broadcast call initiation to participants
            broadcast(new CallInitiated($videoCall, $user))->toOthers();

            // Log the call initiation
            AuditLog::logActivity(
                'video_call.initiated',
                $videoCall,
                [],
                $videoCall->toArray(),
                "Video call '{$videoCall->title}' initiated",
                'info',
                ['communication', 'video_call', 'initiation']
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'call' => $videoCall->load(['participants.user', 'initiator']),
                    'webrtc_config' => $webrtcConfig,
                    'join_url' => route('video-call.join', ['call' => $videoCall->call_id]),
                ],
                'message' => 'Video call initiated successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error initiating video call: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate video call',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Join a video call
     */
    public function joinCall(Request $request, VideoCall $videoCall): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user is invited to this call
            $participant = $videoCall->participants()->where('user_id', $user->id)->first();
            if (!$participant && $videoCall->initiator_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not invited to this call'
                ], 403);
            }

            // Check call status
            if (!in_array($videoCall->status, ['initiated', 'in_progress', 'scheduled'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Call is not available to join'
                ], 400);
            }

            // Update participant status
            if ($participant) {
                $participant->update([
                    'status' => 'joined',
                    'joined_at' => now(),
                ]);
            }

            // Update call status if first join
            if ($videoCall->status === 'initiated') {
                $videoCall->update([
                    'status' => 'in_progress',
                    'started_at' => now(),
                ]);
            }

            // Generate WebRTC configuration
            $webrtcConfig = $this->generateWebRTCConfig($videoCall->room_id);

            // Broadcast user joined
            broadcast(new CallJoined($videoCall, $user))->toOthers();

            // Log the join
            AuditLog::logActivity(
                'video_call.joined',
                $videoCall,
                [],
                ['user_id' => $user->id],
                "User {$user->full_name} joined video call '{$videoCall->title}'",
                'info',
                ['communication', 'video_call', 'join']
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'call' => $videoCall->load(['participants.user', 'initiator']),
                    'webrtc_config' => $webrtcConfig,
                    'user_role' => $participant?->is_host ? 'host' : 'participant',
                ],
                'message' => 'Joined call successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error joining video call: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to join video call',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * End a video call
     */
    public function endCall(Request $request, VideoCall $videoCall): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user can end the call (host or admin)
            $participant = $videoCall->participants()->where('user_id', $user->id)->first();
            if (!$participant?->is_host && $videoCall->initiator_id !== $user->id && !in_array($user->role, ['super_admin', 'hospital_admin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only the host can end the call'
                ], 403);
            }

            // Update call status
            $videoCall->update([
                'status' => 'ended',
                'ended_at' => now(),
                'ended_by' => $user->id,
            ]);

            // Update all participants status
            $videoCall->participants()->update([
                'status' => 'left',
                'left_at' => now(),
            ]);

            // Broadcast call ended
            broadcast(new CallEnded($videoCall, $user))->toOthers();

            // Log the call end
            AuditLog::logActivity(
                'video_call.ended',
                $videoCall,
                [],
                [
                    'ended_by' => $user->id,
                    'duration_seconds' => $videoCall->started_at ? now()->diffInSeconds($videoCall->started_at) : 0,
                ],
                "Video call '{$videoCall->title}' ended by {$user->full_name}",
                'info',
                ['communication', 'video_call', 'end']
            );

            return response()->json([
                'success' => true,
                'message' => 'Call ended successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error ending video call: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to end video call',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Generate WebRTC configuration
     */
    private function generateWebRTCConfig(string $roomId): array
    {
        return [
            'room_id' => $roomId,
            'ice_servers' => [
                [
                    'urls' => ['stun:stun.l.google.com:19302'],
                ],
                [
                    'urls' => ['turn:' . config('app.turn_server_host', 'localhost') . ':3478'],
                    'username' => config('app.turn_server_username', 'carelink'),
                    'credential' => config('app.turn_server_password', 'secret'),
                ],
            ],
            'constraints' => [
                'video' => [
                    'width' => ['min' => 640, 'ideal' => 1280, 'max' => 1920],
                    'height' => ['min' => 480, 'ideal' => 720, 'max' => 1080],
                    'frameRate' => ['min' => 15, 'ideal' => 30, 'max' => 60],
                ],
                'audio' => [
                    'echoCancellation' => true,
                    'noiseSuppression' => true,
                    'autoGainControl' => true,
                ],
            ],
            'signaling_server' => config('app.signaling_server_url', 'ws://localhost:3001'),
        ];
    }
}
