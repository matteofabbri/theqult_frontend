# Architettura Tecnica

The Qult adotta un approccio **Local-First with Remote Sync**.

## 1. Gestione dello Stato (`hooks/useStore.ts`)
L'applicazione utilizza un `StoreProvider` centralizzato:
- **IndexedDB**: I dati vengono salvati localmente tramite l'hook `usePersistentState`. L'app è istantanea e funziona offline.
- **React Context**: Distribuisce i dati a tutti i componenti.

## 2. Sincronizzazione Server ("Fire and Forget")
La funzione helper `api()` invia le modifiche al server in background:
1. L'utente compie un'azione (es. vota un post).
2. Lo stato locale viene aggiornato immediatamente (UI ottimistica).
3. Viene inviata una fetch asincrona al backend. Se il server non risponde, l'app continua a funzionare basandosi sui dati locali.

## 3. Sicurezza
- **Password**: Gestite lato client (nel prototipo) e inviate via API.
- **E2EE**: Messaggistica criptata basata su chiavi pubbliche/private.
