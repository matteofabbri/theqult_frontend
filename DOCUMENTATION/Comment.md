# Modello: Comment

Risposte associate a Post o ProfilePost.

## Gerarchia
- `postId`: Riferimento al post genitore.
- `parentId`: Se valorizzato, il commento è una risposta a un altro commento (threading).
- `media`: Anche i commenti supportano allegati multimediali.

I commenti ereditano le regole di anonimato della Board in cui si trova il post.
