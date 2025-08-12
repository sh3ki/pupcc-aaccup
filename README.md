# Laravel + React Starter Kit

## Introduction

Our React starter kit provides a robust, modern starting point for building Laravel applications with a React frontend using [Inertia](https://inertiajs.com).

Inertia allows you to build modern, single-page React applications using classic server-side routing and controllers. This lets you enjoy the frontend power of React combined with the incredible backend productivity of Laravel and lightning-fast Vite compilation.

This React starter kit utilizes React 19, TypeScript, Tailwind, and the [shadcn/ui](https://ui.shadcn.com) and [radix-ui](https://www.radix-ui.com) component libraries.

## Official Documentation

Documentation for all Laravel starter kits can be found on the [Laravel website](https://laravel.com/docs/starter-kits).

## Contributing

Thank you for considering contributing to our starter kit! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## License

The Laravel + React starter kit is open-sourced software licensed under the MIT license.

## Firebase Messaging Setup

To enable the in-app messaging feature backed by Firebase Realtime Database:

1. Create a Firebase project (Project ID: pupcc-aaccup) or use your existing one.
2. In your project's `.env` (Vite env), add:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=pupcc-aaccup.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://pupcc-aaccup-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=pupcc-aaccup
VITE_FIREBASE_STORAGE_BUCKET=pupcc-aaccup.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=718160950797
VITE_FIREBASE_APP_ID=your_app_id
```

Database structure used:

- conversations/{conversationId}: { id, type: 'private'|'group', title, members[], createdAt, updatedAt }
- userConversations/{userId}/{conversationId}: mirrors conversation meta + lastMessage, updatedAt
- messages/{conversationId}/{messageId}: { text, senderId, senderName, sentAt, seenBy{ userId: timestamp } }
- privatePairs/{sortedUserIdA_userIdB}: { id: conversationId }

For development, the client signs in anonymously to Firebase. In production, consider Firebase custom tokens for tighter security binding to your Laravel auth.
