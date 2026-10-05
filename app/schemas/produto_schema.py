from marshmallow import Schema, fields, pre_load, validates, ValidationError


class ProdutoSchema(Schema):
    id = fields.Int(dump_only=True)
    categoria = fields.Str(required=True)
    nome = fields.Str(required=True)
    quantidade = fields.Str(required=True)

    @pre_load
    def normalizar_textos(self, data, **kwargs):
        dados_normalizados = {}
        for chave, valor in data.items():
            if isinstance(valor, str):
                valor = valor.strip().lower()
                if chave == "quantidade" and not valor:
                    valor = "0"
            dados_normalizados[chave] = valor

        return dados_normalizados

    @validates("categoria")
    def validate_categoria(self, value, **kwargs):
        if not value.strip():
            raise ValidationError("Categoria não pode ser vazia")

    @validates("nome")
    def validate_nome(self, value, **kwargs):
        if len(value.strip()) < 3:
            raise ValidationError("Nome do produto deve ter ao menos 3 caracteres")

    @validates("quantidade")
    def validate_quantidade(self, value, **kwargs):
        if not value.strip():
            raise ValidationError("Quantidade não pode ser vazia")