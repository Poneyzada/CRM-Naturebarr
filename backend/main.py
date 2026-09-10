from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routers import (
    pdvs_router,
    pedidos_router,
    visitas_router,
    webhooks_router,
    metrics_router,
)
from backend.seed import seed_database

from sqlalchemy import text

# Função de migração automática para garantir colunas existentes no PostgreSQL
def auto_migrate():
    try:
        with engine.connect() as conn:
            if "postgresql" in str(engine.url):
                conn.execute(text("ALTER TABLE pdvs ADD COLUMN IF NOT EXISTS vendedor_nome VARCHAR(100) DEFAULT 'Gemima';"))
                conn.execute(text("ALTER TABLE leads_webhook ADD COLUMN IF NOT EXISTS regiao VARCHAR(50) DEFAULT 'Salvador';"))
                conn.commit()
    except Exception as e:
        print(f"Aviso de auto-migração: {e}")

# Executa migração de colunas
auto_migrate()

# Criação automática das tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Naturebarr CRM B2B - API Comercial",
    description="Sistema de Gestão Comercial, Distribuição B2B e Ciclo de Recompra da Naturebarr para Salvador, São Paulo e Santa Catarina.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuração de CORS para permitir requisições do Frontend React (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializa dados de demonstração na inicialização se o banco estiver vazio
@app.on_event("startup")
def on_startup():
    auto_migrate()
    seed_database()

# Inclusão dos Routers
app.include_router(pdvs_router)
app.include_router(pedidos_router)
app.include_router(visitas_router)
app.include_router(webhooks_router)
app.include_router(metrics_router)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "app": "Naturebarr B2B CRM API",
        "docs": "/docs",
        "polos": ["Salvador (BA)", "São Paulo (SP)", "Santa Catarina (SC)"]
    }

@app.post("/api/v1/reset-seed")
def reset_seed():
    """Recarrega os dados de teste iniciais."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database()
    return {"message": "Banco de dados reinicializado com os dados de demonstração da Naturebarr!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
