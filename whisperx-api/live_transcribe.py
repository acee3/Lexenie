from flask import Flask
import whisperx

# device = "cuda" 
# batch_size = 16 # reduce if low on GPU mem
# compute_type = "float16" # change to "int8" if low on GPU mem (may reduce accuracy)

# # 1. Transcribe with original whisper (batched)
# model = whisperx.load_model("base", device, compute_type=compute_type)

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"