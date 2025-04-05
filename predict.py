import matplotlib.pyplot as plt
import numpy as np

from task_input import encode_task
from task_model import TaskDurationModel

# === 2. Define base task ===
base_task = {
    "task_type": "Feature Dev",
    "complexity": "High",
    "assignee_level": "Tech Lead",
    "tech_stack": "Python",
    "task_priority": "Critical",
    "story_points": 8,
    "team_size": 1,  # will be changed
    "num_dependencies": 2,
    "estimated_hours": 20,
    "sprint_day": 10,
    "created_hour": 14,
    "remote_work": True,
    "meetings_today": 1,
    "blocker_flag": False
}

# === 3. Test different team sizes and store results ===
team_sizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
predictions = []
model = TaskDurationModel()
model.load("models/model_weights.npz")
for size in team_sizes:
    task = base_task.copy()
    task["team_size"] = size

    X_input = encode_task(task)
    X_input = X_input / np.max(np.abs(X_input))

    prediction = model.predict(task)
    predictions.append(round(prediction, 2))

    print(f"👥 Team Size {size} → ⏱ {round(prediction, 2)} days")

# === 4. Plotting ===
plt.figure(figsize=(10, 6))
plt.plot(team_sizes, predictions, marker='o')
plt.title("Predicted Task Duration vs. Team Size")
plt.xlabel("Team Size")
plt.ylabel("Predicted Duration (days)")
plt.grid(True)
plt.xticks(team_sizes)
plt.tight_layout()
plt.show()
