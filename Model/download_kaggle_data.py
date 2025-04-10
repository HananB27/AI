import os
import pandas as pd

# Set your Kaggle dataset path
dataset_path = 'mustafa9901/project-management-data'

# Make sure Kaggle API credentials are set
os.environ['KAGGLE_CONFIG_DIR'] = os.path.expanduser('~/.kaggle')

# Download dataset
os.system(f'kaggle datasets download -d {dataset_path} --unzip')

# Load dataset (update filename if needed)
df = pd.read_csv("project_data.csv")
print(df.head())
