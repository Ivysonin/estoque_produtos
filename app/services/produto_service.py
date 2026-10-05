from app.models.produto_model import Produto
from app.extensions import db


class ProdutoService:

    @staticmethod
    def criar(dados):
        """
        dados = {
            "categoria":"",
            "nome":"",
            "quantidade":""
        }
        """

        produto = Produto.query.filter_by(nome=dados["nome"]).first()

        if produto:
            produto.quantidade = dados["quantidade"]
            produto.categoria = dados["categoria"]
            produto.ativo = True
            db.session.commit()
            return produto

        produto = Produto(
            categoria=dados["categoria"],
            nome=dados["nome"],
            quantidade=dados["quantidade"]
        )

        db.session.add(produto)
        db.session.commit()

        return produto


    @staticmethod
    def listar():
        query = Produto.query.filter_by(ativo=True)

        return query.all()


    @staticmethod
    def editar(produto_id: int, dados: dict):
        """
        dados = {
            "categoria":"",
            "nome":"",
            "quantidade":""
        }
        """

        produto = Produto.query.get_or_404(produto_id)

        if "categoria" in dados:
            produto.categoria = dados["categoria"]

        if "nome" in dados:
            produto.nome = dados["nome"]

        if "quantidade" in dados:
            produto.quantidade = dados["quantidade"]

        db.session.commit()

        return produto


    @staticmethod
    def desativar(produto_id: int):
        produto = Produto.query.get_or_404(produto_id)
        produto.ativo = False

        db.session.commit()