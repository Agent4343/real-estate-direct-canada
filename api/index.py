# Minimal Flask entrypoint to satisfy Vercel's Python detection
# This file prevents Vercel from erroring, but does nothing since we only deploy Next.js
from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
    return {'status': 'ok', 'message': 'This is a Next.js application'}

if __name__ == '__main__':
    app.run()

