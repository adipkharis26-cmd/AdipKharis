import numpy as np, subprocess, wave, sys
SR=44100
def load(p):
    r=subprocess.run(["ffmpeg","-v","error","-i",p,"-f","f32le","-ac","1","-ar",str(SR),"-"],capture_output=True).stdout
    return np.frombuffer(r,np.float32).copy()
def grms(x):
    w=SR//10; fr=x[:len(x)//w*w].reshape(-1,w); r=np.sqrt((fr**2).mean(1)); g=r>r.max()*.1  # gate quiet frames
    return np.sqrt((fr[g]**2).mean())
v=load("voice.mp3"); m=load("music.wav"); s=load("sfx.wav"); n=len(v)
m=np.pad(m,(0,max(0,n-len(m))))[:n]; s=np.pad(s,(0,max(0,n-len(s))))[:n]
vr=grms(v); m*=.5*vr/grms(m); s*=.5*vr/grms(s)
cap=.7*np.abs(v).max(); pk=np.abs(s).max()
if pk>cap: s*=cap/pk   # peak cap only: SFX never above 50 %
mix=v+m+s
print("voice dB",20*np.log10(vr),"music rel",20*np.log10(grms(m)/vr),"sfx rel",20*np.log10(grms(s)/vr),"sfx peak/voice peak",np.abs(s).max()/np.abs(v).max())
with wave.open("mix.wav","wb") as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(mix,-1,1)*32767).astype(np.int16).tobytes())
