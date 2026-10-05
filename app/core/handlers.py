from app.core.response import error
from app.core.exceptions import AppException
from werkzeug.exceptions import HTTPException
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError
from app.extensions import db
import logging 
logger = logging.getLogger(__name__)


def register_error_handlers(app):

    @app.errorhandler(AppException)
    def handle_app_exception(err):
        return error(
            message=err.message,
            errors=err.errors,
            status=err.status_code
        )
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(err):
        # err.messages contém os detalhes da validação
        return error(message="Erro de validação nos dados enviados", errors=err.messages, status=422)

    @app.errorhandler(HTTPException)
    def handle_http_exception(err):
        return error(message=err.description, status=err.code)
    
    @app.errorhandler(IntegrityError)
    def handle_integrity_error(err):
        db.session.rollback()
        return error("Erro de integridade no banco de dados", status=400)

    @app.errorhandler(Exception)
    def handle_unexpected(err):
        logger.exception("Erro inesperado")
        return error("Erro interno", status=500)