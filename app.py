#!flask/bin/python
import os

from flask_api import FlaskAPI

from lst import LatestStable

app = FlaskAPI(__name__)

lst = LatestStable()


# @app.route('/<string:platform>/<string:package>', methods=['GET'])
# def get_package(platform, package):
#     return {'version': getattr(lst, platform)(package)}

@app.route('/pypi/<string:package>', methods=['GET'])
def get_pypi(package):
    return {'version': lst.pypi(package)}


@app.route('/docker/<string:package>', methods=['GET'])
def get_docker(package):
    return {'version': lst.docker(package)}


@app.route('/github/<string:package>', methods=['GET'])
def get_github(package):
    return {'version': lst.github(package)}


@app.route('/wikipedia/<string:package>', methods=['GET'])
def get_wikipedia(package):
    return {'version': lst.wikipedia(package)}


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
