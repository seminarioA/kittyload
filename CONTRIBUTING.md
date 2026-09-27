# Contributing

## Branch strategy

- `dev`: integración continua de slices pequeños.
- `qa`: preproducción y validación.
- `main`: producción.

Flujo: `feature/* -> dev -> qa -> main`.

## Conventional Commits

Ejemplos válidos:

- `feat: add task creation dialog`
- `fix: preserve card position after drag`
- `chore: update quality workflow`
- `docs: document notification architecture`
- `refactor: extract task repository`
- `test: cover workspace limits`

No usar mensajes genéricos como `update`, `changes`, `fix stuff` o equivalentes.
