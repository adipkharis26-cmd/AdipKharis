import numpy as np, subprocess, wave
SR=44100; T=36.28; n=int(SR*T); rng=np.random.default_rng(7)
def t_(d): return np.arange(int(SR*d))/SR
def put(buf,at,x):
    i=int(at*SR); x=x[:max(0,len(buf)-i)]; buf[i:i+len(x)]+=x
def tone(f,d,dec=6,sq=0): 
    t=t_(d); w=np.sin(2*np.pi*f*t)+.4*np.sin(4*np.pi*f*t)
    return w*np.exp(-dec*t)
def noise(d,lp=.2):
    x=rng.standard_normal(int(SR*d)); k=int(1/lp); return np.convolve(x,np.ones(k)/k,'same')
def whoosh(d=.5):
    t=t_(d); x=noise(d,.05)*np.sin(np.pi*t/d)**2; return x
def kick(): t=t_(.18); return np.sin(2*np.pi*(120*np.exp(-t*25)+40)*t)*np.exp(-t*20)
music=np.zeros(n); sfx=np.zeros(n)
stop=28.9; beat=.5; notes=[110,110,131,98]  # minor-ish, folk-march
b=0
while b*beat<stop:
    at=b*beat
    put(music,at,kick()*(1 if b%2==0 else .0)); 
    if b%2==1: put(music,at,noise(.1,.3)*np.exp(-t_(.1)*30)*.6)
    put(music,at,tone(notes[(b//2)%4]*(1 if b%2==0 else 2),.4,5)*.7)
    if b%4==0: 
        for f in (220,262,330): put(music,at,np.sin(2*np.pi*f*t_(1.9))*.12*np.minimum(1,t_(1.9)*8)*np.exp(-t_(1.9)*1.2))
    b+=1
# drone after stop
t=t_(T-stop); put(music,stop,np.sin(2*np.pi*55*t)*.5*np.minimum(1,t*2)*np.minimum(1,(T-stop-t)*1.5))
music[:int(SR*.3)]*=np.linspace(0,1,int(SR*.3))
# sfx
for at in (2.44,5.2,10.0,14.0,23.9,30.4): put(sfx,at-.15,whoosh(.45)*.5)
put(sfx,17.9,kick()*2); put(sfx,17.9,noise(.3,.3)*np.exp(-t_(.3)*14)*.8)  # stage thunk
for at in (8.0,9.2): put(sfx,at,tone(880,.5,8)*.5)  # day ting
put(sfx,16.8,tone(660,.4,6)*.4)
put(sfx,27.4,whoosh(.25)*.6)
put(sfx,28.9,kick()*2.5); put(sfx,28.9,tone(55,1.8,2)*1.5)  # sting at "berhenti"
put(sfx,33.7,tone(330,1.5,2)*.3)
for name,x in(("music",music),("sfx",sfx)):
    x=x/ (np.abs(x).max()+1e-9)
    with wave.open(f"{name}.wav","wb") as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((x*32767).astype(np.int16).tobytes())
