# The Qult - Documentation Overview

Benvenuti nella documentazione tecnica di **The Qult**, una piattaforma di social news e community ispirata a Reddit, ma con un'anima orientata all'economia interna e alla privacy.

## Struttura della Documentazione
La documentazione è suddivisa nei seguenti moduli:

1. [Architecture.md](./Architecture.md): Descrive il funzionamento del frontend, la gestione dello stato e il pattern di comunicazione con il backend.
2. [DataModels.md](./DataModels.md): Elenca le entità del sistema e i loro attributi.
3. [Interactions.md](./Interactions.md): Spiega come avvengono i processi complessi (voti, transazioni, messaggi E2EE).

## Tecnologie Utilizzate
- **Frontend**: React 19, TypeScript.
- **Styling**: Tailwind CSS.
- **Routing**: React Router 6.
- **Persistence**: IndexedDB (tramite un hook custom per lo stato persistente).
- **Markdown**: React-Markdown con supporto GFM e HTML raw.
