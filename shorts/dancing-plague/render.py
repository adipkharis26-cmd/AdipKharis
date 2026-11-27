import math, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
FPS=30; DUR=36.28; N=round(DUR*FPS)
PL=(70,40,80); K=2
FB=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",44)
FQ=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",320)
class D:
    def __init__(s,im): s.d=ImageDraw.Draw(im)
    def _c(s,c): return [v*K for v in c]
    def ellipse(s,b,**k): s.d.ellipse(s._c(b),**s._w(k))
    def rectangle(s,b,**k): s.d.rectangle(s._c(b),**s._w(k))
    def rounded_rectangle(s,b,radius=0,**k): s.d.rounded_rectangle(s._c(b),radius=radius*K,**s._w(k))
    def line(s,b,**k): s.d.line(s._c(b),**s._w(k))
    def pieslice(s,b,a,e,**k): s.d.pieslice(s._c(b),a,e,**s._w(k))
    def arc(s,b,a,e,**k): s.d.arc(s._c(b),a,e,**s._w(k))
    def polygon(s,pts,**k): s.d.polygon([(x*K,y*K) for x,y in pts],**s._w(k))
    def text(s,p,t,**k): s.d.text((p[0]*K,p[1]*K),t,**k)
    def _w(s,k):
        k=dict(k)
        if 'width' in k:k['width']*=K
        return k
W,H=540,960
def bean(d,x,y,h,col,t=0,ph=0,mode="dance",face="o",hat=None,amp=1.0):
    w=h*.38
    s=math.sin(2*math.pi*1.7*t+ph) if mode=="dance" else 0
    tilt=12*s*amp*h/300; y=y-abs(s)*8*amp*h/300
    if mode=="still": tilt=0
    d.ellipse((x-w/2+tilt,y-h,x+w/2+tilt,y-h*.52),fill=(250,214,176),outline=PL,width=4)
    d.rounded_rectangle((x-w*.45+tilt*.3,y-h*.55,x+w*.45+tilt*.3,y-h*.12),radius=int(w*.3),fill=col,outline=PL,width=4)
    d.rectangle((x-w*.3,y-h*.12,x-w*.05,y),fill=PL);d.rectangle((x+w*.05,y-h*.12,x+w*.3,y),fill=PL)
    ey=y-h*.78
    for e in (x-w*.15+tilt,x+w*.15+tilt): d.ellipse((e-4,ey-4,e+4,ey+4),fill=PL)
    my=y-h*.64
    if face=="o": d.ellipse((x+tilt-6,my-6,x+tilt+6,my+8),fill=PL)
    elif face=="smile": d.arc((x+tilt-12,my-10,x+tilt+12,my+8),0,180,fill=PL,width=3)
    else: d.line((x+tilt-10,my,x+tilt+10,my),fill=PL,width=3)
    L=h*.32; ay=y-h*.47
    if mode=="dance":
        aL=math.pi*(.55+.4*math.sin(2*math.pi*1.7*t+ph)); aR=math.pi*(.55-.4*math.sin(2*math.pi*1.7*t+ph))
    else: aL=aR=.2
    for sgn,a in((-1,aL),(1,aR)):
        sx=x+sgn*w*.45; d.line((sx,ay,sx+sgn*L*math.sin(a),ay-L*math.cos(a)*(1 if mode=="dance" else -1)),fill=PL,width=8)
    if hat: d.pieslice((x-w*.55+tilt,y-h*1.08,x+w*.55+tilt,y-h*.8),180,360,fill=hat,outline=PL,width=4)
def street(d,sky,ground,scroll=0):
    d.rectangle((0,0,W,H),fill=sky);d.rectangle((0,H*.68,W,H),fill=ground)
    for i,(x,w,h) in enumerate([(-20,170,380),(150,160,320),(300,190,420),(470,120,340)]):
        d.rectangle((x,H*.68-h,x+w,H*.68),fill=(200-6*i,150-5*i,110),outline=PL,width=4)
        d.polygon([(x-10,H*.68-h),(x+w/2,H*.68-h-70),(x+w+10,H*.68-h)],fill=(150,70,60),outline=PL)
        for k in range(2): d.rectangle((x+25+k*60,H*.68-h+60,x+55+k*60,H*.68-h+100),fill=(60,50,80))
