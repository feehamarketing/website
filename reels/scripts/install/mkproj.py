import json,shutil,os,sys
for name in sys.argv[1:]:
    kind,lang=name.split('-'); d=f"proj-{name}"; os.makedirs(d,exist_ok=True)
    for f in os.listdir('src3d'): shutil.copy(f'src3d/{f}', d)
    tl=json.load(open(f'{name}/timeline.json')); tl.update(kind=kind,lang=lang)
    open(f'{d}/times.js','w').write('export const T = '+json.dumps(tl)+';\n')
