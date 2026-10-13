"""
Generic sound design for dinrr APP videos (real app recorded 1:1). Usage:
  python3 app_sound.py sfxN.json DUR MUSIC_START OUTPREFIX
Event types: ding(i,soft) typing freeze boom send whoosh(dir) pop(i) tap tick(i) check heart end riser music.
Originally the "group chat at 5pm" TikTok sound. Everything is synthesized
here (no samples), so it is 100% original and free to use.

Arc: notification chaos + rising tension  ->  freeze  ->  boom + the beat drops
     ("so I fixed it")  ->  satisfying pops/ticks while the app works  ->  calm.

Writes: sfx.wav (effects only), music.wav (music only), mix.wav (both), all 48 kHz stereo.
"""
import json, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
SFXJSON = sys.argv[1]
DUR = float(sys.argv[2])
MUSIC_START = float(sys.argv[3])
OUT = sys.argv[4]
N = int(SR * DUR)
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(SR * d)) / SR


def env(d, a=0.004, decay=0.3, curve=1.0):
    t = t_(d)
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / decay) ** curve
    return e


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def note(f):
    """MIDI note number -> Hz"""
    return 440.0 * 2 ** ((f - 69) / 12)


def place(buf, sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= len(buf):
        return
    sig = sig[: len(buf) - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i : i + len(sig), 0] += sig * gain * l * 1.414
    buf[i : i + len(sig), 1] += sig * gain * r * 1.414


def reverb(x, secs=1.2, wet=0.25, tone=6000):
    ir_t = t_(secs)
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / (secs / 5))
    ir = lp(ir, tone)
    ir /= np.sqrt(np.sum(ir**2))
    out = np.zeros_like(x)
    for c in range(x.shape[1]):
        out[:, c] = fftconvolve(x[:, c], ir * (1 if c == 0 else -1) if False else ir, mode="full")[: len(x)]
    return x * (1 - wet) + out * wet


# ── Sound effects ────────────────────────────────────────────────────────────
def bell(f, d=0.5, decay=0.18, bright=0.35):
    t = t_(d)
    s = np.sin(2 * np.pi * f * t) + bright * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.05) + 0.12 * np.sin(2 * np.pi * 3.01 * f * t)
    return s * env(d, 0.002, decay)


def ding(i, soft=False):
    # two-note "ba-ding" message tone, a little different every time
    base = [76, 79, 74, 81, 77, 83, 72, 76, 79][i % 9]
    s = np.concatenate([bell(note(base), 0.07, 0.05) * 0.8, np.zeros(1)])
    s2 = bell(note(base + 5), 0.55, 0.16)
    out = np.zeros(int(SR * 0.6))
    out[: len(s)] += s
    j = int(0.065 * SR)
    out[j : j + len(s2)] += s2[: len(out) - j]
    return out * (0.45 if soft else 0.6)


def blip(f0, f1, d=0.12, decay=0.05):
    t = t_(d)
    f = f0 + (f1 - f0) * np.minimum(1, t / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(d, 0.002, decay)


def noise(d):
    return rng.standard_normal(int(SR * d))


def whoosh(d=0.55, up=True):
    n = noise(d)
    t = t_(d)
    out = np.zeros_like(n)
    # sweep a band-pass by processing short overlapping blocks
    blk = 1024
    for k in range(0, len(n), blk // 2):
        frac = k / len(n)
        fc = 300 * (10 ** (frac * 1.0)) if up else 3000 / (10 ** (frac * 1.0))
        seg = n[k : k + blk]
        if len(seg) < 64:
            continue
        w = np.hanning(len(seg))
        out[k : k + len(seg)] += bp(seg, fc * 0.6, min(fc * 1.6, SR / 2 - 100)) * w
    shape = np.sin(np.pi * np.minimum(1, t / d)) ** 1.5
    return out * shape * 0.9


def boom():
    d = 1.4
    t = t_(d)
    f = 30 + 70 * np.exp(-t / 0.08)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.tanh(2.2 * np.sin(ph)) * np.exp(-t / 0.45)
    s += lp(noise(d), 900) * np.exp(-t / 0.03) * 0.6
    return s * 0.9


def tapestop():
    d = 0.32
    t = t_(d)
    f = 520 * np.exp(-t / 0.09) + 40
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + 0.4 * np.sin(2 * ph)) * env(d, 0.003, 0.12) * 0.55


def click(f=1800, d=0.03):
    t = t_(d)
    return (hp(noise(d), 1500) * 0.5 + np.sin(2 * np.pi * f * t)) * env(d, 0.0005, 0.006)


def riser():
    d = 2.72
    t = t_(d)
    n = noise(d)
    out = np.zeros_like(n)
    blk = 2048
    for k in range(0, len(n), blk // 2):
        frac = k / len(n)
        fc = 400 * (12 ** frac)
        seg = n[k : k + blk]
        if len(seg) < 64:
            continue
        out[k : k + len(seg)] += bp(seg, fc * 0.7, fc * 1.4) * np.hanning(len(seg))
    tone = np.sin(2 * np.pi * np.cumsum(110 * (2 ** (t / d * 1.0))) / SR) * 0.25
    return (out * 0.35 + tone) * (t / d) ** 2.2


sfx = np.zeros((N, 2))
events = json.load(open(SFXJSON))
pentatonic = [77, 79, 81, 84, 86, 89, 91]  # F G A C D F G
if any(e["type"] == "riser" for e in events):
    place(sfx, riser(), 0.0, 0.5)
for e in events:
    t, ty = e["t"], e["type"]
    if ty == "ding":
        place(sfx, ding(e["i"], e.get("soft", False)), t, 1.0, pan=[-0.4, 0.4, -0.2, 0.3, -0.5, 0.5, -0.2, 0.2, 0][e["i"] % 9])
    elif ty == "typing":
        for k in range(3):
            place(sfx, click(1200, 0.02), t + k * 0.13, 0.25)
    elif ty == "freeze":
        place(sfx, tapestop(), t, 0.8)
    elif ty == "boom":
        place(sfx, boom(), t, 0.6)
    elif ty == "send":
        place(sfx, whoosh(0.22, True), t - 0.12, 0.35)
        place(sfx, blip(note(84), note(91), 0.16, 0.06), t, 0.5)
    elif ty == "whoosh":
        place(sfx, whoosh(0.6, e.get("dir") == "out"), t, 0.75, pan=-0.3 if e.get("dir") == "out" else 0.3)
    elif ty == "pop":
        f = note(pentatonic[e["i"]])
        place(sfx, blip(f, f * 1.5, 0.14, 0.045), t, 0.95, pan=-0.5 + e["i"] / 6)
    elif ty == "tap":
        place(sfx, click(1600, 0.025), t, 0.55)
    elif ty == "tick":
        place(sfx, click(2400 + 180 * (e["i"] % 5), 0.02), t, 0.6, pan=rng.uniform(-0.5, 0.5))
    elif ty == "check":
        place(sfx, click(2000, 0.02), t, 0.65)
        place(sfx, bell(note(84), 0.4, 0.12) * 0.5 + np.pad(bell(note(91), 0.36, 0.12) * 0.4, (int(0.04 * SR), 0))[: int(0.4 * SR)], t + 0.01, 0.85)
    elif ty == "heart":
        place(sfx, blip(note(79), note(86), 0.14, 0.05), t, 0.45)
        for k, n_ in enumerate([91, 96, 100]):
            place(sfx, bell(note(n_), 0.4, 0.1, 0.1), t + 0.06 + k * 0.05, 0.18)
    elif ty == "end":
        for k, n_ in enumerate([65, 69, 72, 76, 79]):  # Fmaj9 shimmer
            place(sfx, bell(note(n_ + 12), 2.2, 0.8, 0.15), t + k * 0.06, 0.16)
sfx = reverb(sfx, 1.1, 0.18)

# ── Music (original lo-fi groove, 96 BPM, F major) ───────────────────────────
BPM = 96
beat = 60 / BPM
start = MUSIC_START
end_fade = DUR - 2.4
music = np.zeros((N, 2))
chords = [[53, 57, 60, 64], [50, 53, 57, 60], [46, 50, 53, 57], [48, 52, 55, 57]]  # Fmaj7 Dm7 Bbmaj7 C6
roots = [41, 38, 34, 36]


def epiano(f, d):
    t = t_(d)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 5 * t)
    s = np.sin(2 * np.pi * f * t + 0.6 * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.25))
    return s * env(d, 0.006, 0.9) * trem


