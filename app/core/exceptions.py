class AppException(Exception):
    status_code = 400
    message = "Erro na aplicação"
    errors = None

    def __init__(self, message=None, errors=None):
        if message:
            self.message = message
        self.errors = errors


class UnauthorizedException(AppException):
    status_code = 401
    message = "Não autorizado"

class NotFoundException(AppException):
    status_code = 404
    message = "Recurso não encontrado"

class ValidationException(AppException):
    status_code = 422
    message = "Erro de validação"