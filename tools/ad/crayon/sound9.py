"""Cartoon sound design for dinrr crayon #9 "Same Dinner, 7 Days". Everything synthesized here (no samples).
Arc: easy ukulele -> frantic build -> lonely tuba -> sunny ukulele/xylophone bounce.
Writes sfx9.wav, music9.wav, mix9.wav (48 kHz stereo)."""
import json, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; DUR=23.6; N=int(SR*DUR); rng=np.random.default_rng(11)
BPM=100; beat=60/BPM
def t_(d): return np.arange(int(SR*d))/SR
def env(d,a=.004,decay=.3): t=t_(d); return np.minimum(1,t/max(a,1e-4))*np.exp(-t/decay)
def lp(x,f): return sosfilt(butter(2,f,'low',fs=SR,output='sos'),x)
def hp(x,f): return sosfilt(butter(2,f,'high',fs=SR,output='sos'),x)
def bp(x,lo,hi): return sosfilt(butter(2,[lo,hi],'band',fs=SR,output='sos'),x)
def note(m): return 440*2**((m-69)/12)
def noise(d): return rng.standard_normal(int(SR*d))
def place(buf,sig,t,gain=1.,pan=0.):
    i=int(t*SR)
    if i>=len(buf) or i<0: return
    sig=sig[:len(buf)-i]; l,r=np.cos((pan+1)*np.pi/4),np.sin((pan+1)*np.pi/4)
    buf[i:i+len(sig),0]+=sig*gain*l*1.414; buf[i:i+len(sig),1]+=sig*gain*r*1.414
def reverb(x,secs=1.2,wet=.2,tone=6000):
    ir_t=t_(secs); ir=lp(rng.standard_normal(len(ir_t))*np.exp(-ir_t/(secs/5)),tone); ir/=np.sqrt(np.sum(ir**2))
    out=np.zeros_like(x)
    for c in range(2): out[:,c]=fftconvolve(x[:,c],ir,mode='full')[:len(x)]
    return x*(1-wet)+out*wet
def sweep(f0,f1,d,decay=.08,a=.003,shape=1):
    t=t_(d); f=f0*(f1/f0)**(np.minimum(1,t/d)**shape); return np.sin(2*np.pi*np.cumsum(f)/SR)*env(d,a,decay)
def marimba(m,d=.5,dec=.18):
    f=note(m); t=t_(d); return (np.sin(2*np.pi*f*t)+.5*np.sin(2*np.pi*4*f*t)*np.exp(-t/.04)+.12*np.sin(2*np.pi*10*f*t)*np.exp(-t/.02))*env(d,.002,dec)
def bell(m,d=.6,dec=.2):
    f=note(m); t=t_(d); return (np.sin(2*np.pi*f*t)+.35*np.sin(2*np.pi*2*f*t)*np.exp(-t/.05)+.12*np.sin(2*np.pi*3.01*f*t))*env(d,.002,dec)
def pluck(m,d=.9,damp=.996):
    f=note(m); n=int(SR*d); p=int(SR/f); buf=rng.uniform(-1,1,p); out=np.zeros(n)
    for i in range(n):
        out[i]=buf[i%p]; buf[i%p]=damp*.5*(buf[i%p]+buf[(i+1)%p])
    return lp(out,5000)*np.minimum(1,t_(d)/.003)
def kick(): d=.35; t=t_(d); return np.sin(2*np.pi*np.cumsum(45+90*np.exp(-t/.035))/SR)*np.exp(-t/.16)
def clap():
    d=.2; out=np.zeros(int(SR*d)); n=bp(noise(d),900,4500)
    for o in (0,.012,.024): j=int(o*SR); out[j:]+=n[:len(out)-j]*np.exp(-t_(d)[:len(out)-j]/.05)
    return out*.35
