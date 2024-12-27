from flask import Flask
import whisper

model = whisper.load_model("base")

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"