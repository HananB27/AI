import numpy as np

class Layer_Dense:
    def __init__(self, n_inputs, n_neurons):
        limit = np.sqrt(1 / (n_inputs + n_neurons))
        self.weights = np.random.uniform(-limit, limit, (n_inputs, n_neurons))
        self.biases = np.zeros((1, n_neurons))
    def forward(self, inputs):
        self.inputs = inputs
        self.output = np.dot(inputs, self.weights) + self.biases
    def backward(self, dvalues):
        self.dweights = np.dot(self.inputs.T, dvalues)
        self.dbiases = np.sum(dvalues, axis=0, keepdims=True)
        self.dinputs = np.dot(dvalues, self.weights.T)

