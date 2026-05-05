import re
import os
import sys
import json
import textstat
from pathlib import Path

SUPPORTED_EXTENSIONS = {'.py', '.js', '.ts', '.cpp', '.java', '.html'}

def extract_comments(file_path):
    extension = os.path.splitext(file_path)[1]

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            code = f.read()
    except:
        return []

    if extension == '.py':
        pattern = r'#.*?$|""".*?"""|\'\'\'.*?\'\'\''
        flags = re.DOTALL | re.MULTILINE
    elif extension in ['.js', '.ts', '.cpp', '.java']:
        pattern = r'//.*?$|/\*.*?\*/'
        flags = re.DOTALL | re.MULTILINE
    elif extension == '.html':
        pattern = r'<!--.*?-->'
        flags = re.DOTALL
    else:
        return []

    comments = re.findall(pattern, code, flags)

    clean_comments = []
    for c in comments:
        c = re.sub(r'#|//|/\*|\*/|"""|\'\'\'|<!--|-->', '', c)
        c = re.sub(r'\s+', ' ', c).strip()

        # ignorar comentarios muy cortos
        if len(c.split()) >= 8:
            clean_comments.append(c)

    return clean_comments


def compute_fog(comments):
    scores = []

    for c in comments:
        try:
            score = textstat.gunning_fog(c)
            scores.append(score)
        except:
            continue

    if not scores:
        return None, None

    avg = sum(scores) / len(scores)
    return avg, max(scores)


def classify(score):
    if score is None:
        return "NO DATA"
    elif score < 12:
        return "OK"
    elif score <= 22:
        return "MODERATE"
    else:
        return "COMPLEX"


def scan(target_path):
    path = Path(target_path)

    files = (
        [path] if path.is_file()
        else [f for f in path.rglob('*') if f.suffix in SUPPORTED_EXTENSIONS]
    )

    results = []
    failed = 0

    for file in files:
        comments = extract_comments(file)
        avg, max_score = compute_fog(comments)

        status = classify(avg)
        if status.startswith("COMPLEX"):
            failed += 1

        results.append({
            "file": str(file),
            "avg_fog": round(avg, 1) if avg else None,
            "max_fog": round(max_score, 1) if max_score else None,
            "status_code": status
        })

    return results, len(files), failed


def print_json(results, total, failed):
    output = {
        "analysis_type": "Comment Readability (Fog Index)",
        "threshold": 22,
        "summary": {
            "total_files": total,
            "failed_files": failed
        },
        "results": results
    }

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fog.py <file_or_directory>")
        sys.exit(1)

    results, total, failed = scan(sys.argv[1])

    if not results:
        print("[]")
        sys.exit(0)

    print_json(results, total, failed)
