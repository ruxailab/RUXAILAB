import ast
import re
import sys
import json
from pathlib import Path
from typing import Dict, Optional, List, Any

CRITICAL_THRESHOLD = 7
WARNING_THRESHOLD = 3

# ── JavaScript / TypeScript support ──────────────────────────────────────────
JS_EXTENSIONS = {'.js', '.ts', '.mjs', '.tsx', '.jsx', '.cjs'}
JS_CONTROL_RE = re.compile(r'\b(if|else\s+if|for|while|switch|do)\b')


def _strip_js_noise(source: str) -> str:
    """Remove JS/TS comments and string literals to avoid false positives."""
    source = re.sub(r'//[^\n]*', '', source)
    source = re.sub(r'/\*.*?\*/', '', source, flags=re.DOTALL)
    source = re.sub(r'`[^`\\]*(?:\\.[^`\\]*)*`', '``', source, flags=re.DOTALL)
    source = re.sub(r'"(?:[^"\\]|\\.)*"', '""', source)
    source = re.sub(r"'(?:[^'\\]|\\.)*'", "''", source)
    return source


def get_metrics_js(filepath: Path) -> Optional[Dict[str, Any]]:
    """Brace-tracking nesting depth estimator for JavaScript / TypeScript."""
    try:
        content = filepath.read_text(encoding="utf-8").strip()
        if not content:
            return None
    except OSError as e:
        print(f"Error reading {filepath}: {e}")
        return None

    content = _strip_js_noise(content)
    depths: List[int] = []
    brace_depth = 0

    for line in content.split('\n'):
        has_control = bool(JS_CONTROL_RE.search(line))
        for ch in line:
            if ch == '{':
                brace_depth += 1
                if has_control:
                    depths.append(brace_depth)
                    has_control = False  # record once per statement
            elif ch == '}':
                brace_depth = max(0, brace_depth - 1)
        # braceless single-line if/for (no `{` on this line)
        if has_control and '{' not in line:
            depths.append(brace_depth + 1)

    if not depths:
        return {"avg": 0.0, "max": 0, "status_code": "\u2705 OK"}

    max_d = max(depths)
    avg_d = round(sum(depths) / len(depths), 1)
    return {"avg": avg_d, "max": max_d, "status_code": get_status_code(max_d)}
# ─────────────────────────────────────────────────────────────────────────────


class NestingVisitor(ast.NodeVisitor):
    def __init__(self) -> None:
        self.depths: List[int] = []
        self.current_depth: int = 0

    def visit_If(self, node: ast.If) -> None:
        self.current_depth += 1
        self.depths.append(self.current_depth)

        for item in node.body:
            self.visit(item)

        if len(node.orelse) == 1 and isinstance(node.orelse[0], ast.If):
            self.current_depth -= 1
            self.visit(node.orelse[0])
            self.current_depth += 1
        else:
            for item in node.orelse:
                self.visit(item)

        self.current_depth -= 1


def get_status_code(max_depth: int) -> str:
    if max_depth > CRITICAL_THRESHOLD:
        return "❌ CRITICAL"
    if max_depth >= WARNING_THRESHOLD:
        return "🚨 WARNING"
    return "✅ OK"


def get_metrics(filepath: Path) -> Optional[Dict[str, Any]]:
    try:
        content = filepath.read_text(encoding="utf-8").strip()
        if not content:
            return None
        tree = ast.parse(content)
    except (SyntaxError, OSError) as e:
        print(f"Error processing {filepath}: {e}")
        return None

    visitor = NestingVisitor()
    visitor.visit(tree)

    if not visitor.depths:
        return {"avg": 0.0, "max": 0, "status_code": "✅ OK"}

    max_d = max(visitor.depths)
    avg_d = round(sum(visitor.depths) / len(visitor.depths), 1)

    return {
        "avg": avg_d,
        "max": max_d,
        "status_code": get_status_code(max_d)
    }


def main() -> None:
    all_args = sys.argv[1:]
    py_files = [Path(f) for f in all_args if f.endswith('.py')]
    js_files = [Path(f) for f in all_args
                if Path(f).suffix in JS_EXTENSIONS]
    files_to_analyze = py_files + js_files

    if not files_to_analyze:
        print("No Python or JavaScript/TypeScript files to analyze.")
        sys.exit(0)

    all_results: List[Dict[str, Any]] = []
    failed_count = 0

    for filepath in files_to_analyze:
        if not filepath.exists():
            continue

        if filepath.suffix in JS_EXTENSIONS:
            metrics = get_metrics_js(filepath)
        else:
            metrics = get_metrics(filepath)

        if metrics:
            all_results.append({
                "file": str(filepath),
                "avg_depth": metrics["avg"],
                "max_depth": metrics["max"],
                "status_code": metrics["status_code"]
            })
            if metrics["max"] > CRITICAL_THRESHOLD:
                failed_count += 1

    json_data = {
        "analysis_type": "Depth of Conditional Nesting",
        "threshold": CRITICAL_THRESHOLD,
        "summary": {
            "total_files": len(all_results),
            "failed_files": failed_count
        },
        "results": all_results
    }

    output_file = Path("nesting_metrics.json")
    output_file.write_text(json.dumps(json_data, indent=4, ensure_ascii=False), encoding="utf-8")

    print(f"Analysis report saved to {output_file}")

    if failed_count > 0:
        print(f"FAIL: {failed_count} files exceed the nesting threshold.")
        sys.exit(1)
    else:
        print("SUCCESS: All files are within the nesting threshold.")
        sys.exit(0)


if __name__ == "__main__":
    main()
