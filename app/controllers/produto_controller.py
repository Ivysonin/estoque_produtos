from flask import Blueprint, request
from app.schemas.produto_schema import ProdutoSchema
from app.services.produto_service import ProdutoService
from app.core.response import success


produto_bp = Blueprint("produtos", __name__, url_prefix="/produtos")
schema = ProdutoSchema()
schema_partial = ProdutoSchema(partial=True)


@produto_bp.route("", methods=["POST"])
def criar_produto():
    dados = schema.load(request.get_json())
    produto = ProdutoService.criar(dados)

    return success("Produto criado com sucesso", data=schema.dump(produto), status=201)


@produto_bp.route("", methods=["GET"])
def listar_produto():
    produtos = ProdutoService.listar()

    return success("Produtos listados com sucesso", data=schema.dump(produtos, many=True))


@produto_bp.route("/<int:produto_id>", methods=["PUT"])
def editar_produto(produto_id):
    dados = schema_partial.load(request.get_json())
    produto = ProdutoService.editar(produto_id, dados)

    return success("Produto editado com sucesso", data=schema_partial.dump(produto))


@produto_bp.route("/<int:produto_id>", methods=["DELETE"])
def desativar_produto(produto_id):
    ProdutoService.desativar(produto_id)

    return success("", status=204)