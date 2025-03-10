"""Uses the whisper model to provide VAD and 
transcription services for audio chunks as 
base64 strings.
Converts the audio chunks to wav files 
automatically.
"""
from flask import Flask, request
from speechbrain.inference.VAD import VAD
import whisper
import tempfile
import librosa
import soundfile as sf
import torchaudio
import base64
import io
import wave
import shutil

PORT = 5000
SAMPLE_RATE = 16000

VAD = VAD.from_hparams(
    source="speechbrain/vad-crdnn-libriparty"
)

model = whisper.load_model("base")


app = Flask(__name__)


def tensor_to_base64(waveform, fmt='wav'):
    buffer = io.BytesIO()
    torchaudio.save(buffer, waveform, SAMPLE_RATE, format=fmt)
    audio_bytes = buffer.getvalue()
    return base64.b64encode(audio_bytes).decode()

@app.post("/vad-segment")
def vad_segment():
    data = request.json
    audio_buffer = base64.b64decode(data["audio"])
    original_sample_rate, nchannels, sampwidth = data["sample_rate"], data["nchannels"], data["sampwidth"]
    with tempfile.NamedTemporaryFile(suffix='.wav') as f, wave.open(f.name, 'wb') as wf:
        wf.setnchannels(nchannels)
        wf.setsampwidth(sampwidth)
        wf.setframerate(original_sample_rate)
        wf.writeframes(audio_buffer)
        
        # shutil.copy(f.name, "destination_file.wav")
        # print("Texts: ", (model.transcribe(f.name))['text'])
        if original_sample_rate != SAMPLE_RATE:
            y, old_sr = librosa.load(f.name)
            y_resampled = librosa.resample(y, orig_sr=old_sr, target_sr=SAMPLE_RATE)
            sf.write(f.name, y_resampled, SAMPLE_RATE)
        
        full_duration = librosa.get_duration(filename=f.name)
        
        boundaries = VAD.get_speech_segments(
            f.name, 
            apply_energy_VAD=True, 
            # These parameters can be used if more fine-grained control is needed
            # close_th=0.025, 
            # len_th=0.1
        )
        segments = VAD.get_segments(
            boundaries,
            f.name
        )
        ans = [{
            "segment": tensor_to_base64(segment), 
            "start": boundaries[i].item(), 
            "end": boundaries[i+1].item()
        } for i, segment in enumerate(segments)]
    return {"segments": ans, "duration": full_duration}


@app.post("/transcribe")
def transcribe():
    data = request.json
    audio_buffer = base64.b64decode(data["audio"])
    # original_sample_rate = data["sample_rate"]
    with tempfile.NamedTemporaryFile(suffix='.wav') as f:
        f.write(audio_buffer)
        text = (model.transcribe(f.name))['text']
    return {"text": text}


if __name__ == '__main__':
   app.run(debug=True, port=PORT)