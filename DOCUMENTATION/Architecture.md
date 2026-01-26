# Architettura Tecnica

The Qult adotta un approccio **Local-First with Remote Sync**.

## 1. Gestione dello Stato (`hooks/useStore.ts`)
L'intera applicazione ruota attorno al `StoreProvider`. Invece di usare librerie esterne come Redux, utilizziamo:
- **React Context**: Per distribuire i dati (boards, posts, users) a tutti i componenti.
- **usePersistentState**: Un hook custom che sincronizza lo stato React con **IndexedDB**. Questo permette all'app di funzionare offline e di mantenere i dati tra i refresh della pagina senza server.

## 2. Comunicazione Backend ("Fire and Forget")
Nel provider è presente una funzione helper chiamata `api`.
Ogni volta che l'utente compie un'azione (es. `login`, `register`, `createPost`, `castVote`):
1. L'app aggiorna immediatamente lo stato locale (IndexedDB).
2. Viene invocata la funzione `api(endpoint, method, body)`.
3. La chiamata API è asincrona e non blocca la UI. Se il server risponde, i dati vengono sincronizzati; se fallisce, l'app continua a funzionare basandosi sui dati locali.

## 3. Gerarchia dei Componenti
- **Pages**: Rappresentano le rotte principali (Home, Board, Profile, Settings).
- **Modals**: Gestiscono flussi complessi (Creazione board, Acquisto Kopeki, Login) senza cambiare rotta.
- **Hooks**: Forniscono accesso granulare ai dati tramite `useAuth()` e `useData()`.
