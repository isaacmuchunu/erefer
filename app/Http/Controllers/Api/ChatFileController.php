<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatRoom;
use App\Models\ChatMessage;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatFileController extends Controller
{
    /**
     * Upload and share a file in a chat room
     */
    public function shareFile(Request $request, ChatRoom $chatRoom): JsonResponse
    {
        try {
            $request->validate([
                'file' => 'required|file|max:10240', // 10MB max
                'message' => 'nullable|string|max:1000',
            ]);

            $user = Auth::user();

            // Check if user is a participant
            if (!$chatRoom->participants()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to share files in this chat room'
                ], 403);
            }

            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $mimeType = $file->getMimeType();
            $size = $file->getSize();

            // Generate unique filename
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('chat/files', $filename, 'public');

            // Determine file type
            $fileType = $this->getFileType($mimeType);

            // Create message with file attachment
            $message = $chatRoom->messages()->create([
                'sender_id' => $user->id,
                'message' => $request->message ?? "Shared a {$fileType}",
                'message_type' => 'file',
                'is_system_message' => false,
                'metadata' => [
                    'file_info' => [
                        'original_name' => $originalName,
                        'size' => $size,
                        'mime_type' => $mimeType,
                        'type' => $fileType,
                    ],
                ],
            ]);

            // Create attachment record
            $attachment = $message->attachments()->create([
                'filename' => $filename,
                'original_name' => $originalName,
                'path' => $path,
                'size' => $size,
                'mime_type' => $mimeType,
                'type' => $fileType,
                'url' => Storage::url($path),
            ]);

            // Update chat room activity
            $chatRoom->update([
                'last_activity_at' => now(),
                'last_message_id' => $message->id,
            ]);

            // Broadcast the message
            broadcast(new \App\Events\MessageSent($message, $chatRoom))->toOthers();

            // Log the file sharing
            AuditLog::logActivity(
                'chat.file.shared',
                $message,
                [],
                [
                    'file_name' => $originalName,
                    'file_size' => $size,
                    'file_type' => $fileType,
                    'chat_room_id' => $chatRoom->id,
                ],
                "File '{$originalName}' shared in chat room '{$chatRoom->name}'",
                'info',
                ['communication', 'chat', 'file_sharing']
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'message' => $message->load(['sender', 'attachments']),
                    'attachment' => $attachment,
                ],
                'message' => 'File shared successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error sharing file: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to share file',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Download a shared file
     */
    public function downloadFile(Request $request, ChatMessage $message, $attachmentId): JsonResponse
    {
        try {
            $user = Auth::user();
            $attachment = $message->attachments()->findOrFail($attachmentId);

            // Check if user is a participant of the chat room
            if (!$message->chatRoom->participants()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to download this file'
                ], 403);
            }

            // Check if file exists
            if (!Storage::disk('public')->exists($attachment->path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found'
                ], 404);
            }

            // Log the download
            AuditLog::logActivity(
                'chat.file.downloaded',
                $attachment,
                [],
                [
                    'file_name' => $attachment->original_name,
                    'message_id' => $message->id,
                    'chat_room_id' => $message->chat_room_id,
                ],
                "File '{$attachment->original_name}' downloaded from chat",
                'info',
                ['communication', 'chat', 'file_download']
            );

            return response()->download(
                Storage::disk('public')->path($attachment->path),
                $attachment->original_name
            );

        } catch (\Exception $e) {
            \Log::error('Error downloading file: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to download file',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get file preview (for images)
     */
    public function previewFile(Request $request, ChatMessage $message, $attachmentId)
    {
        try {
            $user = Auth::user();
            $attachment = $message->attachments()->findOrFail($attachmentId);

            // Check if user is a participant of the chat room
            if (!$message->chatRoom->participants()->where('user_id', $user->id)->exists()) {
                abort(403, 'Unauthorized to preview this file');
            }

            // Only allow preview for images
            if (!str_starts_with($attachment->mime_type, 'image/')) {
                abort(400, 'File preview not available for this file type');
            }

            // Check if file exists
            if (!Storage::disk('public')->exists($attachment->path)) {
                abort(404, 'File not found');
            }

            return response()->file(
                Storage::disk('public')->path($attachment->path),
                [
                    'Content-Type' => $attachment->mime_type,
                    'Cache-Control' => 'public, max-age=3600',
                ]
            );

        } catch (\Exception $e) {
            \Log::error('Error previewing file: ' . $e->getMessage());
            abort(500, 'Failed to preview file');
        }
    }

    /**
     * Delete a shared file
     */
    public function deleteFile(Request $request, ChatMessage $message, $attachmentId): JsonResponse
    {
        try {
            $user = Auth::user();
            $attachment = $message->attachments()->findOrFail($attachmentId);

            // Check if user is the sender or admin
            if ($message->sender_id !== $user->id && 
                !$message->chatRoom->participants()->where('user_id', $user->id)->where('role', 'admin')->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete this file'
                ], 403);
            }

            // Delete file from storage
            if (Storage::disk('public')->exists($attachment->path)) {
                Storage::disk('public')->delete($attachment->path);
            }

            // Log the deletion
            AuditLog::logActivity(
                'chat.file.deleted',
                $attachment,
                $attachment->toArray(),
                [],
                "File '{$attachment->original_name}' deleted from chat",
                'warning',
                ['communication', 'chat', 'file_deletion']
            );

            // Delete attachment record
            $attachment->delete();

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting file: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get file type from MIME type
     */
    private function getFileType(string $mimeType): string
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        } elseif (str_starts_with($mimeType, 'video/')) {
            return 'video';
        } elseif (str_starts_with($mimeType, 'audio/')) {
            return 'audio';
        } elseif (in_array($mimeType, [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv'
        ])) {
            return 'document';
        } else {
            return 'file';
        }
    }
}
