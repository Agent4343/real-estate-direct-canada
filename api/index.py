# Minimal Flask entrypoint to satisfy Vercel's Python detection
# This prevents the "No flask entrypoint found" error
from flask import Flask

app = Flask(__name__)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    # Return minimal response - Next.js handles all routing
    return {'status': 'ok', 'framework': 'nextjs'}, 200

if __name__ == '__main__':
    app.run()

