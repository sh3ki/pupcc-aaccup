<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Document;

class DocumentUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $document;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Document $document, string $message = 'Document updated')
    {
        $this->document = $document;
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('document-updates'), // Generic channel for all document updates
            new Channel('documents.' . $this->document->id), // Specific document channel
        ];
    }

    /**
     * Get the data that should be broadcast with the event.
     */
    public function broadcastWith(): array
    {
        return [
            'document' => [
                'id' => $this->document->id,
                'title' => $this->document->title,
                'updated_at' => $this->document->updated_at,
            ],
            'message' => $this->message,
        ];
    }
}
