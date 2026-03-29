import librosa
import numpy as np

def extract_audio_features(audio_path: str, sr: int = 22050) -> dict:
    y, sr = librosa.load(audio_path, sr=sr)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = np.mean(mfcc, axis=1).tolist()
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    pitch_mean = float(np.mean(pitches[pitches > 0])) if pitches[pitches > 0].size > 0 else 0.0
    rms = librosa.feature.rms(y=y)
    energy_mean = float(np.mean(rms))
    zcr = librosa.feature.zero_crossing_rate(y)
    zcr_mean = float(np.mean(zcr))

    return {
        "mfcc_mean": mfcc_mean,
        "pitch_mean": pitch_mean,
        "energy_mean": energy_mean,
        "zcr_mean": zcr_mean,
    }