"""Original sound design for the dinrr crayon TikTok. Everything synthesized here (no samples).
Arc: caveman stomps -> medieval lute -> lonely fridge hum -> tense group-chat build -> tape-stop -> happy marimba drop.
Writes sfx.wav, music.wav, mix.wav (48 kHz stereo)."""
import json, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; DUR=27.0; N=int(SR*DUR); rng=np.random.default_rng(11)
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
PENT=[72,74,76,79,81,84,86,88]


def doorbell():
    return np.concatenate([bell(76,.5,.3),bell(72,.8,.4)])*0.9
def boing():
    t=t_(.35); f=200*np.exp(t*4)*(1+.15*np.sin(2*np.pi*14*t)); return np.sin(2*np.pi*np.cumsum(f)/SR)*env(.35,.004,.12)
def thud():
    t=t_(.3); return np.sin(2*np.pi*np.cumsum(60+80*np.exp(-t/.03))/SR)*np.exp(-t/.1)+lp(noise(.3),500)*np.exp(-t/.03)*.4
sfx=np.zeros((N,2)); ev=json.load(open('sfx2.json'))
for e in ev:
    t,ty=e['t'],e['type']; i=e.get('i',0)
    if ty=='pop': place(sfx,marimba(PENT[i%8],.4,.14)*.8,t,.8,pan=-.3+.1*i); place(sfx,sweep(300,note(PENT[i%8]+7),.1,.04)*.4,t,.8,pan=-.3+.1*i)
    elif ty=='thud': place(sfx,thud(),t,.8)
    elif ty=='boing': place(sfx,boing(),t,.6)
    elif ty=='whoosh': place(sfx,whoosh(.45,e.get('dir')!='in' ),t,.55)
    elif ty=='doorbell': place(sfx,doorbell(),t,.7)
    elif ty=='gasp': place(sfx,bp(noise(.3),700,3200)*np.sin(np.pi*np.minimum(1,t_(.3)/.3))*.9,t,.4)
    elif ty=='sad':
        place(sfx,marimba(67,.6,.3),t,.5*(.6 if e.get('soft') else 1)); place(sfx,marimba(63,.9,.4),t+.3,.5*(.6 if e.get('soft') else 1))
    elif ty=='fly':
        d=e['d']; tt=t_(d); f=210+25*np.sin(2*np.pi*1.3*tt)+8*np.sin(2*np.pi*7*tt); s_=np.sin(2*np.pi*np.cumsum(f)/SR)*(.6+.4*np.sin(2*np.pi*(f/ 1)*0))
        s_=bp(2*((np.cumsum(f)/SR)%1)-1,150,1200)*(1+.5*np.sin(2*np.pi*55*tt))*np.minimum(1,tt/.3)*np.minimum(1,(d-tt)/.3)
        place(sfx,s_,t,.18,pan=0)
    elif ty=='drip': place(sfx,sweep(1500,700,.12,.05)*.5,t,.4,pan=rng.uniform(-.5,.5))
    elif ty=='sting':
        place(sfx,kick()*1.1,t,.8)
        for m in (46,53,58,59): place(sfx,lp(2*((np.cumsum(np.full(int(SR*.7),note(m)))/SR)%1)-1,1500)*env(.7,.004,.3),t,.22)
    elif ty=='wah':
        for k,(f0,f1,d) in enumerate([(233,220,.3),(220,208,.3),(208,196,.3),(196,147,.9)]):
            place(sfx,saw_glide(f0,f1,d,vib=.03 if k==3 else 0),t+[0,.35,.7,1.05][k],.45)
    elif ty=='mpop': place(sfx,marimba(PENT[i%8],.5,.2),t,.55,pan=-.5+i/7)
    elif ty=='tap': place(sfx,click(1600,.025),t,.55)
    elif ty=='tick': place(sfx,click(2400+180*(i%5),.02),t,.6,pan=rng.uniform(-.5,.5))
    elif ty=='check':
        place(sfx,click(2000,.02),t,.65); place(sfx,bell(84,.4,.12)*.5+np.pad(bell(91,.36,.12)*.4,(int(.04*SR),0))[:int(.4*SR)],t+.01,.85)
    elif ty=='tada':
        for k,m in enumerate([72,76,79,84,88]): place(sfx,bell(m,1.0,.4),t+k*.045,.5)
    elif ty=='cheer':
        for k,m in enumerate([72,76,79,84]): place(sfx,bell(m,.4,.12)*.5,t+k*.07,.7)
    elif ty=='sparkles':
        for k in range(12): place(sfx,bell(int(rng.choice([88,91,93,96])),.3,.1)*.35,t+k*.07,.3,pan=rng.uniform(-.8,.8))
    elif ty=='logo':
        for k,m in enumerate([60,64,67,72,76]): place(sfx,bell(m+12,2.2,.8),t+k*.05,.35)
        place(sfx,kick(),t,.5)
