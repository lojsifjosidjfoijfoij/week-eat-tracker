"""Original sound design for the dinrr crayon TikTok. Everything synthesized here (no samples).
Arc: caveman stomps -> medieval lute -> lonely fridge hum -> tense group-chat build -> tape-stop -> happy marimba drop.
Writes sfx.wav, music.wav, mix.wav (48 kHz stereo)."""
import json, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; DUR=22.8; N=int(SR*DUR); rng=np.random.default_rng(11)
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

sfx=np.zeros((N,2)); ev=json.load(open('sfx.json'))
for e in ev:
    t,ty=e['t'],e['type']; i=e.get('i',0)
    if ty=='pop': place(sfx,sweep(300,note(PENT[i%8]+7) ,.14,.05)*.9+0,t,.9,pan=-.3+.1*i)
    elif ty=='boom': place(sfx,kick()*(.6 if e.get('small') else 1),t,.7)
    elif ty=='gulp':
        place(sfx,sweep(420,150,.12,.05),t,.7); place(sfx,sweep(380,120,.14,.06),t+.14,.7)
    elif ty=='gasp': place(sfx,bp(noise(.35),700,3200)*np.sin(np.pi*np.minimum(1,t_(.35)/.35))*.9,t,.45)
    elif ty=='thud': place(sfx,np.sin(2*np.pi*np.cumsum(70+60*np.exp(-t_(.25)/.03))/SR)*np.exp(-t_(.25)/.08),t,.85,pan=.6*(-1)**i)
    elif ty=='swish': place(sfx,whoosh(.25,True),t,.5)
    elif ty=='cheer':
        for k,m in enumerate([72,76,79,84]): place(sfx,bell(m,.4,.12)*.5,t+k*.07,.7)
    elif ty=='bubble': place(sfx,sweep(260+40*(i%3),480+60*(i%4),.09,.035),t,.4,pan=rng.uniform(-.4,.4))
    elif ty=='sad':
        place(sfx,marimba(67,.6,.3),t,.6); place(sfx,marimba(64,.8,.4),t+.28,.6)
    elif ty=='creak':
        d=.55; tt=t_(d); f=170+90*np.sin(np.pi*tt/d)+12*np.sin(2*np.pi*23*tt); s=bp(2*((np.cumsum(f)/SR)%1)-1,300,1800)*np.sin(np.pi*tt/d)
        place(sfx,s,t,.55)
    elif ty=='hum':
        d=11.4-t+.2; tt=t_(d); h=(np.sin(2*np.pi*100*tt)+.5*np.sin(2*np.pi*200*tt)+.2*np.sin(2*np.pi*300*tt))*(1+.1*np.sin(2*np.pi*3*tt))
        h*=np.minimum(1,tt/.6)*np.minimum(1,(d-tt)/.3); place(sfx,lp(h,600),t,.11)
    elif ty=='spider': place(sfx,sweep(1800,900,.7,.35,.01)*.5,t,.3)
    elif ty=='cricket':
        for k in range(3):
            tt=t_(.07); place(sfx,np.sin(2*np.pi*4300*tt)*(1+np.sin(2*np.pi*90*tt))/2*np.hanning(len(tt)),t+k*.1,.35)
    elif ty=='wah':
        for k,(f0,f1,d) in enumerate([(233,220,.3),(220,208,.3),(208,196,.3),(196,147,.9)]):
            place(sfx,saw_glide(f0,f1,d,vib=.03 if k==3 else 0),t+[0,.35,.7,1.05][k],.5)
    elif ty=='ding':
        base=[76,79,74,81,77,83][i%6]; place(sfx,bell(base,.07,.05)*.8,t,.55); place(sfx,bell(base+5,.55,.16),t+.065,.55,pan=-.4 if e.get('side') else .4)
    elif ty=='buzz':
        tt=t_(.6); place(sfx,lp(np.sign(np.sin(2*np.pi*150*tt))*(np.sin(2*np.pi*28*tt)>0),900)*np.minimum(1,(.6-tt)/.1),t,.4)
    elif ty=='qmark': place(sfx,sweep(500+60*i,800+90*i,.12,.05)*.7,t,.35,pan=-.6+.15*i)
    elif ty=='sting':
        place(sfx,kick()*1.1,t,.8)
        for m in (46,53,58,59): place(sfx,lp(2*((np.cumsum(np.full(int(SR*.6),note(m)))/SR)%1)-1,1500)*env(.6,.004,.25),t,.25)
    elif ty=='mpop': place(sfx,marimba(PENT[i]-12+12,.5,.2),t,.55,pan=-.5+i/7)
    elif ty=='tada':
        for k,m in enumerate([72,76,79,84,88]): place(sfx,bell(m+0,.9,.35),t+k*.045,.5)
    elif ty=='sparkles':
        for k in range(12): place(sfx,bell(int(rng.choice([88,91,93,96])),.3,.1)*.35,t+k*.07,.3,pan=rng.uniform(-.8,.8))
    elif ty=='whoosh': place(sfx,whoosh(.55,e.get('dir')!='down'),t,.6)
    elif ty=='logo':
        for k,m in enumerate([60,64,67,72,76]): place(sfx,bell(m+12,2.0,.8),t+k*.05,.35)
        place(sfx,kick(),t,.5)
