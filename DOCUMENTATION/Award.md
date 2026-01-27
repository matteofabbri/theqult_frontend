# Modello: Award

Sistema di apprezzamento economico (micro-pagamenti sociali).

## Logica
1. L'utente seleziona un premio dalla `AVAILABLE_AWARDS`.
2. Il costo viene detratto dal mittente e accreditato al destinatario.
3. Viene creata l'entità `Award` collegata all'oggetto (Post/Commento).
4. Badge visivi appaiono sopra il contenuto premiato.