def kick():
    d = 0.35
    t = t_(d)
    f = 45 + 90 * np.exp(-t / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)


def snare():
    d = 0.22
    t = t_(d)
    return (bp(noise(d), 1200, 6000) * 0.6 + np.sin(2 * np.pi * 190 * t) * 0.3) * np.exp(-t / 0.06)


def hat(open_=False):
    d = 0.12 if open_ else 0.05
    return hp(noise(d), 7000) * env(d, 0.001, 0.035 if not open_ else 0.07)


duck = np.ones(N)
bar = 4 * beat
nbars = int(np.ceil((DUR - start) / bar)) + 1
for b in range(nbars):
    t0 = start + b * bar
    ci = b % 4
    last = t0 >= end_fade - 0.01
    # chords: beat 1 and the "and" of 2
    for off, ln in ([(0, 1.6), (1.5 * beat, 1.2)] if not last else [(0, 3.5)]):
        for n_ in (chords[0] if last else chords[ci]):
            place(music, epiano(note(n_ + 12), ln), t0 + off, 0.07, pan=0.15)
    if last:
        break
    # bass
    for off in (0, 2 * beat, 3.5 * beat):
        place(music, lp(np.sin(2 * np.pi * note(roots[ci]) * t_(0.5)) * env(0.5, 0.01, 0.25), 300), t0 + off, 0.32)
    # drums (swing on 8th hats)
    for k in range(4):
        tb = t0 + k * beat
        if k in (0, 2):
            place(music, kick(), tb, 0.5)
            i = int(tb * SR)
            L = int(0.18 * SR)
            if i < N:
                duck[i : i + L] = np.minimum(duck[i : i + L], 0.55 + 0.45 * np.linspace(0, 1, min(L, N - i)))
        if k in (1, 3):
            place(music, snare(), tb, 0.17)
        place(music, hat(), tb, 0.12, pan=0.35)
        place(music, hat(k == 3), tb + beat * 0.58, 0.09, pan=0.35)
music *= duck[:, None]
music = lp(music.T, 9000).T
music = reverb(music, 1.6, 0.16, 5000)
# fade in on the drop, fade out at the end, gentle dip under the punchline dings
gain = np.ones(N)
t_all = np.arange(N) / SR
gain *= np.clip((t_all - start) / 0.02, 0, 1)
gain *= np.clip(1 - (t_all - (DUR - 1.6)) / 1.6, 0, 1)
music *= gain[:, None]


def write(name, x, peak=0.89):
    x = x / max(1e-9, np.max(np.abs(x))) * peak
    wavfile.write(name, SR, (x * 32767).astype(np.int16))


write(OUT + "sfx.wav", sfx)
write(OUT + "music.wav", music)
write(OUT + "mix.wav", sfx * 1.0 + music * 0.62)
print("wrote", OUT + "{sfx,music,mix}.wav")
