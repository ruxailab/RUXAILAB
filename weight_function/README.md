# AHP Weight Calculation Service

## Overview

This service implements the **Analytic Hierarchy Process (AHP)** to calculate priority weights for usability heuristic evaluations. AHP is a structured decision-making technique developed by Thomas L. Saaty that helps prioritize multiple criteria through pairwise comparisons.

## What is AHP?

The Analytic Hierarchy Process (AHP) is a mathematical method for multi-criteria decision analysis. It works by:

1. **Breaking down complex decisions** into pairwise comparisons
2. **Using a standardized scale** (Saaty's 1-9 scale) for judgments
3. **Calculating priority weights** using eigenvalue analysis
4. **Validating consistency** to ensure logical judgments

### Why Use AHP for Usability Evaluation?

In usability testing, different heuristics (like Nielsen's 10 usability heuristics) may have different levels of importance depending on the context. AHP helps:

- **Prioritize heuristics** based on expert judgment or user needs
- **Quantify subjective comparisons** in a mathematically rigorous way
- **Ensure consistency** in evaluation criteria
- **Calculate weighted scores** that reflect real-world priorities

## Mathematical Background

### 1. Pairwise Comparison Matrix

AHP uses a **reciprocal matrix** where element _aᵢⱼ_ represents how much more important criterion _i_ is compared to criterion _j_.

**Properties:**

- _aᵢᵢ_ = 1 (diagonal elements)
- _aⱼᵢ_ = 1/_aᵢⱼ_ (reciprocal property)

**Example Matrix:**

```
             Visibility  Consistency  Error Prevention
Visibility        1           3              2
Consistency      1/3          1             1/2
Error Prev.      1/2          2              1
```

### 2. Saaty's Fundamental Scale

| Value | Meaning                | Description                                  |
| ----- | ---------------------- | -------------------------------------------- |
| 1     | Equal Importance       | Both criteria contribute equally             |
| 2     | Moderate Importance    | Slight favor of one over another             |
| 3     | Strong Importance      | Strong favor of one over another             |
| 4     | Very Strong Importance | Very strong dominance                        |
| 5     | Extreme Importance     | Highest possible favor                       |
| 6-9   | Inverse values         | Used when second criterion is more important |

**Note:** Reciprocals (1/2, 1/3, etc.) are automatically calculated for the inverse relationships.

### 3. Calculating Priority Weights

Weights are derived from the **principal eigenvector** of the comparison matrix:

1. Calculate eigenvalues: _Aw = λw_
2. Find maximum eigenvalue: _λₘₐₓ_
3. Extract corresponding eigenvector
4. Normalize eigenvector to sum to 1

**Result:** Priority weights where higher values indicate greater importance.

### 4. Consistency Validation

AHP includes built-in consistency checking to detect contradictory judgments.

**Consistency Index (CI):**

```
CI = (λₘₐₓ - n) / (n - 1)
```

where _n_ is the matrix dimension.

**Random Index (RI):**
Empirically determined values based on matrix size (see [RI table](#random-index-ri-values)).

**Consistency Ratio (CR):**

```
CR = CI / RI
```

**Interpretation:**

- **CR < 0.1**: Acceptable consistency ✓
- **CR ≥ 0.1**: Inconsistent judgments - review needed ✗

### 5. Final Weighted Score

The final usability score is calculated as:

```
Final Score = Σ(Usability_Scoreᵢ × Weightᵢ)
```

## Algorithm Workflow

```
┌─────────────────────────────────────┐
│ 1. Receive Input                    │
│    - Heuristic criteria             │
│    - Pairwise comparisons (1-9)     │
│    - Usability scores per heuristic │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 2. Build AHP Matrix                 │
│    - Initialize n×n matrix          │
│    - Fill with pairwise comparisons │
│    - Apply reciprocal property      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 3. Calculate Eigenvalues            │
│    - Find λₘₐₓ and eigenvector      │
│    - Normalize to get weights       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 4. Validate Consistency             │
│    - Calculate CI and CR            │
│    - Check if CR < 0.1              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 5. Apply Weights                    │
│    - Multiply scores by weights     │
│    - Sum to get final score         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 6. Return Results                   │
│    - Weighted usability score       │
│    - Individual weights             │
│    - Complete results table         │
└─────────────────────────────────────┘
```

## API Usage

### Endpoint

```
POST /weight_calculate
```

### Request Format

```json
{
  "caminhoTestStructure": [{ "title": "Visibility of System Status" }, { "title": "Match Between System and Real World" }, { "title": "User Control and Freedom" }],
  "caminhoTestWeights": {
    "comparisons": [3, 2, 1, 2, 3, 1]
  },
  "caminhoTestScore": [85.5, 92.3, 78.0]
}
```

### Request Parameters

| Parameter              | Type   | Description                                   |
| ---------------------- | ------ | --------------------------------------------- |
| `caminhoTestStructure` | Array  | List of heuristic criteria with `title` field |
| `caminhoTestWeights`   | Object | Pairwise comparison judgments (1-9 scale)     |
| `caminhoTestScore`     | Array  | Usability scores for each heuristic (0-100)   |

### Response Format

```json
{
  "usability_total": "86.73",
  "tabelacompleta": "{...}",
  "relative": [0.293, 0.451, 0.256]
}
```

### Response Fields

| Field             | Type   | Description                                                           |
| ----------------- | ------ | --------------------------------------------------------------------- |
| `usability_total` | String | Final weighted usability score                                        |
| `tabelacompleta`  | JSON   | Complete table with heuristics, scores, weights, and relative weights |
| `relative`        | Array  | Individual relative weight values per heuristic                       |

## Variable Naming Guide

### Portuguese Variable Names

Several variables use Portuguese terms (this codebase has international contributors):

| Variable      | Portuguese Meaning | English Equivalent | Description                            |
| ------------- | ------------------ | ------------------ | -------------------------------------- |
| `pesos`       | weights            | judgments          | Input pairwise comparison values (1-9) |
| `heuristicas` | heuristics         | heuristics         | List of evaluation criteria            |
| `caminho`     | path/route         | data structure     | Prefix for input data structures       |
| `peso_index`  | weight index       | judgment index     | Current position in judgments list     |

### Key Variable Descriptions

- **`ahp_df`**: Pandas DataFrame containing the pairwise comparison matrix
- **`ahp_matrix`**: NumPy array version of the comparison matrix
- **`normalized_weights`**: Final priority weights (sum = 1.0)
- **`max_eigenvalue` (λₘₐₓ)**: Principal eigenvalue used for weight calculation
- **`CR`**: Consistency Ratio for validation
- **`relative_weight_array`**: Weighted scores per heuristic (score × weight)
- **`usability_total`**: Final aggregate usability score

## Functions Reference

### `calculate_eigen(matrix)`

Calculates eigenvalues and consistency metrics.

**Returns:** `(max_eigenvalue, normalized_weights, CR, consistency_interpretation)`

### `initialize_ahp_matrix(df, column_name)`

Creates an empty n×n matrix for pairwise comparisons.

**Returns:** `pandas.DataFrame` with labeled rows/columns

### `generate_saaty_scale_with_explanations()`

Generates the 1-9 Saaty scale mapping.

**Returns:** `dict` mapping verbal judgments to numerical values

### `fill_ahp_matrix(ahp_df, row_name, col_names, comparison)`

Fills matrix cells with comparison values and reciprocals.

**Returns:** Updated `pandas.DataFrame`

### `populate_ahp_matrix(ahp_df, pesos)`

Populates entire matrix using sequential pairwise judgments.

**Returns:** Completed `pandas.DataFrame`

### `weight_calculate(req)`

Main Cloud Function endpoint for weight calculation.

**Returns:** `(json_response, status_code, headers)`

## Example Calculation

### Input

- **Heuristics:** A, B, C
- **Comparisons:**
  - A vs B: Strong Importance (3)
  - A vs C: Equal (1)
  - B vs C: Moderate Less Important (6 → 1/2)
- **Scores:** A=80, B=90, C=85

### Process

1. **Build Matrix:**

```
    A    B    C
A   1    3    1
B  1/3   1   1/2
C   1    2    1
```

2. **Calculate Weights:**

```
Weights: A=0.43, B=0.21, C=0.36
```

3. **Check Consistency:**

```
λₘₐₓ = 3.02
CI = 0.01
CR = 0.017 < 0.1 ✓ (Consistent)
```

4. **Apply Weights:**

```
Final Score = (80 × 0.43) + (90 × 0.21) + (85 × 0.36)
            = 34.4 + 18.9 + 30.6
            = 83.9
```

## Random Index (RI) Values

| Matrix Size (n) | RI Value  |
| --------------- | --------- |
| 1-2             | 0.00      |
| 3               | 0.58      |
| 4               | 0.90      |
| 5               | 1.12      |
| 6               | 1.24      |
| 7               | 1.32      |
| 8               | 1.41      |
| 9               | 1.45      |
| 10              | 1.49      |
| 11-30           | 1.52-1.74 |

## Common Issues & Troubleshooting

### High Consistency Ratio (CR > 0.1)

**Problem:** Pairwise comparisons are contradictory.

**Example:** If A > B, B > C, but C > A (circular preference).

**Solution:**

1. Review pairwise comparisons for logical consistency
2. Revise judgments that seem contradictory
3. Consider if criteria need redefinition

### Zero or Negative Weights

**Problem:** Should never occur with valid input.

**Cause:** Usually indicates matrix construction error.

**Solution:** Verify all matrix cells are properly filled with positive reciprocal values.

### Sum of Weights ≠ 1.0

**Problem:** Normalization error.

**Cause:** Floating-point arithmetic precision.

**Solution:** Already handled in code - weights are explicitly normalized.

## Dependencies

```
numpy>=1.21.0          # Eigenvalue calculations
pandas>=1.3.0          # Matrix manipulation and display
firebase-functions     # Cloud Functions runtime
firebase-admin         # Firebase SDK
```

## References

1. **Saaty, T.L.** (1980). _The Analytic Hierarchy Process_. McGraw-Hill.
2. **Saaty, T.L.** (2008). "Decision making with the analytic hierarchy process." _International Journal of Services Sciences_, 1(1), 83-98.
3. **Ishizaka, A., & Labib, A.** (2011). "Review of the main developments in the analytic hierarchy process." _Expert Systems with Applications_, 38(11), 14336-14345.

## Contributing

When modifying this code:

1. **Maintain consistency validation** - CR calculation is crucial
2. **Preserve reciprocal property** - If aᵢⱼ = x, then aⱼᵢ = 1/x
3. **Document mathematical changes** - Include formulas in docstrings
4. **Test with known examples** - Verify against published AHP results
5. **Keep variable naming consistent** - Update this README if adding new terms

## License

This code is part of the RUXAILAB project. See main repository LICENSE file.

---

**For questions or contributions, please refer to the main project CONTRIBUTING.md guide.**
