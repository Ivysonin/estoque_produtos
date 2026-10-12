from flask import Blueprint, render_template


estoque_bp = Blueprint("estoque", __name__)


@estoque_bp.route("/")
def home():
    return render_template("estoque.html")