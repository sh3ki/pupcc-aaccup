<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Generic channel for all document updates
Broadcast::channel('document-updates', function ($user) {
    // Allow all authenticated users to listen to document updates
    return true;
});

// Specific channel for individual document updates
Broadcast::channel('documents.{id}', function ($user, $id) {
    // You can add authorization logic here
    return true; // For now, allow all authenticated users
});

// Channel for user-specific notifications
Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