def hat(open_=False): d=.12 if open_ else .05; return hp(noise(d),7000)*env(d,.001,.07 if open_ else .03)
def shaker(): d=.07; return bp(noise(d),5000,11000)*env(d,.004,.03)
def tom(f): d=.3; t=t_(d); return np.sin(2*np.pi*np.cumsum(f*(1+.6*np.exp(-t/.03)))/SR)*np.exp(-t/.09)
def whoosh(d=.55,up=True):
    n=noise(d); out=np.zeros_like(n); blk=1024
    for k in range(0,len(n),blk//2):
        frac=k/len(n); fc=300*10**frac if up else 3000/10**frac; seg=n[k:k+blk]
        if len(seg)<64: continue
        out[k:k+len(seg)]+=bp(seg,fc*.6,min(fc*1.6,SR/2-100))*np.hanning(len(seg))
    return out*np.sin(np.pi*np.minimum(1,t_(d)/d))**1.5*.9
def saw_glide(f0,f1,d,vib=0):
    t=t_(d); f=np.linspace(f0,f1,len(t))*(1+vib*np.sin(2*np.pi*5.5*t)); ph=np.cumsum(f)/SR
    s=2*(ph%1)-1; return lp(s,1400)*np.minimum(1,t/.03)*np.minimum(1,(d-t)/.05)
def click(f=1800,d=.03): t=t_(d); return (hp(noise(d),1500)*.5+np.sin(2*np.pi*f*t))*env(d,.0005,.006)

def M(*a):
    n=max(len(x) for x in a); o=np.zeros(n)
    for x in a: o[:len(x)]+=x
    return o
def formant(x,fs): # crude vowel colour
    out=np.zeros_like(x)
    for f,w,g in fs: out+=bp(x,max(60,f-w),min(SR/2-100,f+w))*g
    return out
def saw(f,d):
    ph=np.cumsum(np.full(int(SR*d),f) if np.isscalar(f) else f)/SR; return 2*(ph%1)-1
def sq(f,d,duty=.5):
    ph=np.cumsum(np.full(int(SR*d),f) if np.isscalar(f) else f)/SR; return np.where(ph%1<duty,1.,-1.)
# ---- cartoon voices ----
def bonk(i=0):                       # hollow wooden bonk, pitch climbs with the counter
    f=note(62+min(i,14)); d=.22; t=t_(d)
    return (np.sin(2*np.pi*np.cumsum(f*(1+.35*np.exp(-t/.02)))/SR)*np.exp(-t/.07)+.4*bp(noise(d),600,2200)*np.exp(-t/.012))
def slidewhistle(up=True,d=.45):
    t=t_(d); k=t/d; f=(500+1500*k**1.4) if up else (2000-1500*k); f=f*(1+.02*np.sin(2*np.pi*7*t))
    return (np.sin(2*np.pi*np.cumsum(f)/SR)+.3*np.sin(4*np.pi*np.cumsum(f)/SR)*.3+.05*hp(noise(d),3000))*np.minimum(1,t/.02)*np.minimum(1,(d-t)/.05)*.7
def boing():
    t=t_(.5); f=180*np.exp(t*3.2)*(1+.12*np.sin(2*np.pi*16*t)); return (np.sin(2*np.pi*np.cumsum(f)/SR)+.4*np.sin(4*np.pi*np.cumsum(f)/SR))*env(.5,.004,.16)*.8
def tip():                           # one tiptoe step: wood tick + tiny squeak
    t=t_(.07); return M(sweep(900,500,.07,.02)*.6,hp(noise(.07),2500)*env(.07,.0005,.01)*.5)
def squeak():
    d=.12; t=t_(d); f=2100+900*np.sin(np.pi*t/d)+60*np.sin(2*np.pi*30*t); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.minimum(1,t/.01)*np.minimum(1,(d-t)/.03)*.5
def woof(p=1.):
    d=.22; t=t_(d); f=(260+120*np.exp(-t/.05))*p; s=saw(f,d)
    s=formant(s,[(700,250,1.),(1200,300,.5)])+.15*bp(noise(d),500,1800)
    return s*np.minimum(1,t/.008)*np.exp(-t/.09)*1.6
def buzz(d=.35):
    t=t_(d); s=sq(130,d,.3)*(.6+.4*np.sign(np.sin(2*np.pi*22*t))); return lp(s,2200)*np.minimum(1,t/.01)*np.minimum(1,(d-t)/.03)*.5
def clownhonk(d=.28,f0=300):
    t=t_(d); f=f0*(1+.18*np.exp(-t/.04)); s=saw(f,d)+.5*sq(f*1.005,d,.35); s=formant(s,[(900,300,1.),(1700,400,.7)])
    return s*np.minimum(1,t/.01)*np.minimum(1,(d-t)/.04)*.9
def msgchime():                      # soft two-note xylophone "ding-ding", not a game coin
    return np.concatenate([marimba(79,.25,.1)*.8,marimba(84,.35,.16)*.8])
def doorbell():
    a=bell(76,.55,.3); b=bell(72,.9,.45); return np.concatenate([a,b])*.8
def snareroll(d):
    n=int(SR*d); out=np.zeros(n); k=0; tcur=0.
    while tcur<d-.05:
        gap=.085*(1-.7*tcur/d); g=.25+.75*tcur/d
        s=bp(noise(.06),1500,7000)*env(.06,.0005,.025)*g; j=int(tcur*SR); seg=s[:n-j]; out[j:j+len(seg)]+=seg; tcur+=gap
    return out
def kettle(d):
    t=t_(d); f=1700+900*(t/d)**2+30*np.sin(2*np.pi*9*t); s=np.sin(2*np.pi*np.cumsum(f)/SR)+.3*bp(noise(d),2000,5000)
    return s*np.minimum(1,t/.1)*np.minimum(1,(d-t)/.05)*.5
def rollup(d):                       # counter spinning: fast ratchet of ticks rising in pitch
    n=int(SR*d); out=np.zeros(n); tcur=0.
    while tcur<d-.03:
        k=tcur/d; s=M(sweep(700+2200*k,600+2000*k,.025,.01)*.5,hp(noise(.02),3000)*env(.02,.0005,.006)*.3)
        j=int(tcur*SR); seg=s[:n-j]; out[j:j+len(seg)]+=seg; tcur+=.034-.016*k
    return out
def crash():
    d=1.0; t=t_(d); return M(hp(noise(d),3500)*np.exp(-t/.35)*.7,bp(noise(d),600,2500)*np.exp(-t/.2)*.4,sweep(120,50,.3,.1)*.6)
def shatter():
    out=np.zeros(int(SR*.9))
    for k in range(18):
        j=int(rng.uniform(0,.35)*SR); f=rng.uniform(2200,6500); s=sweep(f,f*.97,.12,.04)*rng.uniform(.2,.6); out[j:j+len(s)]+=s[:len(out)-j]
    return out+hp(noise(.9),5000)*np.exp(-t_(.9)/.1)*.3
def deflate():
    d=.8; t=t_(d); f=900*np.exp(-t*2.6)*(1+.08*np.sin(2*np.pi*(18-8*t/d)*t)); s=saw(f,d)*.5+hp(noise(d),1500)*.25
    return lp(s,3500)*np.minimum(1,t/.02)*np.minimum(1,(d-t)/.1)*.7
def growl(d=.9):
    t=t_(d); f=85-8*t; s=saw(f,d)*(.6+.4*np.sign(np.sin(2*np.pi*22*t)))+.3*lp(noise(d),500); return lp(s,700)*np.minimum(1,t/.1)*np.minimum(1,(d-t)/.2)*.7
def trombone(f0,f1,d,vib=0):
    t=t_(d); f=np.linspace(f0,f1,len(t))*(1+vib*np.sin(2*np.pi*5.5*t)); s=saw(f,d)+.4*sq(f,d,.4)
    s=formant(s,[(500,150,1.),(1000,200,.5)]); return s*np.minimum(1,t/.04)*np.minimum(1,(d-t)/.06)
def poof():
    d=.35; t=t_(d); return M(lp(noise(d),1800)*np.exp(-t/.1)*.8,sweep(300,120,.2,.08)*.3)
def sip():
    d=.5; t=t_(d); f=800+900*np.sin(np.pi*t/d*.9); n=noise(d); out=np.zeros(len(t)); k=0
    for j in range(0,len(t),2048): seg=n[j:j+2048]; fc=700+1500*(j/len(t)); out[j:j+len(seg)]=bp(seg,fc*.7,fc*1.4) if len(seg)>128 else 0
    return out*np.sin(np.pi*t/d)*.9
def xylo(m,d=.5):
    f=note(m); t=t_(d); return (np.sin(2*np.pi*f*t)+.6*np.sin(2*np.pi*3.9*f*t)*np.exp(-t/.02)+.3*np.sin(2*np.pi*9.2*f*t)*np.exp(-t/.01))*env(d,.001,.12)
def brass(m,d=.7):
    t=t_(d); s=saw(note(m),d)+saw(note(m)*1.004,d); return lp(s,2400)*np.minimum(1,t/.02)*np.exp(-t/.5)*np.minimum(1,(d-t)/.08)
def bubblepop(i=0):
    f=500+90*i; return M(sweep(f,f*2.0,.07,.025)*.7,hp(noise(.02),2500)*env(.02,.0005,.005)*.3)
def tick(i=0): return M(sweep(1200+60*i,700,.05,.015)*.6,bp(noise(.03),1500,4500)*env(.03,.0005,.008)*.5)

def dooropen():                       # fridge seal 'thwop' + soft rising air
    d=.32; t=t_(d); return M(sweep(140,260,.12,.05)*.8,bp(noise(d),400,2500)*np.exp(-t/.08)*.35,whoosh(.3,True)*.25)
def doorclose():                      # padded fridge 'thump'
    d=.3; t=t_(d); return M(np.sin(2*np.pi*np.cumsum(70+80*np.exp(-t/.02))/SR)*np.exp(-t/.08),lp(noise(d),900)*np.exp(-t/.03)*.5)
def clocktick():                     # wall clock tick-tock (wood)
    return np.concatenate([sweep(2400,2000,.04,.01)*.5,np.zeros(int(SR*.12)),sweep(1700,1400,.05,.012)*.45])
def wind(d=1.5):                      # lonely desert wind for the tumbleweed
    t=t_(d); n=noise(d); out=np.zeros(len(t))
    for j in range(0,len(t),2048):
        seg=n[j:j+2048]; fc=500+350*np.sin(2*np.pi*.7*j/SR)
        if len(seg)>128: out[j:j+len(seg)]=bp(seg,fc*.8,fc*1.25)
    return out*np.sin(np.pi*t/d)*1.4
def thud(): d=.3; t=t_(d); return M(np.sin(2*np.pi*np.cumsum(70+80*np.exp(-t/.03))/SR)*np.exp(-t/.1),lp(noise(d),400)*env(d,.002,.05)*.5)
def popfx(i=0): return sweep(500+80*i,1400+120*i,.08,.04)
def shiver(d): t=t_(d); return bp(noise(d),2500,6000)*(.5+.5*np.sin(2*np.pi*14*t))*np.minimum(1,t/.05)*np.minimum(1,(d-t)/.2)*.35
def squish(): d=.35; t=t_(d); return M(lp(noise(d),900)*env(d,.01,.12)*(1+np.sin(2*np.pi*9*t))*.6,sweep(300,120,.3,.12)*.5)
def jellyfx(): d=.7; t=t_(d); f=220+60*np.sin(2*np.pi*11*t)*np.exp(-t/.3); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/.25)
def splash(): d=.6; return M(bp(noise(d),600,5000)*env(d,.01,.18),*[sweep(800+300*k,1600+400*k,.12,.05)*.3 for k in range(3)])
sfx=np.zeros((N,2)); ev=json.load(open('sfx9.json'))
for e in ev:
    t,ty=e['t'],e['type']; i=e.get('i',0)
    if ty=='bonk': place(sfx,bonk(i),t,.8,pan=-.4+.8*rng.random())
    elif ty=='dooropen': place(sfx,dooropen(),t,.7,pan=.2)
    elif ty=='doorclose': place(sfx,doorclose(),t,.9,pan=.2)
    elif ty=='slide': place(sfx,slidewhistle(e.get('dir')!='down'),t,.4)
    elif ty=='clock': place(sfx,clocktick(),t,.6,pan=-.3)
    elif ty=='wind': place(sfx,wind(e.get('d',1.5)),t,.6)
    elif ty=='boing': place(sfx,boing(),t,.6)
    elif ty=='step':
        for k in range(e.get('n',3)): place(sfx,tip(),t+k*.13,.5,pan=-.3+.3*k)
    elif ty=='squeak': place(sfx,squeak(),t,.6); place(sfx,squeak()*.8,t+.14,.6)
    elif ty=='woof': place(sfx,woof(1.0+.1*rng.standard_normal()),t,.75,pan=.3)
    elif ty=='buzz': place(sfx,buzz(),t,.5)
    elif ty=='chime': place(sfx,msgchime(),t,.7)
    elif ty=='doorbell': place(sfx,doorbell(),t,.7)
    elif ty=='honk': place(sfx,clownhonk(.26,290+20*rng.random()),t,.55,pan=-.2)
    elif ty=='drumroll': place(sfx,snareroll(e.get('d',4.5)),t,.55)
    elif ty=='kettle': place(sfx,kettle(e.get('d',1.)),t,.5,pan=.4)
    elif ty=='rollup': place(sfx,rollup(e.get('d',.5)),t,.7)
    elif ty=='crash': place(sfx,crash(),t,.9)
    elif ty=='shatter': place(sfx,shatter(),t,.6)
    elif ty=='deflate': place(sfx,deflate(),t,.7)
    elif ty=='howl': place(sfx,trombone(330,520,.35)*.6,t,.45,pan=.35); place(sfx,trombone(520,300,.8,vib=.05)*.6,t+.33,.45,pan=.35)
    elif ty=='growl': place(sfx,growl(),t,.55)
    elif ty=='wah':
        for k,(f0,f1,d) in enumerate([(233,220,.3),(220,208,.3),(208,196,.3),(196,140,1.0)]):
            place(sfx,trombone(f0,f1,d,vib=.035 if k==3 else 0),t+[0,.36,.72,1.08][k],.5)
    elif ty=='whoosh': place(sfx,whoosh(.45,e.get('dir')!='in'),t,.5)
    elif ty=='tink': place(sfx,bubblepop(i),t,.7,pan=-.4+.13*i)
    elif ty=='tap': place(sfx,tick(0),t,.7)
    elif ty=='tick': place(sfx,tick(i),t,.7,pan=rng.uniform(-.4,.4))
    elif ty=='check': place(sfx,tick(2),t,.6); place(sfx,xylo(84,.35)*.5,t+.03,.7)
    elif ty=='ring':
        for k in range(10): place(sfx,xylo([84,88][k%2],.12)*.7,t+k*.045,.45,pan=-.3)
    elif ty=='xnote': place(sfx,xylo(e['m'],.4),t,.6,pan=rng.uniform(-.3,.3))
    elif ty=='poof': place(sfx,poof(),t,.8)
    elif ty=='xylo': place(sfx,xylo([72,76,79][i%3],.5),t,.8,pan=-.2+.2*i)
    elif ty=='tada':
        for m in (79,84,88): place(sfx,brass(m,.9),t,.25)
    elif ty=='thud': place(sfx,thud(),t,.8)
    elif ty=='pop': place(sfx,popfx(i),t,.55,pan=rng.uniform(-.3,.3))
    elif ty=='shiver': place(sfx,shiver(e.get('d',2.)),t,.5,pan=.3)
    elif ty=='squish': place(sfx,squish(),t,.7,pan=-.1)
    elif ty=='jelly': place(sfx,jellyfx(),t,.6,pan=.1)
    elif ty=='splash': place(sfx,splash(),t,.6)
    elif ty=='sip': place(sfx,sip(),t,.6)
    elif ty=='sparkles':
        for k in range(8): place(sfx,xylo(int(rng.choice([88,91,93,96])),.25)*.3,t+k*.09,.4,pan=rng.uniform(-.8,.8))
    elif ty=='logo':
        for k,m in enumerate([60,64,67,72]): place(sfx,xylo(m+12,1.0),t+k*.05,.45)
        place(sfx,bubblepop(3),t,.6)
