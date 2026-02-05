import unittest
import numpy as np
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add parent directory to path so we can import main
sys.path.insert(0, str(Path(__file__).parent.parent))

# Mock Firebase modules before importing main
sys.modules['firebase_functions'] = MagicMock()
sys.modules['firebase_admin'] = MagicMock()

from main import calculate_eigen, initialize_ahp_matrix


class TestCalculateEigen(unittest.TestCase):
    """Test cases for calculate_eigen function"""

    def test_calculate_eigen_consistency(self):
        """Test that calculate_eigen returns proper consistency ratio"""
        # Create a consistent matrix (diagonal matrix with 1s)
        matrix = np.array([
            [1.0, 0.5, 0.25],
            [2.0, 1.0, 0.5],
            [4.0, 2.0, 1.0]
        ])
        
        _, weights, cr, interpretation = calculate_eigen(matrix)
        
        # Check that weights sum to 1
        self.assertAlmostEqual(np.sum(weights), 1.0, places=5)
        
        # Check that CR is approximately non-negative (allowing for floating point precision)
        self.assertGreaterEqual(float(cr.real) if hasattr(cr, 'real') else cr, -1e-10)
        
        # Check that weights are positive
        self.assertTrue(np.all(weights > 0))

        # Verify interpretation is a string
        self.assertIsInstance(interpretation, str)

    def test_calculate_eigen_output_shape(self):
        """Test that calculate_eigen returns correct output shape for weights"""
        matrix = np.array([
            [1.0, 2.0, 3.0],
            [0.5, 1.0, 2.0],
            [0.33, 0.5, 1.0]
        ])
        
        _, weights, cr, interpretation = calculate_eigen(matrix)
        
        # Check dimensions
        self.assertEqual(len(weights), 3)
        # CR might be complex, so check if it's numeric
        self.assertIsInstance(cr, (float, np.floating, complex, np.complexfloating))
        self.assertIsInstance(interpretation, str)

    def test_calculate_eigen_small_matrix(self):
        """Test calculate_eigen with 2x2 matrix"""
        matrix = np.array([
            [1.0, 2.0],
            [0.5, 1.0]
        ])
        
        _, weights, cr, interpretation = calculate_eigen(matrix)
        
        # Weights should sum to 1
        self.assertAlmostEqual(np.sum(weights), 1.0, places=5)
        self.assertEqual(len(weights), 2)

    def test_consistency_interpretation_message(self):
        """Test that consistency interpretation returns expected message"""
        # Consistent matrix (identity-like)
        matrix = np.eye(3)
        
        _, weights, cr, interpretation = calculate_eigen(matrix)
        
        # Should be consistent (CR <= 0.1)
        self.assertIn("Consistent", interpretation)


class TestInitializeAhpMatrix(unittest.TestCase):
    """Test cases for initialize_ahp_matrix function"""

    def test_initialize_ahp_matrix_shape(self):
        """Test that AHP matrix has correct shape"""
        import pandas as pd
        
        df = pd.DataFrame({
            'criteria': ['Cost', 'Quality', 'Time']
        })
        
        ahp_df = initialize_ahp_matrix(df, 'criteria')
        
        # Check shape (should be 3x3)
        self.assertEqual(ahp_df.shape, (3, 3))

    def test_initialize_ahp_matrix_initialization(self):
        """Test that AHP matrix is initialized with zeros"""
        import pandas as pd
        
        df = pd.DataFrame({
            'criteria': ['A', 'B']
        })
        
        ahp_df = initialize_ahp_matrix(df, 'criteria')
        
        # All values should be zero initially
        self.assertTrue(np.all(ahp_df.values == 0))

    def test_initialize_ahp_matrix_labels(self):
        """Test that AHP matrix has correct row and column labels"""
        import pandas as pd
        
        categories = ['Cost', 'Quality', 'Time']
        df = pd.DataFrame({
            'criteria': categories
        })
        
        ahp_df = initialize_ahp_matrix(df, 'criteria')
        
        # Check that indices match categories
        self.assertEqual(list(ahp_df.index), categories)
        self.assertEqual(list(ahp_df.columns), categories)


if __name__ == '__main__':
    unittest.main()
