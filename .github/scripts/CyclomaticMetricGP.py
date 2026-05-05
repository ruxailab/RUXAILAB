import os
import re
import sys
import ast
import json

# ── JavaScript / TypeScript support ──────────────────────────────────────────
JS_EXTENSIONS = {'.js', '.ts', '.mjs', '.tsx', '.jsx', '.cjs'}

# Regex patterns that each add 1 to cyclomatic complexity in JS/TS
_JS_DECISION_PATTERNS = [
    re.compile(r'\bif\s*\('),
    re.compile(r'\belse\s+if\s*\('),
    re.compile(r'\bfor\s*\('),
    re.compile(r'\bwhile\s*\('),
    re.compile(r'\bdo\s*\{'),
    re.compile(r'\bcase\b'),
    re.compile(r'\bcatch\s*\('),
    re.compile(r'&&'),
    re.compile(r'\|\|'),
    re.compile(r'\?(?![?.:])'),   # ternary — excludes ?. and ??
]


def _strip_js_noise(source: str) -> str:
    """Remove JS/TS comments and string literals to avoid false positives."""
    source = re.sub(r'//[^\n]*', '', source)
    source = re.sub(r'/\*.*?\*/', '', source, flags=re.DOTALL)
    source = re.sub(r'`[^`\\]*(?:\\.[^`\\]*)*`', '``', source, flags=re.DOTALL)
    source = re.sub(r'"(?:[^"\\]|\\.)*"', '""', source)
    source = re.sub(r"'(?:[^'\\]|\\.)*'", "''", source)
    return source


def calcular_js(codigo_fuente: str) -> int:
    """Regex-based cyclomatic complexity estimator for JavaScript / TypeScript."""
    source = _strip_js_noise(codigo_fuente)
    complejidad = 1
    for pattern in _JS_DECISION_PATTERNS:
        complejidad += len(pattern.findall(source))
    return complejidad
# ─────────────────────────────────────────────────────────────────────────────

class AnalizadorComplejidad(ast.NodeVisitor):
    def __init__(self):
        self.complejidad = 1

    def visit_If(self, node):
        self.complejidad += 1
        self.generic_visit(node)

    def visit_For(self, node):
        self.complejidad += 1
        self.generic_visit(node)

    def visit_While(self, node):
        self.complejidad += 1
        self.generic_visit(node)

    def visit_BoolOp(self, node):
        self.complejidad += len(node.values) - 1
        self.generic_visit(node)

    def visit_ExceptHandler(self, node):
        self.complejidad += 1
        self.generic_visit(node)

    def visit_match_case(self, node):
        self.complejidad += 1
        self.generic_visit(node)

    def visit_ListComp(self, node):
        self.complejidad += 1
        self.generic_visit(node)
        
    def visit_DictComp(self, node):
        self.complejidad += 1
        self.generic_visit(node)

    def visit_SetComp(self, node):
        self.complejidad += 1
        self.generic_visit(node)

    def visit_GeneratorExp(self, node):
        self.complejidad += 1
        self.generic_visit(node)

def calcular(codigo_fuente: str, extension: str = '.py') -> int:
    """Dispatch to the correct complexity calculator based on file extension."""
    if extension in JS_EXTENSIONS:
        return calcular_js(codigo_fuente)
    # Python AST path
    try:
        arbol = ast.parse(codigo_fuente)
    except SyntaxError:
        return 0

    visitante = AnalizadorComplejidad()
    visitante.visit(arbol)
    return visitante.complejidad

DIRECTORIOS_IGNORADOS = {'venv', 'env', '.venv', 'migrations', '__pycache__', '.git', 'tests',
                         'node_modules', 'dist', 'build', '.next', 'coverage'}
ARCHIVOS_IGNORADOS = {'manage.py', 'settings.py', 'wsgi.py', 'asgi.py'}
EXTENSIONES_VALIDAS = {'.py'} | JS_EXTENSIONS


def es_archivo_valido(ruta):
    nombre = os.path.basename(ruta)
    ext = os.path.splitext(nombre)[1]

    if nombre in ARCHIVOS_IGNORADOS:
        return False
    if ext not in EXTENSIONES_VALIDAS:
        return False

    partes_ruta = ruta.split(os.sep)
    for ignorado in DIRECTORIOS_IGNORADOS:
        if ignorado in partes_ruta:
            return False

    return True

def analizar_archivos(rutas_archivos: list, limite_complejidad: int = 15):
    resultados_array = []
    archivos_procesados = 0
    archivos_fallidos = 0
    
    for ruta in rutas_archivos:
        if not os.path.exists(ruta):
            continue 
            
        if not es_archivo_valido(ruta):
            continue
            
        with open(ruta, 'r', encoding='utf-8') as f:
            contenido = f.read()

        ext = os.path.splitext(ruta)[1]
        complejidad = calcular(contenido, ext)
        archivos_procesados += 1
        
        # Asignar el status_code que solicitaste
        if complejidad > limite_complejidad:
            status_code = "DANGER"
            archivos_fallidos += 1
        elif complejidad >= limite_complejidad - 5:
            status_code = "WARN"
        else:
            status_code = "OK"
            
        resultados_array.append({
            "file": ruta,
            "complexity": complejidad,
            "status_code": status_code
        })
    
    # Construcción del diccionario final con la estructura requerida
    salida_json = {
        "analysis_type": "Cyclomatic Complexity",
        "threshold": limite_complejidad,
        "summary": {
            "total_files": archivos_procesados,
            "failed_files": archivos_fallidos
        },
        "results": resultados_array
    }
    
    # Imprimir el JSON formateado con indentación
    print(json.dumps(salida_json, indent=4))
    sys.exit(0)

if __name__ == "__main__":
    archivos_a_analizar = sys.argv[1:]
    limite = 15
    
    if not archivos_a_analizar:
        # Estructura vacía consistente si no hay archivos
        salida_vacia = {
            "analysis_type": "Cyclomatic Complexity",
            "threshold": limite,
            "summary": {
                "total_files": 0,
                "failed_files": 0
            },
            "results": []
        }
        print(json.dumps(salida_vacia, indent=4))
        sys.exit(0)
        
    analizar_archivos(archivos_a_analizar, limite)
