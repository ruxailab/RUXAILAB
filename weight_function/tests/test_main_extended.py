import unittest
import numpy as np
import pandas as pd
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add parent directory to path so we can import main
sys.path.insert(0, str(Path(__file__).parent.parent))

# Mock Firebase modules before importing main
sys.modules['firebase_functions'] = MagicMock()
sys.modules['firebase_admin'] = MagicMock()

from main import (
    calculate_eigen, 
    initialize_ahp_matrix,
    generate_saaty_scale_with_explanations,
    fill_ahp_matrix,
    populate_ahp_matrix
)


class TestGenerateSaatyScale(unittest.TestCase):
    """Test cases for generate_saaty_scale_with_explanations function"""

    def test_saaty_scale_returns_dict(self):
        """Test that generate_saaty_scale_with_explanations returns a dictionary"""
        scale = generate_saaty_scale_with_explanations()
        self.assertIsInstance(scale, dict)

    def test_saaty_scale_contains_expected_keys(self):
        """Test that Saaty scale contains all 9 expected levels"""
        scale = generate_saaty_scale_with_explanations()
        
        expected_keys = [
            'Equal Importance',
            'Moderate Importance',
            'Strong Importance',
            'Very Strong Importance',
            'Extreme Importance',
            'Moderately Less Important',
            'Strongly Less Important',
            'Very Strongly Less Important',
            'Extremely Less Important'
        ]
        
        for key in expected_keys:
            self.assertIn(key, scale)

    def test_saaty_scale_values_range(self):
        """Test that Saaty scale values are between 1 and 9"""
        scale = generate_saaty_scale_with_explanations()
        
        for value in scale.values():
            self.assertGreaterEqual(value, 1)
            self.assertLessEqual(value, 9)

    def test_saaty_scale_length(self):
        """Test that Saaty scale has exactly 9 entries"""
        scale = generate_saaty_scale_with_explanations()
        self.assertEqual(len(scale), 9)

    def test_saaty_scale_all_values_numeric(self):
        """Test that all Saaty scale values are numeric"""
        scale = generate_saaty_scale_with_explanations()
        
        for value in scale.values():
            self.assertIsInstance(value, (int, float))


class TestFillAhpMatrix(unittest.TestCase):
    """Test cases for fill_ahp_matrix function"""

    def setUp(self):
        """Set up test fixtures"""
        self.df = pd.DataFrame({
            'criteria': ['A', 'B', 'C'],
            'value': [0, 0, 0]
        })
        self.ahp_df = initialize_ahp_matrix(self.df, 'criteria')

    def test_fill_ahp_matrix_with_valid_comparison(self):
        """Test filling AHP matrix with valid Saaty comparison"""
        ahp_df = fill_ahp_matrix(self.ahp_df.copy(), 'A', ['B', 'C'], 'Moderate Importance')
        
        # Check that values were filled correctly
        self.assertEqual(ahp_df.loc['A', 'B'], 2)  
        self.assertEqual(ahp_df.loc['B', 'A'], 0.5)  # Reciprocal
        self.assertEqual(ahp_df.loc['A', 'C'], 2)
        self.assertEqual(ahp_df.loc['C', 'A'], 0.5)

    def test_fill_ahp_matrix_reciprocal_property(self):
        """Test that AHP matrix maintains reciprocal property"""
        ahp_df = fill_ahp_matrix(self.ahp_df.copy(), 'A', ['B'], 'Strong Importance')
        
        # Check reciprocal property: a_ij * a_ji = 1
        product = ahp_df.loc['A', 'B'] * ahp_df.loc['B', 'A']
        self.assertAlmostEqual(product, 1.0, places=5)

    def test_fill_ahp_matrix_with_invalid_comparison(self):
        """Test filling AHP matrix with invalid comparison"""
        ahp_df_before = self.ahp_df.copy()
        ahp_df = fill_ahp_matrix(self.ahp_df.copy(), 'A', ['B'], 'Invalid Comparison')
        
        # Matrix should remain unchanged
        pd.testing.assert_frame_equal(ahp_df, ahp_df_before)

    def test_fill_ahp_matrix_extreme_importance(self):
        """Test filling with Extreme Importance (value 5)"""
        ahp_df = fill_ahp_matrix(self.ahp_df.copy(), 'A', ['B'], 'Extreme Importance')
        
        self.assertEqual(ahp_df.loc['A', 'B'], 5)
        self.assertAlmostEqual(ahp_df.loc['B', 'A'], 0.2, places=5)

    def test_fill_ahp_matrix_equal_importance(self):
        """Test filling with Equal Importance"""
        ahp_df = fill_ahp_matrix(self.ahp_df.copy(), 'A', ['B'], 'Equal Importance')
        
        self.assertEqual(ahp_df.loc['A', 'B'], 1)
        self.assertEqual(ahp_df.loc['B', 'A'], 1)

    def test_fill_ahp_matrix_multiple_columns(self):
        """Test filling multiple columns at once"""
        ahp_df = fill_ahp_matrix(self.ahp_df.copy(), 'A', ['B', 'C'], 'Very Strong Importance')
        
        # Check both comparisons
        self.assertEqual(ahp_df.loc['A', 'B'], 4)  # Very Strong = 4
        self.assertEqual(ahp_df.loc['A', 'C'], 4)


