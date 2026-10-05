from flask import jsonify


def success(message="OK", data=None, status=200):
    return jsonify({
        "success": True,
        "message": message,
        "data": data,
        "errors": None
    }), status


def error(message="Erro", errors=None, status=400):
    return jsonify({
        "success": False,
        "message": message,
        "data": None,
        "errors": errors
    }), status