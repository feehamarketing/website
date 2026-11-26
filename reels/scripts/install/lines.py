import json,sys
W_FR=["Installer ton panneau Fi a au mur, parfaitement à niveau, même si t'es débutant. Voici le tuto.",
"Il te faut une perceuse, un niveau, un crayon, deux chevilles et deux vis.",
"D'abord, visse les attaches sur le haut du cadre, une de chaque côté, bien droites.",
"Fais un point au mur, perce, mets la cheville et visse en laissant dépasser la tête.",
"Accroche le cadre sur cette vis.",
"Mets-le à niveau, et trace le deuxième point dans l'autre attache.",
"Décroche le cadre, perce, mets la cheville et la vis.",
"Raccroche le cadre pour vérifier. Tout est beau ?",
"Décroche-le, et retourne les attaches à l'envers : elles passent derrière le cadre, invisibles.",
"Raccroche ton panneau. Il est à niveau, et on ne voit rien.",
"Fi a Panels, sur fi a panels point com."]
W_EN=["Mount your Feeha panel on a wall, perfectly level, even if you're a beginner. Here's the tutorial.",
"You'll need a drill, a level, a pencil, two wall anchors and two screws.",
"First, screw the brackets onto the top of the frame, one on each side, nice and straight.",
"Mark a point on the wall, drill, insert the anchor and drive the screw, leaving the head sticking out.",
"Hang the frame on that screw.",
"Level it, and mark the second point through the other bracket.",
"Take the frame down, drill, insert the anchor and the screw.",
"Hang the frame back up to check. All good?",
"Take it down and flip the brackets upside down: they go behind the frame, out of sight.",
"Hang your panel. It's level, and nothing shows.",
"Feeha Panels, at feeha panels dot com."]
C_FR=["Ta vitrine, c'est ta meilleure pub. Voici comment y suspendre ton panneau Fi a avec nos câbles d'acier. Super facile.",
"D'abord, visse les attaches dans les deux coins du haut du cadre.",
"Ensuite, mesure pour centrer ton panneau sur la vitrine et marque deux points sur le linteau.",
"Si c'est un cadre en aluminium, fixe le support du câble de gauche avec deux vis autoperceuses, puis celui de droite.",
"Si c'est du gypse ou du bois, c'est pareil : deux vis par câble. Perce deux trous, mets les deux chevilles, puis fixe le support avec deux vis adaptées.",
"Accroche les crochets des câbles aux attaches du cadre.",
"Pour monter le panneau, tire sur le câble.",
"Vérifie avec ton niveau que les deux côtés sont à la même hauteur.",
"Trop haut ? Appuie sur le piston en haut du câble, et il redescend.",
"Ton panneau flotte dans ta vitrine, visible de jour comme de nuit.",
"Fi a Panels, sur fi a panels point com."]
C_EN=["Your storefront window is your best ad. Here's how to hang your Feeha panel in it with our steel cables. Super easy.",
"First, screw the brackets into the two top corners of the frame.",
"Then measure to center your panel on the window and mark two points on the header.",
"If it's an aluminum frame, fix the left cable mount with two self-drilling screws, then the right one.",
"If it's drywall or wood, same thing: two screws per cable. Drill two holes, insert both anchors, then fix the mount with two matching screws.",
"Clip the cable hooks onto the frame brackets.",
"To raise the panel, pull the cable.",
"Check with your level that both sides are at the same height.",
"Too high? Press the button at the top of the cable and it slides back down.",
"Your panel floats in your window, visible day and night.",
"Feeha Panels, at feeha panels dot com."]
for name,L,lang in [("wall-fr",W_FR,"fr"),("wall-en",W_EN,"en"),("cable-fr",C_FR,"fr"),("cable-en",C_EN,"en")]:
    p=name[0]
    out=[{"id":f"{p}{i+1:02d}","text":t,"voice":"ff_siwis" if lang=="fr" else "am_michael","speed":1.1,"lang":"fr-fr" if lang=="fr" else "en-us"} for i,t in enumerate(L)]
    import os; os.makedirs(name,exist_ok=True)
    json.dump(out,open(f"{name}/lines.json","w"),ensure_ascii=False)
