import importlib, traceback, sys, os

# ensure project root (backend) is on sys.path so 'app' package is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    m = importlib.import_module('app.schemas.ai')
    print('module loaded:', m)
    print('members:', [a for a in dir(m) if not a.startswith('_')])
except Exception:
    print('IMPORT ERROR')
    traceback.print_exc()