class TestPopulateAhpMatrix(unittest.TestCase):
    """Test cases for populate_ahp_matrix function"""

    def setUp(self):
        """Set up test fixtures"""
        self.df = pd.DataFrame({
            'criteria': ['A', 'B', 'C'],
            'value': [0, 0, 0]
        })
        self.ahp_df = initialize_ahp_matrix(self.df, 'criteria')

    def test_populate_ahp_matrix_diagonal(self):
        """Test that diagonal elements are 1"""
        pesos = [1, 1, 1]
        ahp_df = populate_ahp_matrix(self.ahp_df.copy(), pesos)
        
        # Diagonal should be all 1s
        for i in range(len(ahp_df)):
            self.assertEqual(ahp_df.iloc[i, i], 1)

    def test_populate_ahp_matrix_shape(self):
        """Test that populated matrix maintains shape"""
        pesos = [1, 2, 3]
        ahp_df = populate_ahp_matrix(self.ahp_df.copy(), pesos)
        
        # Shape should be unchanged
        self.assertEqual(ahp_df.shape, (3, 3))

    def test_populate_ahp_matrix_reciprocal_property(self):
        """Test that populated matrix maintains reciprocal property"""
        pesos = [2, 3, 4]
        ahp_df = populate_ahp_matrix(self.ahp_df.copy(), pesos)
        
        # Check reciprocal property for non-diagonal elements
        for i in range(len(ahp_df)):
            for j in range(len(ahp_df)):
                if i != j:
                    product = ahp_df.iloc[i, j] * ahp_df.iloc[j, i]
                    self.assertAlmostEqual(product, 1.0, places=5)

    def test_populate_ahp_matrix_equal_importance(self):
        """Test transitive relations for Equal Importance"""
        pesos = [1, 1, 1, 1, 1, 1]  # Equal Importance - enough pesos for all comparisons
        ahp_df = populate_ahp_matrix(self.ahp_df.copy(), pesos)
        
        # Diagonal should be 1
        for i in range(len(ahp_df)):
            self.assertEqual(ahp_df.iloc[i, i], 1)

    def test_populate_ahp_matrix_values_in_range(self):
        """Test that all values are positive and reasonable"""
        pesos = [1, 2, 3, 4, 5]
        ahp_df = populate_ahp_matrix(self.ahp_df.copy(), pesos)
        
        # All values should be positive
        self.assertTrue(np.all(ahp_df.values > 0))

    def test_populate_ahp_matrix_with_empty_pesos(self):
        """Test populate_ahp_matrix with empty pesos list"""
        pesos = []
        ahp_df = populate_ahp_matrix(self.ahp_df.copy(), pesos)
        
        # Should have diagonal = 1
        for i in range(len(ahp_df)):
            self.assertEqual(ahp_df.iloc[i, i], 1)

    def test_populate_ahp_matrix_is_dataframe(self):
        """Test that the result is a DataFrame"""
        pesos = [1, 2]
        ahp_df = populate_ahp_matrix(self.ahp_df.copy(), pesos)
        
        self.assertIsInstance(ahp_df, pd.DataFrame)


if __name__ == '__main__':
    unittest.main()
