# 📦 Sistema de Controle de Estoque

**Aplicação web monolítica**

Painel para cadastrar e organizar produtos por categoria, acompanhar quantidades e exportar a lista do estoque.

## 🎯 Funcionalidades

- Cadastrar e editar produtos
- Listar produtos ativos agrupados por categoria
- Buscar produtos por nome ou categoria
- Desativar produtos sem removê-los do banco de dados
- Exportar os produtos exibidos para uma planilha `.xls`
- Validar os dados recebidos pela API

## 🧱 Tecnologias

- Python3 e Flask
- Flask-SQLAlchemy e Flask-Migrate (Alembic)
- Marshmallow
- PostgreSQL
- HTML, CSS e JavaScript

## 🚀 Instalação

Na raiz do projeto, crie e ative um ambiente virtual:

```bash
python3 -m venv venv
source venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

## ⚙️ Configuração

Crie um banco de dados PostgreSQL e um arquivo `.env` na raiz:

```env
SECRET_KEY=uma-chave-secreta
DATABASE_URL=postgresql://usuario:senha@localhost:5432/estoque
```

## 🗄️ Banco de dados

Aplique as migrações:

```bash
flask --app main db upgrade
```

## ▶️ Executar

```bash
python3 main.py
```

Acesse o painel em [http://localhost:5000](http://localhost:5000).

## 🔌 API

Os endpoints retornam respostas JSON. A API de produtos não exige autenticação.

| Método | Endpoint | Ação |
| --- | --- | --- |
| `GET` | `/produtos` | Lista produtos ativos |
| `POST` | `/produtos` | Cadastra ou atualiza produto pelo nome |
| `PUT` | `/produtos/{produto_id}` | Edita um produto |
| `DELETE` | `/produtos/{produto_id}` | Desativa um produto |

Exemplo de corpo para cadastro:

```json
{
  "categoria": "bebidas",
  "nome": "suco de laranja",
  "quantidade": "10"
}
```

## 📄 Licença

Este projeto está licenciado sob os termos da [Licença MIT](./LICENSE), com cláusula adicional de atribuição.