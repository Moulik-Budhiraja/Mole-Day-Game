from flask import Flask, render_template, Response


app = Flask(__name__)


@app.route('/')
def index():
    resp = Response(render_template('index.html'))
    resp.headers["Access-Control-Allow-Origin"] = "*"

    return resp


if __name__ == '__main__':
    app.run(debug=True)
