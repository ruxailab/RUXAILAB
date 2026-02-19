"""AHP (Analytic Hierarchy Process) Weight Calculation Service.

This module implements the Analytic Hierarchy Process (AHP) algorithm for calculating
weights and priorities based on pairwise comparisons. AHP is a structured technique for
organizing and analyzing complex decisions, based on mathematics and psychology.

The main algorithm:
1. Creates a pairwise comparison matrix using Saaty's scale (1-9)
2. Calculates eigenvalues and eigenvectors to determine weights
3. Validates consistency of judgments using Consistency Ratio (CR)
4. Computes final usability scores based on weighted heuristics

References:
- Saaty, T.L. (1980). The Analytic Hierarchy Process. McGraw-Hill.
- Consistency Ratio < 0.1 is considered acceptable for decision-making.
"""

import json
from firebase_functions import https_fn, options
from firebase_admin import db, initialize_app
import numpy as np
import pandas as pd
import requests


initialize_app()


def calculate_eigen(matrix):
    """Calculate eigenvalues and consistency metrics for AHP matrix.
    
    This function implements the core AHP mathematical calculations:
    1. Computes the principal eigenvalue and eigenvector
    2. Normalizes the eigenvector to obtain priority weights
    3. Calculates Consistency Index (CI) and Consistency Ratio (CR)
    
    Args:
        matrix (numpy.ndarray): Square pairwise comparison matrix where each element
                               a_ij represents how much more important criterion i is
                               compared to criterion j.
    
    Returns:
        tuple: A tuple containing:
            - max_eigenvalue (float): The principal (largest) eigenvalue (λ_max)
            - normalized_weights (numpy.ndarray): Priority weights derived from eigenvector
            - CR (float): Consistency Ratio (should be < 0.1 for acceptable consistency)
            - consistency_interpretation (str): Human-readable consistency assessment
    
    Mathematical Background:
        - λ_max is always >= n (matrix dimension)
        - CI = (λ_max - n) / (n - 1)
        - CR = CI / RI, where RI is Random Index based on matrix size
        - CR < 0.1 indicates acceptable consistency in judgments
    """
    # Compute eigenvalues and eigenvectors of the comparison matrix
    eigenvalues, eigenvectors = np.linalg.eig(matrix)
    
    # Find the maximum eigenvalue (λ_max) and its corresponding eigenvector
    max_eigenvalue = np.max(eigenvalues)
    max_eigenvector = eigenvectors[:, np.argmax(eigenvalues)]

    # Normalize the eigenvector to get the priority weights (sum = 1)
    # These weights represent the relative importance of each criterion
    normalized_weights = max_eigenvector / np.sum(max_eigenvector)

    # Calculate the Consistency Index (CI)
    # CI measures how far λ_max deviates from n (perfect consistency)
    n = matrix.shape[0]  # Number of criteria being compared
    CI = (max_eigenvalue - n) / (n - 1)

    # Random Consistency Index (RI) - empirically determined values by Saaty
    # RI represents the average CI of randomly generated pairwise comparison matrices
    # These values are used as benchmarks to assess consistency
    RI_dict = {1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45,
           10: 1.49, 11: 1.52, 12: 1.54, 13: 1.56, 14: 1.58, 15: 1.59, 16: 1.60, 17: 1.61,
           18: 1.62, 19: 1.63, 20: 1.64, 21: 1.65, 22: 1.66, 23: 1.67, 24: 1.68, 25: 1.69,
           26: 1.70, 27: 1.71, 28: 1.72, 29: 1.73, 30: 1.74}
    RI = RI_dict.get(n, 1.49)  # Use 1.49 as fallback for matrices larger than 30×30

    # Calculate the Consistency Ratio (CR = CI / RI)
    # CR < 0.1 indicates acceptable consistency in pairwise comparisons
    # CR >= 0.1 suggests judgments should be reviewed and potentially revised
    # Handle division by zero for small matrices (n <= 2) where RI is 0
    if RI == 0:
        CR = 0.0  # Matrices of size 1 or 2 are always consistent
    else:
        CR = CI / RI

    # Provide human-readable interpretation of consistency
    consistency_interpretation = (
        "Consistent because CR is lower than 0.1" if CR <= 0.1 
        else "Inconsistent because CR is greater than 0.1"
    )

    return max_eigenvalue, normalized_weights.real, CR, consistency_interpretation

