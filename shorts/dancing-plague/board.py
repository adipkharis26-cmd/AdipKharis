from PIL import Image, ImageDraw, ImageFont
import math
W,H=540,960
F=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",22)
S=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",17)
PL=(70,40,80)
def bean(d,x,y,h,col,tilt=0,arms="down",face="neutral",hat=None):
    w=h*.38; t=tilt
    d.ellipse((x-w/2+t,y-h,x+w/2+t,y-h*.52),fill=(250,214,176),outline=PL,width=4)  # head
    d.rounded_rectangle((x-w*.45,y-h*.55,x+w*.45,y-h*.12),radius=int(w*.3),fill=col,outline=PL,width=4)
    d.rectangle((x-w*.3,y-h*.12,x-w*.05,y),fill=PL);d.rectangle((x+w*.05,y-h*.12,x+w*.3,y),fill=PL)
    ex=[x-w*.15+t,x+w*.15+t];ey=y-h*.78
    for e in ex: d.ellipse((e-4,ey-4,e+4,ey+4),fill=PL)
    my=y-h*.64
    if face=="o": d.ellipse((x+t-6,my-6,x+t+6,my+8),fill=PL)
    elif face=="smile": d.arc((x+t-12,my-10,x+t+12,my+8),0,180,fill=PL,width=3)
    else: d.line((x+t-10,my,x+t+10,my),fill=PL,width=3)
    ay=y-h*.45
    if arms=="up":
        d.line((x-w*.45,ay,x-w*.9,ay-h*.3),fill=PL,width=8);d.line((x+w*.45,ay,x+w*.9,ay-h*.3),fill=PL,width=8)
    elif arms=="sway":
        d.line((x-w*.45,ay,x-w*.95,ay-h*.1),fill=PL,width=8);d.line((x+w*.45,ay,x+w*.8,ay-h*.35),fill=PL,width=8)
    else:
        d.line((x-w*.45,ay,x-w*.6,ay+h*.25),fill=PL,width=8);d.line((x+w*.45,ay,x+w*.6,ay+h*.25),fill=PL,width=8)
    if hat: d.pieslice((x-w*.55+t,y-h*1.08,x+w*.55+t,y-h*.8),180,360,fill=hat,outline=PL,width=4)
def street(d,sky,ground,bg=(200,150,110)):
    d.rectangle((0,0,W,H),fill=sky);d.rectangle((0,H*.68,W,H),fill=ground)
    for i,(x,w,h) in enumerate([(-20,170,380),(150,160,320),(300,190,420),(470,120,340)]):
        d.rectangle((x,H*.68-h,x+w,H*.68),fill=tuple(c-10*i%30 for c in bg),outline=PL,width=4)
        d.polygon([(x-10,H*.68-h),(x+w/2,H*.68-h-70),(x+w+10,H*.68-h)],fill=(150,70,60),outline=PL)
        for k in range(2): d.rectangle((x+25+k*60,H*.68-h+60,x+55+k*60,H*.68-h+100),fill=(60,50,80))
panels=[]
def P(cap,fn,word):
    im=Image.new("RGB",(W,H));d=ImageDraw.Draw(im);fn(d)
    d.rectangle((0,H-110,W,H),fill=(20,15,30));d.text((14,H-100),word,font=F,fill=(255,255,255));d.text((14,H-62),cap,font=S,fill=(190,180,210))
    panels.append(im)
def p1(d): street(d,(240,200,150),(150,130,100)); bean(d,W/2,H*.9,520,(190,60,70),12,"sway","o")
def p2(d): street(d,(240,200,150),(150,130,100)); bean(d,W/2,H*.82,330,(190,60,70),-18,"up","o")
def p3(d):
    street(d,(235,190,140),(150,130,100));
    for i,c in enumerate([(70,120,190),(80,160,100),(200,160,60),(130,80,160)]): bean(d,90+i*115,H*.85,230,c,(-1)**i*10,"up" if i%2 else "sway","o")
    bean(d,W/2,H*.9,330,(190,60,70),0,"up","o")
    for x in (60,200,330,470): d.text((x,H*.3),"♪",font=F,fill=PL)
def p4(d):
    d.rectangle((0,0,W,H),fill=(120,150,190));d.rectangle((0,H*.7,W,H),fill=(110,95,80))
    bean(d,150,H*.88,420,(230,230,230),0,"down","smile");d.rectangle((60,H*.18,230,H*.3),fill=(250,245,230),outline=PL,width=4);d.text((70,H*.2),"DARAH\nPANAS",font=F,fill=PL)
    for i in range(3): bean(d,330+i*80,H*.92-i*40,200-i*25,(190,60,70),(-1)**i*10,"up","o")
def p5(d):
    street(d,(235,190,140),(150,130,100));d.rectangle((60,H*.58,480,H*.7),fill=(150,100,60),outline=PL,width=5)
    for i,c in enumerate([(60,60,120),(60,120,60),(120,60,60)]): bean(d,150+i*120,H*.58,180,c,0,"sway","smile",hat=(40,40,40))
    for x in (80,200,330,430): bean(d,x,H*.9,180,(190,100,100),(-1)**x%2*8,"up","o")
def p6(d):
    d.rectangle((0,0,W,H),fill=(160,120,90));d.rectangle((0,H*.7,W,H),fill=(120,100,80))
    for r in range(4):
        for i in range(5): bean(d,50+i*110+(r%2)*40,H*(.45+r*.12),140-r*8,[(190,60,70),(70,120,190),(80,160,100),(200,160,60)][(i+r)%4],(-1)**(i+r)*10,"up" if (i+r)%2 else "sway","o")
def p7(d):
    street(d,(190,200,230),(160,150,130))
    for i in range(7): bean(d,50+i*75,H*.9-(i%3)*60,200-(i%3)*35,[(190,60,70),(70,120,190),(80,160,100)][i%3],0,"down","neutral")
def p8(d):
    street(d,(210,215,235),(165,155,135))
    for x in (120,270,420): bean(d,x,H*.88,300,(120,120,140),0,"down","neutral")
    d.text((60,H*.2),"?",font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",160),fill=PL)
ps=[("MCU, handheld creep. Hook image.",p1,"Tahun 1518, seorang wanita mulai menari..."),
("Pull-back to full body, static crowd behind.",p2,"...dan dia tidak berhenti. Empat hari. Lima hari."),
("Wide, crowd joins, music notes. Warm light.",p3,"Seminggu kemudian, 34 orang ikut menari."),
("Doctor + sign gag, dancers in background.",p4,"Para dokter bilang: darah panas."),
("Stage + hired musicians. Jokes: fix = more dance.",p5,"Kota menyewa musisi, membangun panggung."),
("Crane up, packed square, 400 dancers.",p6,"Sebulan kemudian, hampir empat ratus orang."),
("Cut to cold blue, everyone frozen mid-step. Music stops.",p7,"Lalu satu pagi, semuanya berhenti."),
("Slow push to empty street, '?' (hanging end).",p8,"Tidak ada yang tahu kenapa mereka mulai. Atau berhenti.")]
for c,f,w in ps: P(c,f,w)
sheet=Image.new("RGB",(W*4//2+20,H*2//2+10),(10,10,10))
for i,im in enumerate(panels): sheet.paste(im.resize((W//2,H//2)),(i%4*(W//2+5),i//4*(H//2+5)))
sheet.save("storyboard.jpg",quality=88)
