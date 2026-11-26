import json
GAP=0.5; START=0.35; TAIL=0.6
MIN={'w':[3.8,3.6,3.6,2.8,5.0,2.9,5.6,4.0,4.4,3.4],'c':[6.6,3.6,4.6,6.0,4.8,3.4,3.2,3.2,4.6,3.8,3.4]}
for name in ["wall-fr","wall-en","cable-fr","cable-en"]:
    d=json.load(open(f"{name}/vo/dur.json")); ids=[x["id"] for x in json.load(open(f"{name}/lines.json"))]
    mins=MIN[name[0]]; t=START; lines={}; ld={}
    for k,i in enumerate(ids):
        lines[i]=round(t,3); ld[i]=round(d[i],3); t+=max(d[i]+GAP, mins[k])
    json.dump({"fps":30,"dur":round(t+TAIL,2),"lines":lines,"lineDur":ld},open(f"{name}/timeline.json","w"))
    print(name, round(t+TAIL,2))
