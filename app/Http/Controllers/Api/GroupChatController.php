<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatRoom;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class GroupChatController extends Controller
{
    /**
     * Create a new group chat
     */
    public function createGroup(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'participants' => 'required|array|min:2',
                'participants.*' => 'exists:users,id',
                'type' => 'in:group,department,emergency',
                'is_private' => 'boolean',
            ]);

            $user = Auth::user();

            // Check if user can create group chats
            if (!Gate::allows('access-communication-system')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to create group chats'
                ], 403);
            }

            // Create the group chat
            $chatRoom = ChatRoom::create([
                'name' => $request->name,
                'description' => $request->description,
                'type' => $request->type ?? 'group',
                'created_by' => $user->id,
                'is_active' => true,
                'is_private' => $request->is_private ?? false,
                'settings' => [
                    'allow_file_sharing' => true,
                    'allow_voice_messages' => true,
                    'message_retention_days' => 365,
                    'max_participants' => $request->type === 'emergency' ? 50 : 20,
                ],
            ]);

            // Add creator as admin
            $chatRoom->participants()->create([
                'user_id' => $user->id,
                'role' => 'admin',
                'joined_at' => now(),
            ]);

            // Add other participants
            foreach ($request->participants as $participantId) {
                if ($participantId != $user->id) {
                    $participant = User::find($participantId);
                    if ($participant) {
                        $chatRoom->participants()->create([
                            'user_id' => $participantId,
                            'role' => 'member',
                            'joined_at' => now(),
                        ]);
                    }
                }
            }

            // Send welcome system message
            $chatRoom->messages()->create([
                'sender_id' => $user->id,
                'message' => "Group chat '{$chatRoom->name}' created by {$user->full_name}",
                'message_type' => 'system',
                'is_system_message' => true,
            ]);

            // Log the creation
            AuditLog::logActivity(
                'chat.group.created',
                $chatRoom,
                [],
                $chatRoom->toArray(),
                "Group chat '{$chatRoom->name}' created",
                'info',
                ['communication', 'chat', 'group_creation']
            );

            return response()->json([
                'success' => true,
                'data' => $chatRoom->load(['participants.user', 'messages']),
                'message' => 'Group chat created successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating group chat: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create group chat',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update group chat settings
     */
    public function updateGroup(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'sometimes|nullable|string|max:1000',
                'settings' => 'sometimes|array',
                'settings.allow_file_sharing' => 'boolean',
                'settings.allow_voice_messages' => 'boolean',
                'settings.message_retention_days' => 'integer|min:1|max:3650',
            ]);

            $user = Auth::user();

            // Check if user is an admin of the group
            if (!$chatRoom->participants()->where('user_id', $user->id)->where('role', 'admin')->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only group admins can update group settings'
                ], 403);
            }

            $oldData = $chatRoom->toArray();

            // Update group details
            $updateData = [];
            if ($request->has('name')) {
                $updateData['name'] = $request->name;
            }
            if ($request->has('description')) {
                $updateData['description'] = $request->description;
            }
            if ($request->has('settings')) {
                $currentSettings = $chatRoom->settings ?? [];
                $updateData['settings'] = array_merge($currentSettings, $request->settings);
            }

            $chatRoom->update($updateData);

            // Send system message about the update
            $changes = [];
            if ($request->has('name') && $request->name !== $oldData['name']) {
                $changes[] = "name changed to '{$request->name}'";
            }
            if ($request->has('description')) {
                $changes[] = "description updated";
            }
            if ($request->has('settings')) {
                $changes[] = "settings updated";
            }

            if (!empty($changes)) {
                $chatRoom->messages()->create([
                    'sender_id' => $user->id,
                    'message' => "Group " . implode(', ', $changes) . " by {$user->full_name}",
                    'message_type' => 'system',
                    'is_system_message' => true,
                ]);
            }

            // Log the update
            AuditLog::logActivity(
                'chat.group.updated',
                $chatRoom,
                $oldData,
                $chatRoom->fresh()->toArray(),
                "Group chat '{$chatRoom->name}' updated",
                'info',
                ['communication', 'chat', 'group_update']
            );

            return response()->json([
                'success' => true,
                'data' => $chatRoom->fresh()->load('participants.user'),
                'message' => 'Group chat updated successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating group chat: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update group chat',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Promote a member to admin
     */
    public function promoteToAdmin(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,id',
            ]);

            $user = Auth::user();

            // Check if current user is an admin
            if (!$chatRoom->participants()->where('user_id', $user->id)->where('role', 'admin')->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only group admins can promote members'
                ], 403);
            }

            // Check if target user is a participant
            $participant = $chatRoom->participants()->where('user_id', $request->user_id)->first();
            if (!$participant) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a participant of this group'
                ], 404);
            }

            // Promote to admin
            $participant->update(['role' => 'admin']);

            $promotedUser = User::find($request->user_id);

            // Send system message
            $chatRoom->messages()->create([
                'sender_id' => $user->id,
                'message' => "{$promotedUser->full_name} was promoted to admin by {$user->full_name}",
                'message_type' => 'system',
                'is_system_message' => true,
            ]);

            // Log the promotion
            AuditLog::logActivity(
                'chat.member.promoted',
                $chatRoom,
                [],
                ['promoted_user_id' => $request->user_id],
                "User {$promotedUser->full_name} promoted to admin in group '{$chatRoom->name}'",
                'info',
                ['communication', 'chat', 'promotion']
            );

            return response()->json([
                'success' => true,
                'data' => $chatRoom->load('participants.user'),
                'message' => 'Member promoted to admin successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error promoting member: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to promote member',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Leave a group chat
     */
    public function leaveGroup(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user is a participant
            $participant = $chatRoom->participants()->where('user_id', $user->id)->first();
            if (!$participant) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not a participant of this group'
                ], 404);
            }

            // Don't allow creator to leave if they're the only admin
            if ($chatRoom->created_by === $user->id) {
                $adminCount = $chatRoom->participants()->where('role', 'admin')->count();
                if ($adminCount === 1) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Group creator cannot leave without promoting another admin first'
                    ], 400);
                }
            }

            // Remove participant
            $participant->delete();

            // Send system message
            $chatRoom->messages()->create([
                'sender_id' => $user->id,
                'message' => "{$user->full_name} left the group",
                'message_type' => 'system',
                'is_system_message' => true,
            ]);

            // Log the action
            AuditLog::logActivity(
                'chat.group.left',
                $chatRoom,
                [],
                ['user_id' => $user->id],
                "User {$user->full_name} left group '{$chatRoom->name}'",
                'info',
                ['communication', 'chat', 'group_leave']
            );

            return response()->json([
                'success' => true,
                'message' => 'Left group successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error leaving group: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to leave group',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