def initialize_ahp_matrix(df, column_name):
    """Initialize an empty AHP pairwise comparison matrix.
    
    Creates a square matrix where rows and columns represent the criteria to be compared.
    The matrix will be filled later with pairwise comparison values.
    
    Args:
        df (pandas.DataFrame): DataFrame containing the criteria/categories
        column_name (str): Name of the column containing category labels
    
    Returns:
        pandas.DataFrame: An n×n matrix initialized with zeros, where n is the number
                         of categories. Both rows and columns are labeled with category names.
    
    Example:
        For categories ['Usability', 'Design', 'Performance'], creates:
                      Usability  Design  Performance
        Usability           0       0           0
        Design              0       0           0
        Performance         0       0           0
    """
    categories = df[column_name].tolist()
    n = len(categories)

    # Initialize a zero matrix of dimensions n × n
    ahp_matrix = np.zeros((n, n))

    # Create a labeled DataFrame to hold the AHP comparison matrix
    # Labels make it easier to understand which criteria are being compared
    ahp_df = pd.DataFrame(ahp_matrix, index=categories, columns=categories)

    return ahp_df

def generate_saaty_scale_with_explanations():
    """Generate Saaty's fundamental scale for pairwise comparisons.
    
    Saaty's scale is the standard scale used in AHP for expressing how much more important
    one criterion is compared to another. The scale ranges from 1 (equal importance) to 9
    (extreme importance).
    
    Returns:
        dict: Mapping of verbal judgments to numerical values (1-9)
    
    Scale Interpretation:
        1 - Equal Importance: Two criteria contribute equally
        2 - Moderate Importance: Slight favor of one over another
        3 - Strong Importance: Strong favor of one over another
        4 - Very Strong Importance: Very strong favor
        5 - Extreme Importance: Highest possible favor
        6-9 - Inverse comparisons: Used when the second criterion is more important
    
    Note:
        In standard AHP, reciprocals (1/2, 1/3, etc.) are used for inverse comparisons.
        This implementation uses integers 6-9 which are converted to reciprocals elsewhere.
    """
    return {
        'Equal Importance': 1,               # Both criteria are equally important
        'Moderate Importance': 2,            # One criterion is slightly more important
        'Strong Importance': 3,              # One criterion is strongly more important
        'Very Strong Importance': 4,         # Very strong dominance of one criterion
        'Extreme Importance': 5,             # Extreme dominance of one criterion
        'Moderately Less Important': 6,      # Inverse: second criterion moderately more important
        'Strongly Less Important': 7,        # Inverse: second criterion strongly more important
        'Very Strongly Less Important': 8,   # Inverse: second criterion very strongly more important
        'Extremely Less Important': 9        # Inverse: second criterion extremely more important
    }

def fill_ahp_matrix(ahp_df, row_name, col_names, comparison):
    """Fill the AHP matrix with pairwise comparison values.
    
    Updates the comparison matrix with a judgment value and its reciprocal.
    AHP matrices must be reciprocal: if a_ij = x, then a_ji = 1/x.
    
    Args:
        ahp_df (pandas.DataFrame): The AHP comparison matrix to update
        row_name (str): The criterion in the row (being compared from)
        col_names (list): List of criteria in columns (being compared to)
        comparison (str): Verbal judgment from Saaty's scale
    
    Returns:
        pandas.DataFrame: Updated AHP matrix with comparison values
    
    Example:
        If 'Usability' has 'Strong Importance' (3) over 'Performance':
        - ahp_df['Usability']['Performance'] = 3
        - ahp_df['Performance']['Usability'] = 1/3 (reciprocal)
    """
    saaty_scale = generate_saaty_scale_with_explanations()
    if comparison in saaty_scale:
        value = saaty_scale[comparison]
        # Fill matrix with comparison value and its reciprocal
        for col_name in col_names:
            ahp_df.loc[row_name, col_name] = value  # Direct comparison
            ahp_df.loc[col_name, row_name] = 1 / value  # Reciprocal for symmetry
    else:
        print("Invalid comparison description. Please select one from Saaty's scale.")
    return ahp_df