sfx=reverb(sfx,1.0,.16)

music=np.zeros((N,2))
def bars(s0,s1): return np.arange(s0,s1,beat)
# S1: stomp + bongo + shaker, quirky pluck motif
for k,tb in enumerate(bars(0,4.2)):
    if k%4 in (0,2): place(music,kick(),tb,.55)
    if k%4 in (1,3): place(music,clap(),tb,.5)
    place(music,tom(180 if k%2 else 140),tb+beat*.5,.3,pan=.3)
    place(music,shaker(),tb+beat*.25,.15); place(music,shaker(),tb+beat*.75,.12)
for k,(m,o) in enumerate([(55,0),(58,1),(55,1.5),(53,2),(50,3),(53,3.5),(55,4),(58,5),(60,5.5),(58,6)]): place(music,pluck(m+12,.5),o*beat,.4,pan=-.2)
# S2: lute melody in D dorian, soft hand drum
mel=[(62,0),(65,1),(69,1.5),(67,2),(65,3),(62,4),(64,4.5),(65,5)]
for m,o in mel: place(music,pluck(m+12,.9),4.2+o*beat,.45,pan=.1)
for k,tb in enumerate(bars(4.2,7.8)):
    place(music,pluck(38 if k%2==0 else 45,.7),tb,.5)
    if k%2: place(music,tom(120),tb,.25)
# S3: bare. sparse sad plucks + pad
for m,o in [(57,0),(53,2.5),(52,4.5)]: place(music,pluck(m,1.6,.998),7.8+o*beat,.3,pan=-.2)
tt=t_(3.6); pad=(np.sin(2*np.pi*note(45)*tt)+.5*np.sin(2*np.pi*note(52)*tt))*np.sin(np.pi*tt/3.6)**2; place(music,lp(pad,500),7.8,.12)
# S4: tense ostinato building, snare roll, then tape-stop
for k,tb in enumerate(bars(11.4,15.6)):
    base=45+k//2
    for j in range(2):
        place(music,pluck(base+12+(7 if j else 0),.25,.99),tb+j*beat/2,.25+.03*k,pan=.2)
    place(music,hat(),tb,.15+.02*k); 
    if k%2==0: place(music,kick(),tb,.35)
nroll=int((15.6-14.7)/.075)
for k in range(nroll):
    tb=14.7+k*.075; place(music,bp(noise(.08),1500,6000)*env(.08,.001,.04),tb,.12+.25*k/nroll)
# S5: the drop, C - Am - F - G, 2.4 s per bar -> 3 bars + resolve
chords=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]]; roots=[36,33,29,31]
S5=15.6
place(music,kick()*1.2,S5,.8)
for b in range(3):
    t0=S5+b*4*beat; ci=b%4
    for k in range(4):
        tb=t0+k*beat
        if k in (0,2): place(music,kick(),tb,.55)
        if k in (1,3): place(music,clap(),tb,.55)
        place(music,hat(),tb+beat/2,.12,pan=.3)
        for h in range(4): place(music,shaker(),tb+h*beat/4,.1)
    for off,ln in [(0,.28),(.75,.2),(1.5,.28),(2.5,.2),(3,.28)]:
        place(music,lp(np.sin(2*np.pi*note(roots[ci])*t_(.4))*env(.4,.01,.2),300),t0+off*beat,.4)
    for j,m in enumerate(chords[ci]*3):
        place(music,marimba(m+12+ (12 if j>=6 else 0),.4,.14),t0+j*beat/2*0.9,.28,pan=-.3+.07*j)
    for k in range(2): 
        for m in chords[ci]: place(music,marimba(m,.8,.4),t0+k*2*beat,.12,pan=.2)
# ending chord
for m in (48,52,55,60,64,67,72): place(music,marimba(m,2.2,.9),S5+3*4*beat,.2)
place(music,kick(),S5+3*4*beat,.5)
music=lp(music.T,10000).T; music=reverb(music,1.4,.16,5000)
# tape-stop gap right before the drop: duck music 15.35..15.6
t_all=np.arange(N)/SR
g=np.ones(N); g*=np.clip(1-(t_all-(DUR-1.4))/1.4,0,1)
g*=np.where((t_all>15.38)&(t_all<15.6),np.clip(1-(t_all-15.38)/.06,0,1),1)
music*=g[:,None]
def write(name,x,peak=.89): x=x/max(1e-9,np.max(np.abs(x)))*peak; wavfile.write(name,SR,(x*32767).astype(np.int16))
tape=np.zeros((N,2)); place(tape,sweep(500,40,.3,.12)*.5,15.38,.6); sfx=sfx+tape
write('sfx.wav',sfx); write('music.wav',music); write('mix.wav',sfx+music*.5)
print('ok')
