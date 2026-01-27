# The Qult - Documentazione Tecnica

Benvenuti nella documentazione di **The Qult**. Questa cartella contiene il dettaglio dell'architettura e di ogni modello di dati utilizzato nella piattaforma.

## Moduli Core
1. [Architecture.md](./Architecture.md): Overview Local-First e Sync API.
2. [Endpoints.md](./Endpoints.md): Specifica tecnica delle rotte API e dei Payload.
3. [Interactions.md](./Interactions.md): Flussi operativi complessi (Voti, Economia, E2EE).

## Dizionario dei Tipi (Data Models)
Per ogni entità definita in `types.ts`, è disponibile un file di dettaglio:

- [User.md](./User.md): Utenti e Profili.
- [Board.md](./Board.md): Community e Board.
- [Post.md](./Post.md): Post standard nelle board.
- [ProfilePost.md](./ProfilePost.md): Post esclusivi nel profilo.
- [Editorial.md](./Editorial.md): Articoli ufficiali della piattaforma.
- [Comment.md](./Comment.md): Commenti e risposte.
- [Message.md](./Message.md): Messaggi privati, E2EE e transazioni P2P.
- [Transaction.md](./Transaction.md): Registro contabile dei Kopeki.
- [Advertisement.md](./Advertisement.md): Campagne pubblicitarie.
- [Award.md](./Award.md): Premi sociali.
- [MediaItem.md](./MediaItem.md): Allegati multimediali.
- [SocialEntities.md](./SocialEntities.md): Voti, Follow e Sottoscrizioni.

## Risorse Dati
- [IP_Country_Map.csv](./IP_Country_Map.csv): Database di esempio per la geolocalizzazione IP (Mapping IP -> ISO Country Code).
