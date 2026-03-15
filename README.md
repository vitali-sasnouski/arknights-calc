# Arknights Calculator

## Deploy

### Prerequisites

Install Firebase CLI (once):

```bash
npm install -g firebase-tools
```

### First-time setup

1. Log in to your Firebase account:

```bash
firebase login
```

2. Link the project to your Firebase project:

```bash
firebase use --add
```

Select your project from the list. If you don't have one yet, create it at [console.firebase.google.com](https://console.firebase.google.com) first.

### Deploy

```bash
npm run deploy
```

This will build the project and deploy it to Firebase Hosting. The CLI will print the URL when done, e.g. `https://<project-id>.web.app`.
