import os
import sys
import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal, Base, engine
from backend.models.pdv import PDV
from backend.models.pedido import Pedido
from backend.seed import seed_database

class TestNaturebarrCRM(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        Base.metadata.create_all(bind=engine)
        seed_database()

    def test_01_health_and_docs(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "online")

    def test_02_metrics_dashboard(self):
        res = self.client.get("/api/v1/metrics/dashboard")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("faturamento_total_b2b", data)
        self.assertIn("regioes", data)
        self.assertIn("Salvador", data["regioes"])
        self.assertIn("Sao Paulo", data["regioes"])
        self.assertIn("Santa Catarina", data["regioes"])
        self.assertGreater(data["total_pdvs"], 0)

    def test_03_list_pdvs_with_filters(self):
        # Filtro por Salvador
        res_ssa = self.client.get("/api/v1/pdvs?regiao=Salvador")
        self.assertEqual(res_ssa.status_code, 200)
        pdvs_ssa = res_ssa.json()
        self.assertTrue(all(p["regiao"] == "Salvador" for p in pdvs_ssa))

        # Filtro por SP
        res_sp = self.client.get("/api/v1/pdvs?regiao=Sao Paulo")
        self.assertEqual(res_sp.status_code, 200)
        pdvs_sp = res_sp.json()
        self.assertTrue(all(p["regiao"] == "Sao Paulo" for p in pdvs_sp))

    def test_04_create_and_recalculate_order(self):
        # Cria PDV de teste
        pdv_payload = {
            "razao_social": "Teste Emporio Ltda",
            "nome_fantasia": "Emporio Teste Recompra",
            "telefone_whatsapp": "71999990000",
            "cidade": "Salvador",
            "estado": "BA",
            "regiao": "Salvador",
            "status_pipeline": "Novo Lead",
            "media_dias_recompra": 15
        }
        res_pdv = self.client.post("/api/v1/pdvs", json=pdv_payload)
        self.assertEqual(res_pdv.status_code, 200)
        pdv_id = res_pdv.json()["id"]

        # Lança Pedido B2B
        pedido_payload = {
            "data_pedido": "2026-09-01",
            "forma_pagamento": "Boleto 30d",
            "itens": [
                {"sabor": "Cacau & Avela", "quantidade_caixas": 3, "preco_caixa": 96.00},
                {"sabor": "Pasta de Amendoim", "quantidade_caixas": 2, "preco_caixa": 96.00}
            ]
        }
        res_ped = self.client.post(f"/api/v1/pdvs/{pdv_id}/pedidos", json=pedido_payload)
        self.assertEqual(res_ped.status_code, 200)
        ped_data = res_ped.json()
        self.assertEqual(ped_data["total_caixas"], 5)
        self.assertEqual(ped_data["valor_total"], 480.00)

        # Verifica se o PDV foi promovido para PDV Ativo ou Alerta e faturamento atualizado
        res_check = self.client.get(f"/api/v1/pdvs/{pdv_id}")
        self.assertEqual(res_check.status_code, 200)
        check_data = res_check.json()
        self.assertEqual(check_data["faturamento_acumulado"], 480.00)
        self.assertEqual(check_data["total_pedidos"], 1)

    def test_05_meta_ads_webhook(self):
        lead_payload = {
            "ad_id": "ad_998877",
            "form_id": "form_meta_sp",
            "campaign_name": "Campanha Meta Ads SP Capital",
            "nome": "Guilherme Santos",
            "empresa": "Cafeteria Saudavel Jardins",
            "telefone": "11988887766",
            "cidade": "São Paulo",
            "estado": "SP",
            "categoria": "Cafeteria"
        }
        res = self.client.post("/api/v1/webhooks/meta-leads", json=lead_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["status"], "Novo Lead")
        self.assertEqual(data["regiao"], "Sao Paulo")

        # Verifica se o lead consta no banco
        pdv_id = data["pdv_id"]
        res_pdv = self.client.get(f"/api/v1/pdvs/{pdv_id}")
        self.assertEqual(res_pdv.status_code, 200)
        self.assertEqual(res_pdv.json()["nome_fantasia"], "Cafeteria Saudavel Jardins")
        self.assertEqual(res_pdv.json()["status_pipeline"], "Novo Lead")

if __name__ == "__main__":
    unittest.main()
