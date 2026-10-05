from app.extensions import db


class Produto(db.Model):
    __tablename__ = "produto"

    id = db.Column(db.Integer, primary_key=True)
    categoria = db.Column(db.String(50), nullable=False)
    nome = db.Column(db.String(60), nullable=False)
    quantidade = db.Column(db.String(70), default="0", nullable=False)
    ativo = db.Column(db.Boolean, default=True, nullable=False)