def populate_ahp_matrix(ahp_df, pesos):
    """Populate the entire AHP matrix using a list of comparison judgments.
    
    This function iterates through all criteria and fills the comparison matrix based on
    provided pairwise judgments. It handles the complexity of making n(n-1)/2 comparisons
    for n criteria while maintaining reciprocity and transitivity.
    
    Args:
        ahp_df (pandas.DataFrame): Initialized (empty) AHP comparison matrix
        pesos (list): List of numerical judgments (1-9) corresponding to Saaty's scale.
                     Each value represents a pairwise comparison in sequence.
    
    Returns:
        pandas.DataFrame: Fully populated AHP matrix with all pairwise comparisons
    
    Algorithm:
        1. For each criterion (row), compare it against remaining criteria
        2. Apply the judgment value from 'pesos' list sequentially
        3. Handle transitive relations for equal importance (if A=B and A=C, then B=C)
        4. Set diagonal elements to 1 (each criterion equals itself)
    
    Note:
        'pesos' is Portuguese for 'weights' - it contains the input judgments,
        not the final calculated weights.
    """
    # Create mapping from indices (1-9) to Saaty scale descriptions
    saaty_scale_dict = {i+1: option for i, option in enumerate(generate_saaty_scale_with_explanations().keys())}

    peso_index = 0  # Tracks current position in the pesos (judgments) list

    # Iterate through each criterion (row) to make pairwise comparisons
    for row in ahp_df.index:
        # Create a copy of the Saaty scale for this row
        temp_saaty_scale_dict = saaty_scale_dict.copy()

        # Identify criteria that haven't been compared yet (exclude self and already-filled cells)
        criteria_dict = {i+1: col for i, col in enumerate(ahp_df.columns) if col != row and ahp_df.loc[row, col].all() == 0}

        # Working copy of remaining criteria to compare
        temp_criteria_dict = criteria_dict.copy()

        # Process comparisons for this row if there are remaining judgments
        if(peso_index < len(pesos)):
          saaty_selection = pesos[peso_index]
          selected_comparison = temp_saaty_scale_dict[saaty_selection]

          # Compare current criterion with each remaining criterion
          while temp_criteria_dict:
              # Get the next judgment from the pesos list
              saaty_selection = pesos[peso_index]
              selected_comparison = temp_saaty_scale_dict[saaty_selection]
              
              # Select the next criterion to compare against
              relevant_cols = [temp_criteria_dict[list(temp_criteria_dict.keys())[0]]]

              # Fill the matrix with this pairwise comparison
              ahp_df = fill_ahp_matrix(ahp_df, row, relevant_cols, selected_comparison)

              # Handle transitive relations for equal importance
              # If criterion A equals B, and A equals C, then B must equal C
              if selected_comparison == 'Equal Importance':
                  for i in range(len(relevant_cols)):
                      for j in range(i+1, len(relevant_cols)):
                          ahp_df.loc[relevant_cols[i], relevant_cols[j]] = 1
                          ahp_df.loc[relevant_cols[j], relevant_cols[i]] = 1

              # Remove compared criterion from the remaining list
              temp_criteria_dict = {num: col for num, col in temp_criteria_dict.items() if col not in relevant_cols}
              peso_index += 1
              
    # Set diagonal elements to 1 (each criterion has equal importance with itself)
    np.fill_diagonal(ahp_df.values, 1)

    return ahp_df

common_headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
}

