import json
import numpy as np
import pandas as pd
import requests
import logging

from firebase_functions import https_fn, options
from firebase_admin import db, initialize_app

# Initialize Firebase app safely
try:
    initialize_app()
except ValueError:
    pass  # Already initialized


def calculate_eigen(matrix):
    eigenvalues, eigenvectors = np.linalg.eig(matrix)
    max_eigenvalue = np.max(eigenvalues)
    max_eigenvector = eigenvectors[:, np.argmax(eigenvalues)]

    # Normalize the eigenvector to get the weights
    normalized_weights = max_eigenvector / np.sum(max_eigenvector)

    # Calculate the Consistency Index (CI)
    n = matrix.shape[0]
    CI = (max_eigenvalue - n) / (n - 1)

    # Random Consistency Index (RI)
    RI_dict = {
        1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45,
        10: 1.49, 11: 1.52, 12: 1.54, 13: 1.56, 14: 1.58, 15: 1.59, 16: 1.60,
        17: 1.61, 18: 1.62, 19: 1.63, 20: 1.64, 21: 1.65, 22: 1.66, 23: 1.67,
        24: 1.68, 25: 1.69, 26: 1.70, 27: 1.71, 28: 1.72, 29: 1.73, 30: 1.74
    }
    RI = RI_dict.get(n, 1.49)  # fallback

    CR = CI / RI
    interpretation = "Consistent because CR is lower than 0.1" if CR <= 0.1 else "Inconsistent because CR is greater than 0.1"

    return max_eigenvalue, normalized_weights.real, CR, interpretation


def initialize_ahp_matrix(df, column_name):
    categories = df[column_name].tolist()
    n = len(categories)

    # Initialize with 1s on the diagonal
    ahp_matrix = np.ones((n, n))
    ahp_df = pd.DataFrame(ahp_matrix, index=categories, columns=categories)
    return ahp_df


def generate_saaty_scale_with_explanations():
    return {
        'Equal Importance': 1,
        'Moderate Importance': 2,
        'Strong Importance': 3,
        'Very Strong Importance': 4,
        'Extreme Importance': 5,
        'Moderately Less Important': 6,
        'Strongly Less Important': 7,
        'Very Strongly Less Important': 8,
        'Extremely Less Important': 9
    }


def fill_ahp_matrix(ahp_df, row_name, col_names, comparison):
    saaty_scale = generate_saaty_scale_with_explanations()
    value = saaty_scale.get(comparison)

    if value:
        for col_name in col_names:
            ahp_df.loc[row_name, col_name] = value
            ahp_df.loc[col_name, row_name] = 1 / value
    else:
        logging.warning("Invalid comparison description: %s", comparison)
    return ahp_df


def populate_ahp_matrix(ahp_df, pesos):
    saaty_scale_dict = {i+1: option for i, option in enumerate(generate_saaty_scale_with_explanations().keys())}
    peso_index = 0

    for row in ahp_df.index:
        criteria_dict = {i+1: col for i, col in enumerate(ahp_df.columns)
                         if col != row and ahp_df.loc[row, col] == 1.0}

        temp_criteria_dict = criteria_dict.copy()

        while temp_criteria_dict and peso_index < len(pesos):
            saaty_selection = pesos[peso_index]
            selected_comparison = saaty_scale_dict.get(saaty_selection, 'Equal Importance')

            relevant_col = temp_criteria_dict.pop(next(iter(temp_criteria_dict)))
            ahp_df = fill_ahp_matrix(ahp_df, row, [relevant_col], selected_comparison)

            if selected_comparison == 'Equal Importance':
                ahp_df.loc[relevant_col, row] = 1
                ahp_df.loc[row, relevant_col] = 1

            peso_index += 1

    return ahp_df


common_headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
}


@https_fn.on_request()
def weight_calculate(req):
    if req.method == 'OPTIONS':
        headers = {
            **common_headers,
            'Access-Control-Allow-Methods': 'GET, POST',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    req_data = req.get_json()
    caminho_structure = req_data.get("caminhoTestStructure", [])
    caminho_testWeights = req_data.get("caminhoTestWeights", {})
    caminho_scorepercentageOBJ = req_data.get("caminhoTestScore", [])

    heuristicas = [item["title"] for item in caminho_structure]

    # Flatten the weights input
    pesos = [numero for valor in caminho_testWeights.values() for numero in valor]

    # Create initial matrix
    df = pd.DataFrame({'Categories': heuristicas})
    ahp_df = initialize_ahp_matrix(df, 'Categories')
    ahp_df = populate_ahp_matrix(ahp_df, pesos)

    max_eigenvalue, normalized_weights, CR, consistency_interpretation = calculate_eigen(ahp_df)

    values_in_percentage = [value * 100 for value in normalized_weights]
    n_data = {header: [value] for header, value in zip(heuristicas, values_in_percentage)}
    df_normalized_weights = pd.DataFrame(n_data)

    caminho_scorepercentage = [float(valor) for valor in caminho_scorepercentageOBJ]

    data_heuristics_usability_score_weights = {
        'Heuristics': heuristicas,
        'Usability_Score': caminho_scorepercentage,
        'Weights': normalized_weights
    }

    df_heuristics = pd.DataFrame(data_heuristics_usability_score_weights)
    df_heuristics['Relative_Weight'] = df_heuristics['Usability_Score'] * df_heuristics['Weights']
    relative_weight_array = df_heuristics['Relative_Weight'].values

    usability_total = df_heuristics['Relative_Weight'].sum()

    response_data = {
        "usability_total": str(round(usability_total, 4)),
        "tabelacompleta": df_heuristics.to_json(),
        "relative": relative_weight_array.tolist(),
        "CR": round(CR, 4),
        "CR_interpretation": consistency_interpretation
    }

    headers = {
        **common_headers,
        'Content-Type': 'application/json',
    }

    return (
        json.dumps(response_data),
        200,
        headers
    )
