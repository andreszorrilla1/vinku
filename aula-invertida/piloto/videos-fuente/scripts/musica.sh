#!/bin/bash
# Pad ambiental suave: Amaj7 <-> F#m7, con leve pulso. $1 = duración, $2 = salida
D=$1; OUT=$2
s(){ echo "(sin(2*PI*$1*t)+0.6*sin(2*PI*($1+0.6)*t))"; }
A="($(s 220)+$(s 277.18)+$(s 329.63)+0.7*$(s 415.30))"
B="($(s 185)+$(s 220)+$(s 277.18)+0.8*$(s 329.63))"
W="(0.5+0.5*cos(2*PI*t/16))"
EXPR="0.045*($W*$A+(1-$W)*$B)*(0.82+0.18*sin(2*PI*t*1.0))"
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc='$EXPR|$EXPR':s=44100:d=$D" \
  -af "lowpass=f=1400,aecho=0.8:0.6:180|360:0.25|0.15,afade=t=in:d=1.5,afade=t=out:st=$(echo "$D-2.2"|bc):d=2.2,volume=1.6" \
  -c:a aac -b:a 160k "$OUT"
