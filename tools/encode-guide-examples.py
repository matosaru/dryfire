"""Encode screenshots exported from the working guide (requires Python Pillow)."""
from pathlib import Path
from PIL import Image
import json,hashlib,sys
source=Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/dryfire-guide-frames')
out=Path(sys.argv[2] if len(sys.argv)>2 else 'docs/design/screens/practice-guide/examples')
out.mkdir(parents=True,exist_ok=True)
manifest=json.loads((source/'frames.json').read_text())
for record in manifest['exports']:
    paths=sorted((source/record['name']).glob('*.png'))
    assert len(paths)==record['frames']
    frames=[Image.open(p).convert('RGB') for p in paths]
    size=(max(f.width for f in frames), max(f.height for f in frames))
    normalized=[]
    for frame in frames:
        canvas=Image.new('RGB',size,'#0d151b');canvas.paste(frame,(0,0));normalized.append(canvas.quantize(colors=128))
    path=out/(record['name']+'.gif')
    # No infinite loop: the exported example stops at Review, like the app.
    normalized[0].save(path,save_all=True,append_images=normalized[1:],duration=record['frameMs'],optimize=True,disposal=2)
    record.update({'file':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'width':size[0],'height':size[1]})
    print(path.name,path.stat().st_size)
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
