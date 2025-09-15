<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ChatRoom;
use App\Models\ChatMessage;
use App\Models\EmailFolder;

class CommunicationSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get some users
        $users = User::withoutGlobalScopes()->take(5)->get();
        
        if ($users->count() < 2) {
            $this->command->info('Not enough users to seed communications. Please run UserSeeder first.');
            return;
        }

        // Create email folders for each user
        foreach ($users as $user) {
            // Check if user already has folders
            if (EmailFolder::where('user_id', $user->id)->count() === 0) {
                EmailFolder::createDefaultFolders($user);
            }
        }

        $this->command->info('Email folders created successfully!');
        return;

        // Create some chat rooms (disabled for now)
        $chatRooms = [
            [
                'name' => 'Emergency Team',
                'description' => 'Emergency response coordination',
                'type' => 'emergency',
                'created_by' => $users->first()->id,
                'is_private' => false,
                'settings' => [
                    'allow_file_sharing' => true,
                    'allow_voice_messages' => true,
                    'auto_archive_after_days' => 30,
                    'notification_level' => 'all'
                ]
            ],
            [
                'name' => 'Nursing Station A',
                'description' => 'Nursing coordination for Station A',
                'type' => 'group',
                'created_by' => $users->first()->id,
                'is_private' => false,
                'settings' => [
                    'allow_file_sharing' => true,
                    'allow_voice_messages' => true,
                    'auto_archive_after_days' => 30,
                    'notification_level' => 'all'
                ]
            ],
            [
                'name' => 'Cardiology Department',
                'description' => 'Cardiology team communication',
                'type' => 'group',
                'created_by' => $users->skip(1)->first()->id,
                'is_private' => false,
                'settings' => [
                    'allow_file_sharing' => true,
                    'allow_voice_messages' => true,
                    'auto_archive_after_days' => 60,
                    'notification_level' => 'all'
                ]
            ]
        ];

        foreach ($chatRooms as $roomData) {
            $chatRoom = ChatRoom::create($roomData);
            
            // Add participants
            foreach ($users->take(3) as $user) {
                $chatRoom->addParticipant($user, $user->id === $roomData['created_by'] ? 'admin' : 'participant');
            }

            // Create some sample messages
            $messages = [
                [
                    'sender_id' => $users->first()->id,
                    'message' => 'Good morning team! Ready for today\'s shift.',
                    'message_type' => 'text',
                    'priority' => 'normal'
                ],
                [
                    'sender_id' => $users->skip(1)->first()->id,
                    'message' => 'Patient in room 205 needs immediate attention.',
                    'message_type' => 'text',
                    'priority' => 'high'
                ],
                [
                    'sender_id' => $users->skip(2)->first()->id,
                    'message' => 'Ambulance ETA is 15 minutes.',
                    'message_type' => 'text',
                    'priority' => 'urgent'
                ]
            ];

            foreach ($messages as $messageData) {
                ChatMessage::create(array_merge($messageData, [
                    'chat_room_id' => $chatRoom->id,
                    'is_system_message' => false,
                    'is_edited' => false
                ]));
            }

            // Update last activity
            $chatRoom->update(['last_activity_at' => now()]);
        }

        // Create some direct message rooms
        for ($i = 0; $i < 3; $i++) {
            $user1 = $users->random();
            $user2 = $users->where('id', '!=', $user1->id)->random();
            
            $directRoom = ChatRoom::create([
                'name' => $user1->full_name . ' & ' . $user2->full_name,
                'description' => 'Direct message conversation',
                'type' => 'private',
                'created_by' => $user1->id,
                'is_private' => true,
                'settings' => [
                    'allow_file_sharing' => true,
                    'allow_voice_messages' => true,
                    'auto_archive_after_days' => 90,
                    'notification_level' => 'all'
                ]
            ]);

            $directRoom->addParticipant($user1, 'admin');
            $directRoom->addParticipant($user2, 'participant');

            // Add a message
            ChatMessage::create([
                'chat_room_id' => $directRoom->id,
                'sender_id' => $user1->id,
                'message' => 'Hi! How are things going with the patient referral?',
                'message_type' => 'text',
                'priority' => 'normal',
                'is_system_message' => false,
                'is_edited' => false
            ]);

            $directRoom->update(['last_activity_at' => now()]);
        }

        $this->command->info('Communication data seeded successfully!');
    }
}
