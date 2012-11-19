/**
 * Matrix comuptations.
 */
var Matrix = function() {
};

Matrix.add = function(matrix1, matrix2) {
  var matrix = [];
  for (var row = 0; row < matrix1.length; row++) {
    matrix[row] = [];
    for (var col = 0; col < matrix1[row].length; col++) {
      matrix[row][col] = matrix1[row][col] + matrix2[row][col];
    }
  }
  return matrix;
};

Matrix.multiply = function(matrix1, matrix2) {
  var matrix = [];
  for (var row1 = 0; row1 < matrix1.length; row1++) {
    matrix[row1] = [];
    for (var col2 = 0; col2 < matrix2[0].length; col2++) {
      matrix[row1][col2] = 0;

      for (var i = 0; i < matrix1[row1].length; i++) {
        matrix[row1][col2] += matrix1[row1][i] * matrix2[i][col2];
      }
    }
  }
  return matrix;
};

Matrix.gaussianJordanElimination = function(augmented) {
  var size = augmented.length;
  var i = 0, row = 0, col = 0, factor = 0;
  for (i = 0; i < size; i++) {
    for (row = i+1; row < size; row++) {
      factor = augmented[row][i] / augmented[i][i];
      for (col = i; col < augmented[row].length; col++) {
        augmented[row][col] = augmented[row][col] - factor * augmented[i][col]; 
      }
    }
  }
  for (i = 0; i < size; i++) {
    factor = augmented[i][i];
    for (col = i; col < augmented[i].length; col++) {
      augmented[i][col] = augmented[i][col] / factor;
    }
  }
  for (i = size-1; i >= 0; i--) {
    for (row = i-1; row >= 0; row--) {
      factor = augmented[row][i];
      for (col = i; col < augmented[row].length; col++) {
        augmented[row][col] = augmented[row][col] - factor * augmented[i][col]; 
      }
    }
  }
  return augmented;
};

Matrix.augment = function(matrix1, matrix2) {
  var augmented = [];
  var row = 0, col = 0;
  for (row = 0; row < matrix1.length; row++) {
    augmented[row] = [];
    for (col = 0; col < matrix1[row].length; col++) {
      augmented[row].push(matrix1[row][col]);
    }
    for (col = 0; col < matrix2[row].length; col++) {
      augmented[row].push(matrix2[row][col]);
    }
  }
  return augmented;
};

Matrix.inverse = function(matrix) {
  var size = matrix.length;
  var row = 0, col = 0;
  var identity = [];
  for (row = 0; row < size; row++) {
    identity[row] = [];
    for (col = 0; col < size; col++) {
      if (row === col) {
        identity[row][col] = 1;
      } else {
        identity[row][col] = 0;
      }
    }
  }
  var augmented = Matrix.augment(matrix, identity);
  Matrix.gaussianJordanElimination(augmented);

  var inverse = [];
  for (row = 0; row < size; row++) {
    inverse[row] = [];
    for (col = 0; col < size; col++) {
      inverse[row][col] = augmented[row][size+col];
    }
  }
  return inverse;
};

Matrix.solveLinearEquations = function(coefficients, vector) {
  var augmented = Matrix.augment(coefficients, vector);
  Matrix.gaussianJordanElimination(augmented);
  
  var solution = [];
  var col = augmented[0].length-1;
  for (var row = 0; row < augmented.length; row++) {
    solution[row] = augmented[row][col];
  }
  return solution;
};

