import numpy as np

def load_and_inspect_npz(path="models/model_weights.npz"):
    try:
        data = np.load(path)
        print(f"\nLoaded model from: {path}")
        print("\nKeys found in the file:")
        for key in data.files:
            print(f" - {key}: shape = {data[key].shape}")

        print("\n🔍 Sample values:")
        for key in data.files:
            print(f"\n-- {key} --")
            print(data[key][:2])  # print first 2 rows/elements for preview

    except FileNotFoundError:
        print(f"File not found: {path}")
    except Exception as e:
        print(f"Error reading file: {e}")

if __name__ == "__main__":
    load_and_inspect_npz()
