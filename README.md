# Avisaí

**Avisaí** é um quadro de avisos digital para a faculdade. Coordenadores e professores publicam eventos (palestras, provas, workshops, reuniões…) e os alunos acompanham tudo em um só lugar, marcando se vão ou não participar.

> ⚠️ **Aviso importante:** este é apenas um **projeto simples da faculdade**. Ele foi feito para ser pequeno e direto ao ponto, por isso **não é 100% seguro** e, em vários momentos, **foge de normas e regras comuns de arquitetura e design de software** (sem migrations, sem testes automatizados, sem rate limiting, sem refresh tokens etc.). Não use em produção sem revisar esses pontos.

## Funcionalidades

- Cadastro e login de alunos (sessão via cookie `httpOnly` com JWT)
- Administradores (coordenadores e professores) criam, editam e excluem eventos
- Lista de eventos próximos e anteriores, com busca e filtro por categoria
- Alunos marcam presença: **Vou** ou **Não vou**
- Limite de vagas por evento (opcional)
- Admins veem a lista de presença de cada evento e gerenciam o papel dos usuários
- Interface em português, com animações suaves e tema claro/escuro automático
- Versão desktop com Electron

## Stack

| Camada   | Tecnologias                                                |
| -------- | ---------------------------------------------------------- |
| Backend  | Python, FastAPI, SQLAlchemy, Pydantic                      |
| Banco    | PostgreSQL                                                 |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, Motion           |
| Desktop  | Electron                                                   |

## Estrutura

```
Avisaí/
├── back-end/
│   └── app/
│       ├── models/      # SQLAlchemy models (one file per model)
│       ├── schemas/     # Pydantic schemas (one file per schema)
│       ├── routers/     # API routes (auth, events, users)
│       ├── config.py    # Settings (.env)
│       ├── db.py        # Engine and session
│       ├── deps.py      # Auth dependencies
│       ├── security.py  # Password hashing and JWT
│       ├── cli.py       # Admin creation command
│       └── main.py      # FastAPI app
├── front-end/           # Next.js app
└── desktop/             # Electron wrapper
```

## Como rodar

### Pré-requisitos

- Python 3.12+
- Node.js 20+
- PostgreSQL rodando localmente

### 1. Banco de dados

```bash
createdb avisai
```

### 2. Backend

```bash
cd back-end
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # ajuste DATABASE_URL e JWT_SECRET

# cria o primeiro administrador
python -m app.cli create-admin "Coordenação" admin@exemplo.com senha-forte

# (opcional) cria alguns eventos de exemplo
python -m app.cli seed-demo

uvicorn app.main:app --reload --port 8000
```

As tabelas são criadas automaticamente na primeira execução. A documentação da API fica em `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd front-end
npm install
npm run dev
```

Acesse `http://localhost:3000` (ou a porta que o Next.js indicar). O Next.js encaminha as chamadas de `/api/*` para o backend, então frontend e API compartilham a mesma origem (e o cookie de sessão).

### 4. Desktop (opcional)

Com o frontend rodando:

```bash
cd desktop
npm install
npm start
```

Por padrão o app abre `http://localhost:3000`. Para outra porta: `AVISAI_URL=http://localhost:3001 npm start`.

## Papéis

| Papel     | Pode                                                                   |
| --------- | ---------------------------------------------------------------------- |
| `student` | Ver eventos e marcar presença                                          |
| `admin`   | Tudo do aluno + criar/editar/excluir eventos, ver presenças, gerenciar usuários |

Todo novo cadastro entra como aluno. Um admin pode promover outros usuários pela tela **Usuários**.

## Licença

Projeto acadêmico, sem fins comerciais.
