import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
// Import or define the SessionStore and SessionData types.
// These types are expected by Genkit. The actual import path depends on your project setup.
import type { SessionData, SessionStore } from 'genkit';
// Ensure that Firebase admin is initialized; if your project already does this elsewhere, you can skip this.
if (!getApps().length) {
  initializeApp();
}

export class FirestoreSessionStore<S = any> implements SessionStore<S> {
  private collection: FirebaseFirestore.CollectionReference;

  constructor(collectionName = 'chatSessions') {
    this.collection = getFirestore().collection(collectionName);
  }

  async get(sessionId: string): Promise<SessionData<S> | undefined> {
    const doc = await this.collection.doc(sessionId).get();
    if (!doc.exists) {
      return undefined;
    }
    return doc.data() as SessionData<S>;
  }

  async save(sessionId: string, sessionData: SessionData<S>): Promise<void> {
    // Use merge: true to preserve any existing data if needed.
    await this.collection.doc(sessionId).set(sessionData, { merge: true });
  }
}