COLS=[(190,60,70),(70,120,190),(80,160,100),(200,160,60),(130,80,160)]
def ease(x): x=max(0,min(1,x)); return x*x*(3-2*x)
def scene(t):
    im=Image.new("RGB",(W*K,H*K));d=D(im);z=1.0;cx,cy=.5,.5;flash=0
    if t<5.2:
        u=t/5.2; street(d,(240,200,150),(150,130,100))
        bean(d,W/2,H*.9,520-30*u,COLS[0],t,0,amp=1.4); z=1.0+.1*u; cy=.45
    elif t<10.0:
        u=(t-5.2)/4.8; street(d,(240,200,150),(150,130,100))
        h=520-ease(u*1.6)*190; bean(d,W/2,H*.9-ease(u*1.6)*80,h,COLS[0],t,0,amp=1.2)
        for i,xx in enumerate((90,450)): bean(d,xx,H*.78,150,COLS[1+i],t,i,mode="still",face="neutral")
        z=1.0
    elif t<14.0:
        u=(t-10)/4; street(d,(235,190,140),(150,130,100))
        n=1+int(ease(u*1.4)*7)
        for i in range(n): bean(d,70+(i*173)%400+i*5,H*.82+(i%2)*30,230-(i%2)*30,COLS[i%5],t,i*.9)
        bean(d,W/2,H*.9,330,COLS[0],t,0,amp=1.2)
        for i in range(4): d.text((60+i*120,H*.28-12*math.sin(t*4+i)),"♪",font=FB,fill=PL)
        z=1.0+.06*u
    elif t<17.8:
        u=(t-14)/3.8; d.rectangle((0,0,W,H),fill=(120,150,190));d.rectangle((0,H*.7,W,H),fill=(110,95,80))
        bean(d,150,H*.88,420,(235,235,235),t,0,mode="still",face="smile")
        if t>15.3: 
            d.rectangle((60,H*.17,230,H*.28),fill=(250,245,230),outline=PL,width=4);d.text((72,H*.18),"DARAH\nPANAS",font=FB,fill=PL)
        for i in range(3): bean(d,330+i*80,H*.92-i*40,200-i*25,COLS[i],t,i*1.3)
        z=1.04+.05*u
    elif t<23.9:
        u=(t-17.8)/6.1; street(d,(235,190,140),(150,130,100))
        by=H*.58+(1-ease((t-17.9)/.25))*-40 if t<18.15 else H*.58
        d.rectangle((60,by,480,by+H*.12),fill=(150,100,60),outline=PL,width=5)
        for i,c in enumerate([(60,60,120),(60,120,60),(120,60,60)]): bean(d,150+i*120,by,180,c,t,i*.7,hat=(40,40,40),face="smile",amp=.6)
        for x in (80,200,330,430): bean(d,x,H*.9,180,(190,100,100),t,x*.05,amp=1.3)
        z=1.0+.08*u
    elif t<27.4:
        u=(t-23.9)/3.5; d.rectangle((0,0,W,H),fill=(160,120,90));d.rectangle((0,H*.7,W,H),fill=(120,100,80))
        for r in range(7):
            for i in range(6): bean(d,30+i*100+(r%2)*45,H*(.3+r*.1),130-r*4,COLS[(i+r)%5],t,i*.8+r*.5)
        z=1.0; cy=.5+.05*(1-u)
    elif t<30.4:
        u=(t-27.4)/3.0; street(d,(190,200,235),(160,150,130))
        mv=t<28.9
        for i in range(7): bean(d,50+i*75,H*.9-(i%3)*60,200-(i%3)*35,COLS[i%3],t,i*.8,mode="dance" if mv else "still",face="o" if mv else "neutral")
        z=1.0+.1*ease(u); 
    else:
        u=(t-30.4)/5.88; street(d,(210,215,235),(165,155,135))
        for x in (120,270,420): bean(d,x,H*.88,300,(120,120,140),t,0,mode="still",face="neutral")
        if t>33.6: d.text((190,H*.14),"?",font=FQ,fill=PL)
        z=1.0+.12*u
    if abs(t-27.4)<.1 or abs(t-5.2)<.0 : flash=max(0,1-abs(t-27.4)/.1)
    cw,ch=W*K/z,H*K/z
    l=max(0,min(W*K-cw,W*K*cx-cw/2)); tp=max(0,min(H*K-ch,H*K*cy-ch/2))
    im=im.crop((int(l),int(tp),int(l+cw),int(tp+ch)))
    if flash: im=Image.blend(im,Image.new("RGB",im.size,(255,255,255)),flash)
    return im
if __name__=="__main__":
    p=subprocess.Popen(["ffmpeg","-y","-loglevel","error","-f","rawvideo","-pix_fmt","rgb24","-s","1080x1920","-r","30","-i","-","-an","-c:v","libx264","-crf","17","-pix_fmt","yuv420p","silent.mp4"],stdin=subprocess.PIPE)
    for f in range(N):
        im=scene(f/FPS)
        if im.size!=(1080,1920): im=im.resize((1080,1920),Image.LANCZOS)
        p.stdin.write(im.tobytes())
    p.stdin.close(); p.wait(); print("done",N)
