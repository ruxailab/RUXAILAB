import os
import pandas as pd
from datetime import datetime, timedelta
from github import Github
import matplotlib.pyplot as plt
import requests
from textwrap import wrap
from pathlib import Path


def fetch_issues(repo_owner, repo_name, github_token):
    url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/issues"
    headers = {'Authorization': f'token {github_token}'}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to fetch issues. Status code: {response.status_code}")
        print(response.text)
        return None
    else:
        issues = response.json()
        return issues


def generate_pareto_diagram(issues):
    labels_count = {}
    for issue in issues:
        for label in issue['labels']:
            label_name = label['name']
            labels_count[label_name] = labels_count.get(label_name, 0) + 1

    sorted_labels_count = dict(sorted(labels_count.items(), key=lambda item: item[1], reverse=True))

    labels = list(sorted_labels_count.keys())
    counts = list(sorted_labels_count.values())

    total_issues = sum(counts)
    cumulative_percentage = [sum(counts[:i + 1]) / total_issues * 100 for i in range(len(counts))]

    _, ax1 = plt.subplots()
    ax1.bar(labels, counts, color='b')
    ax1.set_xlabel('Labels', fontsize=12)
    ax1.set_ylabel('Frequency', color='b', fontsize=12)
    ax1.tick_params(axis='y', colors='b')

    ax2 = ax1.twinx()
    ax2.plot(labels, cumulative_percentage, color='r', marker='o')
    ax2.set_ylabel('Cumulative Percentage (%)', color='r', fontsize=12)
    ax2.tick_params(axis='y', colors='r')

    plt.title('Pareto Diagram of Issues by Labels - General Report', fontsize=14)
    plt.xticks(rotation=45, ha='right', fontsize=8)
    ax1.set_xticklabels(['\n'.join(wrap(label, 13)) for label in labels])
    plt.tight_layout()
    plt.savefig('./ishikawa_tools/output/pereto.pdf')


def generate_weekly_report(github_token, username, repository_name):
    # Crear una instancia de la clase Github
    g = Github(github_token)

    # Obtener el repositorio
    repo = g.get_repo(f"{username}/{repository_name}")

    # Obtener todas las issues del repositorio
    issues = repo.get_issues(state='all')

    # Diccionario para almacenar el recuento de issues por día de la semana
    weekly_counts = {
        'Monday': {'opened': 0, 'closed': 0},
        'Tuesday': {'opened': 0, 'closed': 0},
        'Wednesday': {'opened': 0, 'closed': 0},
        'Thursday': {'opened': 0, 'closed': 0},
        'Friday': {'opened': 0, 'closed': 0},
        'Saturday': {'opened': 0, 'closed': 0},
        'Sunday': {'opened': 0, 'closed': 0}
    }

    def get_day_of_week(date_str):
        date = datetime.strptime(date_str[:10], '%Y-%m-%d')
        return date.strftime('%A')

    current_date = datetime.now()
    one_week_ago = current_date - timedelta(days=7)

    for issue in issues:
        created_at = issue.created_at.replace(tzinfo=None)
        if created_at >= one_week_ago:
            day_of_week = get_day_of_week(str(created_at))
            weekly_counts[day_of_week]['opened'] += 1

        if issue.closed_at:
            closed_at = issue.closed_at.replace(tzinfo=None)
            if closed_at >= one_week_ago:
                day_of_week = get_day_of_week(str(closed_at))
                weekly_counts[day_of_week]['closed'] += 1

    # Extraer los datos para la tabla
    dias = list(weekly_counts.keys())
    abiertas = [weekly_counts[d]["opened"] for d in weekly_counts]
    cerradas = [weekly_counts[d]["closed"] for d in weekly_counts]

    data = {
        "Día de la Semana": dias,
        "Abiertas": abiertas,
        "Cerradas": cerradas
    }

    # Crear la tabla
    df = pd.DataFrame(data)

    # Crear figura y eje
    fig, ax = plt.subplots()

    # Eliminar marcas del eje
    ax.axis('off')

    # Crear tabla
    tabla = ax.table(cellText=df.values,
                     colLabels=df.columns,
                     cellLoc='center',
                     loc='center')

    # Ajustar tamaño de la fuente
    tabla.auto_set_font_size(False)
    tabla.set_fontsize(12)

    # Ajustar tamaño de la tabla
    tabla.scale(1.5, 1.5)
    plt.savefig('./ishikawa_tools/output/checklist.pdf')


def generate_histogram_report(repo_owner, repo_name, github_token):
    url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/issues"
    headers = {'Authorization': f'token {github_token}'}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to fetch issues. Status code: {response.status_code}")
        print(response.text)
        return None
    else:
        issues = response.json()

    labels_count = {
    }

    for issue in issues:
        for label in issue['labels']:
            label_name = label['name']
            if label_name in labels_count:
                labels_count[label_name] += 1
            else:
                labels_count[label_name] = 1

    plt.figure(figsize=(10, 6))
    plt.bar(labels_count.keys(), labels_count.values())
    plt.ylabel('Number of Issues')
    plt.title('Histogram of Issues by Label - General Report')
    plt.xticks(rotation=20)
    plt.yticks(range(0, max(labels_count.values()) + 1))
    plt.savefig('./ishikawa_tools/output/histogram.pdf')


def generate_scatter_diagram_report(repo_owner, repo_name, github_token):
    url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/issues"
    headers = {'Authorization': f'token {github_token}'}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to fetch issues. Status code: {response.status_code}")
        print(response.text)
        return None
    else:
        issues = response.json()

    days_to_close = []
    issue_created_dates = []

    for issue in issues:
        created_at = datetime.strptime(issue['created_at'], '%Y-%m-%dT%H:%M:%SZ')
        closed_at = datetime.strptime(issue['closed_at'], '%Y-%m-%dT%H:%M:%SZ') if issue[
            'closed_at'] else datetime.now()
        time_to_close = (closed_at - created_at).days
        days_to_close.append(time_to_close)
        issue_created_dates.append(created_at)

    plt.figure(figsize=(10, 6))
    plt.scatter(days_to_close, issue_created_dates, color='blue', alpha=0.7)
    plt.xlabel('Days for closing the issue')
    plt.ylabel('Date of creation of the issue')
    plt.title('Scatter Diagram of closed issues')
    plt.grid(True)
    plt.savefig('./ishikawa_tools/output/scatter.pdf')


def main():
    github_token = os.getenv('USER_TOKEN')
    username = os.getenv('USER')
    repository_name = os.getenv('PROJECT')

    issues = fetch_issues(username, repository_name, github_token)
    Path("./ishikawa_tools/output").mkdir(parents=True, exist_ok=True)

    generate_pareto_diagram(issues)
    generate_histogram_report(username, repository_name, github_token)
    generate_scatter_diagram_report(username, repository_name, github_token)
    generate_weekly_report(github_token, username, repository_name)


if __name__ == "__main__":
    main()