@https_fn.on_request()
def weight_calculate(req):
    """Firebase Cloud Function to calculate usability weights using AHP.
    
    This is the main entry point for the weight calculation service. It receives
    heuristic evaluation data, applies the AHP algorithm to calculate priority weights,
    and returns a final weighted usability score.
    
    Workflow:
        1. Receive heuristic criteria and pairwise comparison judgments
        2. Build AHP pairwise comparison matrix
        3. Calculate eigenvalues and priority weights
        4. Validate consistency of judgments (CR < 0.1)
        5. Apply weights to usability scores
        6. Compute final weighted usability score
    
    Args:
        req (flask.Request): HTTP request containing:
            - caminhoTestStructure: List of heuristic criteria with titles
            - caminhoTestWeights: Dictionary of pairwise comparison judgments (1-9)
            - caminhoTestScore: Usability scores for each heuristic (0-100)
    
    Returns:
        tuple: (JSON response, status code, headers) containing:
            - usability_total: Final weighted usability score
            - tabelacompleta: Complete table with scores, weights, and relative weights
            - relative: Array of relative weight values
    
    HTTP Methods:
        - OPTIONS: Handles CORS preflight requests
        - POST: Processes weight calculation requests
    
    Example Request Body:
        {
            "caminhoTestStructure": [{"title": "Visibility"}, {"title": "Consistency"}],
            "caminhoTestWeights": {"comparisons": [3, 1, 2]},
            "caminhoTestScore": [85.5, 92.3]
        }
    """
    print(req.method)
    # Handle CORS preflight requests
    if req.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            **common_headers,
            'Access-Control-Allow-Methods': 'GET, POST',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)
    

    # Parse incoming request data
    req_data = req.get_json()
    # caminho = Portuguese for 'path' - these variables contain the input data paths/structures
    caminho_structure = req_data.get("caminhoTestStructure")  # Heuristic criteria definitions
    caminho_testWeights = req_data.get("caminhoTestWeights")  # Pairwise comparison judgments
    caminho_scorepercentageOBJ = req_data.get("caminhoTestScore")  # Usability scores per heuristic


    # Extract heuristic titles from the structure
    # heuristicas = list of heuristic evaluation criteria (e.g., Nielsen's 10 heuristics)
    heuristicas = []
    for item in caminho_structure:
        heuristicas.append(item["title"])

    # Generate comparison pairs for reference (not used in calculation but useful for debugging)
    # Creates pairs like "Visibility [Consistency]", "Visibility [Error Prevention]", etc.
    heuristica_compair = []
    for i in range(len(heuristicas)):
        current_title = heuristicas[i]
        for j in range(i + 1, len(heuristicas)):
            compared_title = heuristicas[j]
            heuristica_compair.append(f"{current_title} [{compared_title}]")


    # Extract pairwise comparison judgments into a flat list
    # pesos = list of numerical judgments (1-9) for each pairwise comparison
    pesos = []
    for valor in caminho_testWeights.values():
        for numero in valor:
            pesos.append(numero)  # Add each judgment value to the list
    
    # Prepare data structure for AHP matrix creation
    data = {'Categories': heuristicas}

    pesos_list = pesos  # List of pairwise comparison judgments

    # Build the AHP comparison matrix
    df = pd.DataFrame(data)
    ahp_df = initialize_ahp_matrix(df, 'Categories')  # Create empty n×n matrix
    ahp_df = populate_ahp_matrix(ahp_df, pesos_list)  # Fill with pairwise comparisons

    # Display the completed pairwise comparison matrix
    print('\n\nDECISION MATRIX:')
    print(ahp_df.to_markdown())
    
    # Calculate priority weights and consistency metrics
    max_eigenvalue, normalized_weights, CR, consistency_interpretation = calculate_eigen(ahp_df)
    print("\n\nMAX EIGENVALUE (λ_max) = ", max_eigenvalue)

    # Convert normalized weights to percentages for readability
    values_in_percentage = [value * 100 for value in normalized_weights]
    n_data = {header: [value] for header, value in zip(heuristicas, values_in_percentage)}
    df_normalized_weights = pd.DataFrame(n_data)
    print("\n\nNORMALIZED WEIGHTS (sum=1) = ", normalized_weights)
    print("\n\nWEIGHTS IN PERCENTAGE (sum=100%)\n", df_normalized_weights.to_markdown())

    # Display consistency validation results
    print("\n\nCONSISTENCY RATIO (CR) = ", CR)
    print("\n\nCONSISTENCY INTERPRETATION = ", consistency_interpretation)


    ################## Heuristics × Usability Score × Weights ##################
    # This section applies the calculated weights to the usability scores
    # Formula: Final Score = Σ(Usability_Score_i × Weight_i)
    
    # Convert usability scores to floats
    caminho_scorepercentage = [float(valor) for valor in caminho_scorepercentageOBJ]

    # Create a comprehensive table combining heuristics, scores, and weights
    data_heuristics_usability_score_weights = {
        'Heuristics': heuristicas,                      # Criterion names
        'Usability_Score': caminho_scorepercentage,     # Raw scores (0-100)
        'Weights': normalized_weights                    # AHP-derived weights (sum=1)
    }
    df_heuristics_usability_score_weights = pd.DataFrame(data_heuristics_usability_score_weights)

    # Configure pandas to display all columns
    pd.set_option('display.max_columns', None)

    # Display the combined table
    print("\n\nHeuristics × Usability Score × Weights \n\n", df_heuristics_usability_score_weights)

    # Calculate relative weights (weighted scores)
    # Relative_Weight_i = Usability_Score_i × Weight_i
    df_heuristics_usability_score_weights['Relative_Weight'] = (
        df_heuristics_usability_score_weights['Usability_Score'] * 
        df_heuristics_usability_score_weights['Weights']
    )
    print("\n\nHeuristics × Usability Score × Weights × Relative_Weight\n\n", 
          df_heuristics_usability_score_weights)
    
    # Extract relative weights as an array for response
    relative_weight_array = df_heuristics_usability_score_weights['Relative_Weight'].values
    print("\n\nRelative Weight values as array:", relative_weight_array)


    # Calculate final weighted usability score
    # This is the sum of all relative weights: Σ(Usability_Score_i × Weight_i)
    usability_total = df_heuristics_usability_score_weights.Relative_Weight.sum()
    print("\n\nFINAL WEIGHTED USABILITY SCORE:", usability_total)

    # Verify that weights sum to 1.0 (should always be true after normalization)
    print("\n\nWeight sum check (should be 1.0):", 
          df_heuristics_usability_score_weights.Weights.sum())


    # Prepare response data
    response_data = {
        "usability_total": usability_total.astype("str"),  # Final weighted usability score
        "tabelacompleta": df_heuristics_usability_score_weights.to_json(),  # Complete results table
        "relative": relative_weight_array.tolist()  # Individual relative weights
    }

    # Set CORS headers for the main request
    headers = {
        **common_headers,
        'Content-Type': 'application/json',
    }
    
    return (
        json.dumps(response_data),
        200,
        headers
    )