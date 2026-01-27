# Overview Modelli di Dati

L'applicazione è interamente tipizzata in TypeScript. I modelli principali sono definiti in `types.ts`.

## Relazioni Principali
- **User -> Board**: Gestione (Admin/Mod) e Sottoscrizione.
- **Board -> Post**: Contenitori di contenuti.
- **Post -> Comment**: Thread di discussione.
- **User -> Transaction**: Registro finanziario.

Tutti i modelli sono progettati per essere serializzabili in JSON per la persistenza in IndexedDB e la sincronizzazione API.
