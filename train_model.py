import pandas as pd
from task_model import TaskDurationModel
from task_input import encode_task
import numpy as np
import matplotlib.pyplot as plt

loss_history = []  

df = pd.read_csv("detailed_project_management_dataset.csv")

model = TaskDurationModel(input_size=45)

log_file = open("full_training_log.txt", "w",encoding="utf-8") 

print("Training model on dataset...")
log_file.write("Training model on dataset...\n")

for i, row in df.iterrows():
    task = row.drop("predicted_duration_days").to_dict()
    duration = row["predicted_duration_days"]


    avg_loss, epoch_logs = model.train(task_dict=task, true_duration=duration, epochs=5, learning_rate=0.01)

    loss_history.append(avg_loss)

    log_file.write(f"\n--- Task {i} ---\n")
    log_file.write(f"Input: {task}\n")
    log_file.write(f"Target Duration: {duration}\n")
    log_file.write(f"Average Loss: {avg_loss:.4f}\n")
    log_file.write("Epoch Logs:\n")
    for log in epoch_logs:
        log_file.write(f"{log}\n")

    
    if avg_loss > 3000:
        log_file.write(f"⚠️ High loss at task {i}: Loss={avg_loss:.2f}\n")
        print(f"⚠️ High loss at task {i}: Loss={avg_loss:.2f}")

    if i % 100 == 0:
        print(f"Trained on {i} tasks")

model.save("models/model_weights.npz")
print("Model training complete.")
log_file.write("\nModel training complete.\n")
log_file.close()
