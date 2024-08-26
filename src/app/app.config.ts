import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes, withComponentInputBinding()), provideAnimationsAsync(), provideFirebaseApp(() => initializeApp({"projectId":"dabubble-da785","appId":"1:501722878786:web:3063d79f5f3cf912cbeedb","storageBucket":"dabubble-da785.appspot.com","apiKey":"AIzaSyATFKQ4Vj02MYPl-YDAHzuLb-LYeBwORiE","authDomain":"dabubble-da785.firebaseapp.com","messagingSenderId":"501722878786"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideMessaging(() => getMessaging()), provideStorage(() => getStorage()), provideFirebaseApp(() => initializeApp({"projectId":"dabubble-da785","appId":"1:501722878786:web:3063d79f5f3cf912cbeedb","storageBucket":"dabubble-da785.appspot.com","apiKey":"AIzaSyATFKQ4Vj02MYPl-YDAHzuLb-LYeBwORiE","authDomain":"dabubble-da785.firebaseapp.com","messagingSenderId":"501722878786"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage())]
};
