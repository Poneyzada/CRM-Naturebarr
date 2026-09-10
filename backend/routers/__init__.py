from backend.routers.pdvs import router as pdvs_router
from backend.routers.pedidos import router as pedidos_router
from backend.routers.visitas import router as visitas_router
from backend.routers.webhooks import router as webhooks_router
from backend.routers.metrics import router as metrics_router

__all__ = ["pdvs_router", "pedidos_router", "visitas_router", "webhooks_router", "metrics_router"]
