<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Document;

class DocumentCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $document;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Document $document, string $message = 'Document created')
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
            new Channel('document-updates'),
            new Channel('documents.' . $this->document->id),
        ];
    }

    /**
     * Get the data that should be broadcast with the event.
     */
    public function broadcastWith(): array
    {
        // Load relationships for complete document data
        $this->document->load(['user', 'program', 'area', 'parameter']);
        
        return [
            'document' => [
                'id' => $this->document->id,
                'user_id' => $this->document->user_id,
                'program_id' => $this->document->program_id,
                'area_id' => $this->document->area_id,
                'parameter_id' => $this->document->parameter_id,
                'category' => $this->document->category,
                'doc_filename' => $this->document->doc_filename,
                'status' => $this->document->status,
                'created_at' => $this->document->created_at,
                'user_name' => $this->document->user ? $this->document->user->name : null,
                'program_name' => $this->document->program ? $this->document->program->name : null,
                'area_name' => $this->document->area ? $this->document->area->name : null,
                'parameter_name' => $this->document->parameter ? $this->document->parameter->name : null,
            ],
            'message' => $this->message,
        ];
    }
}