sfx=reverb(sfx,.5,.08,5000)

# ---- music: sneaky pizzicato -> frantic build -> sad tuba -> sunny ukulele/xylophone bounce ----
music=np.zeros((N,2))
def tuba(m,d=.3):
    t=t_(d); s=saw(note(m),d)+.5*sq(note(m),d,.3); return lp(s,500)*np.minimum(1,t/.01)*np.exp(-t/(d*.8))*np.minimum(1,(d-t)/.03)
def pizz(m,d=.3): return pluck(m,d,.99)*1.4
def clar(m,d=.2):
    t=t_(d); f=note(m); s=sum(np.sin(2*np.pi*f*(2*k+1)*t)/(2*k+1) for k in range(4)); return s*np.minimum(1,t/.01)*np.minimum(1,(d-t)/.03)*.6
def wblock(hi=True): return M(sweep(1500 if hi else 1100,1400 if hi else 1000,.04,.012)*.8,bp(noise(.03),900,3000)*env(.03,.0005,.01)*.3)
# 0 - 8.5: easy ukulele strum loop (low), C - F - G - C at 112 bpm
b1=60/112; uk=[[60,64,67,72],[60,65,69,72],[59,62,67,71],[60,64,67,72]]; ro=[36,29,31,36]
tb=0; kk=0
while tb<1.7:
    ci=(kk//4)%4
    if kk%2==0: place(music,tuba(ro[ci],.25),tb,.26)
    for j,m in enumerate(uk[ci]): place(music,pizz(m,.3),tb+j*.012,.07+.0*kk,pan=-.2)
    if kk%4==3: place(music,wblock(),tb+b1/2,.08,pan=.3)
    tb+=b1; kk+=1
# 5.5 - 8.25: frantic build
tb=1.7; stp=.2; m0=60; kk=0
while tb<6.8:
    place(music,clar(m0+[0,3,7,10,12,10,7,3][kk%8]+(kk//8)*2,.12),tb,.2,pan=-.2)
    if kk%2==0: place(music,tuba(36+[0,7][(kk//2)%2],.12),tb,.3)
    stp=max(.11,stp*.985); tb+=stp; kk+=1
# 8.3 - 9.5: lonely tuba
for m,tt in [(41,6.95),(40,7.6),(36,8.1)]: place(music,tuba(m,.6)*1.3,tt,.3)
# 9.5 - 20.0: sunny bounce, 112 bpm, C - Am - F - G
b2=60/112; chords=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]]; roots=[36,33,29,31]
mel=[(0,76),(1,79),(1.5,81),(2,79),(3,76),(4,74),(5,72),(5.5,74),(6,76),(8,79),(9,81),(9.5,84),(10,81),(11,79),(12,76),(13,74),(14,72),(14.5,72)]
bar=0; t0=9.5
while t0<19.9:
    ci=bar%4
    for k in range(4):
        tb=t0+k*b2
        if tb>=19.9: break
        if k%2==0: place(music,tuba(roots[ci]+(7 if k==2 else 0),.28),tb,.34)
        else:
            for m in chords[ci]: place(music,pizz(m+12,.25),tb,.12,pan=-.2+.1*(m%3))
        if k==3: place(music,wblock(),tb+b2/2,.1)
    bar+=1; t0+=4*b2
# melody: 16-beat phrase repeated, xylophone
for base in (9.5,9.5+16*b2):
    for bt,m in mel:
        tt=base+bt*b2
        if 9.8<=tt<19.9: place(music,xylo(m,.35),tt,.3,pan=.1)
place(music,tuba(36,1.4),20.1,.4)
for m in (60,64,67,72): place(music,xylo(m,1.5),20.1,.28)
music=lp(music.T,9000).T; music=reverb(music,.8,.1,5000)
t_all=np.arange(N)/SR
g=np.clip(1-(t_all-(DUR-1.4))/1.4,0,1); music*=g[:,None]
# music ducks at the crash/silence moment
def write(name,x,peak=.89): x=x/max(1e-9,np.max(np.abs(x)))*peak; wavfile.write(name,SR,(x*32767).astype(np.int16))
write('sfx9.wav',sfx); write('music9.wav',music); write('mix9.wav',sfx+music*.5)
print('ok')
