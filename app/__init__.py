from flask import Flask
from app.extensions import db, migrate
from app.core.handlers import register_error_handlers
from app.config import Config


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    from app.controllers.produto_controller import produto_bp
    from app.controllers.estoque_controller import estoque_bp
    app.register_blueprint(produto_bp)
    app.register_blueprint(estoque_bp)
    register_error_handlers(app)

    from app.models import produto_model

    return app