from flask import Flask, request
from speechbrain.inference.VAD import VAD
import whisper
import tempfile

VAD = VAD.from_hparams(
    source="speechbrain/vad-crdnn-libriparty"
)
print(VAD.get_speech_segments("preamble10.wav"))
model = whisper.load_model("base")

app = Flask(__name__)

@app.post("/vad-segment")
def vad_segment():
    data = request.json
    with tempfile.NamedTemporaryFile() as f:
        f.write(data["audio"])
        boundaries = VAD.get_speech_segments(f.name)
    return {"text": boundaries}

@app.post("/transcribe")
def transcribe():
    data = request.json
    text = (model.transcribe(data["audio"]))[text]
    return {"text": text}