# fridge hum under the fridge scenes
tt=t_(12.9); h=(np.sin(2*np.pi*100*tt)+.5*np.sin(2*np.pi*200*tt))*(1+.1*np.sin(2*np.pi*3*tt))*np.minimum(1,tt/.5)*np.minimum(1,(12.9-tt)/.3); place(sfx,lp(h,600),0,.07)
sfx=reverb(sfx,1.0,.16)

music=np.zeros((N,2))
def bars(a,b): return np.arange(a,b,beat)
# 0-14.4: playful tip-toe pizzicato (C minor-ish), goes sparser/sadder toward Friday
walk=[(48,0),(55,1),(51,2),(55,3),(48,4),(55,5),(53,6),(55,7)]
for bar in range(0,6):
    t0=bar*8*beat
    if t0>=12.9: break
    for m,o in walk:
        tt_=t0+o*beat/2*2
        if tt_<12.9: place(music,pluck(m+(12 if bar<3 else 0),.45,.994),tt_,.32 if tt_<7.8 else .26,pan=-.2)
    for k in range(0,8,2):
        tb=t0+k*beat/2*2
        if tb<12.9 and tb<10.8: place(music,click(900,.02)*.5,tb+beat/2,.18)
for k,tb in enumerate(bars(0,7.8)):
    if k%2==0: place(music,tom(120),tb,.2,pan=.2)
tt=t_(5); pad=(np.sin(2*np.pi*note(48)*tt)+.5*np.sin(2*np.pi*note(55)*tt))*np.sin(np.pi*tt/5)**2
place(music,lp(pad,500),7.8,.1); place(music,lp(pad,500),10.8,.1)
# funeral: slow minor chord marimba
for k,m in enumerate([60,63,67]): place(music,marimba(m,2.0,.9),13.0+k*.18,.2)
# 14.4: tape-stop -> bright groove (C - Am - F - G), 21.0 sustained, 24.0 end chord
place(music,kick()*1.2,14.4,.8)
for b in range(0,4):
    t0=14.4+b*4*beat
    ci=b%4; chords=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]]; roots=[36,33,29,31]
    for k in range(4):
        tb=t0+k*beat
        if k in (0,2): place(music,kick(),tb,.55)
        if k in (1,3): place(music,clap(),tb,.55)
        place(music,hat(),tb+beat/2,.12,pan=.3)
        for h in range(4): place(music,shaker(),tb+h*beat/4,.1)
    for off,ln in [(0,.28),(.75,.2),(1.5,.28),(2.5,.2),(3,.28)]:
        place(music,lp(np.sin(2*np.pi*note(roots[ci])*t_(.4))*env(.4,.01,.2),300),t0+off*beat,.4)
    for j,m in enumerate(chords[ci]*3): place(music,marimba(m+12+(12 if j>=6 else 0),.4,.14),t0+j*beat/2*.9,.28,pan=-.3+.07*j)
# dinner scene groove continues, then warm resolve
for b in range(4,6):
    t0=14.4+b*4*beat
    if t0>=24.0: break
    ci=b%4; chords=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]]; roots=[36,33,29,31]
    for k in range(4):
        tb=t0+k*beat
        if k in (0,2): place(music,kick(),tb,.5)
        if k in (1,3): place(music,clap(),tb,.5)
        place(music,hat(),tb+beat/2,.12,pan=.3)
    for off in (0,1.5,3): place(music,lp(np.sin(2*np.pi*note(roots[ci])*t_(.4))*env(.4,.01,.2),300),t0+off*beat,.4)
    for j,m in enumerate(chords[ci]*3): place(music,marimba(m+12,.4,.14),t0+j*beat/2*.9,.26,pan=-.3+.07*j)
for m in (48,52,55,60,64,67,72): place(music,marimba(m,2.4,1.0),24.0,.22)
place(music,kick(),24.0,.5)
music=lp(music.T,10000).T; music=reverb(music,1.4,.16,5000)
t_all=np.arange(N)/SR
g=np.ones(N); g*=np.clip(1-(t_all-(DUR-1.6))/1.6,0,1)
# duck music during the graveyard-to-app tape stop gap
g*=np.where((t_all>14.15)&(t_all<14.4),np.clip(1-(t_all-14.15)/.05,0,1),1)
music*=g[:,None]
tape=np.zeros((N,2)); place(tape,sweep(500,40,.3,.12)*.5,14.1,.6); sfx=sfx+tape
def write(name,x,peak=.89): x=x/max(1e-9,np.max(np.abs(x)))*peak; wavfile.write(name,SR,(x*32767).astype(np.int16))
write('sfx2.wav',sfx); write('music2.wav',music); write('mix2.wav',sfx+music*.5)
print('ok')
