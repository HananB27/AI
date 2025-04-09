from itertools import combinations_with_replacement
import numpy as np
from task_model import TaskDurationModel

# === Load trained model ===
model = TaskDurationModel()
model.load("models/model_weights.npz")

levels = ["Junior", "Mid", "Senior", "Tech Lead"]
experience_map = {
    "Junior": 1.5,
    "Mid": 3.25,
    "Senior": 5.75,
    "Tech Lead": 7.75
}

# === Fixed task parameters ===
task_base = {
    "task_type": "Feature Dev",
    "complexity": "High",
    "assignee_level": "Mid",
    "tech_stack": "Python",
    "task_priority": "Critical",
    "story_points": 8,
    "num_dependencies": 2,
    "estimated_hours": 24,
    "sprint_day": 4,
    "created_hour": 13,
    "remote_work": True,
    "meetings_today": 1,
    "blocker_flag": False
}

best_team = None
best_duration = float("inf")

# Try realistic team compositions
for team_size in range(2, 6):
    for combo in combinations_with_replacement(levels, team_size):
        counts = {lvl: combo.count(lvl) for lvl in levels}

        # === Hierarchy rules ===
        if counts["Tech Lead"] > 1:
            continue  # Usually only one tech lead
        if counts["Tech Lead"] > 0 and team_size < 3:
            continue  # Tech leads not in very small teams
        if counts["Senior"] > 2:
            continue  # Unlikely more than 2 seniors
        if counts["Junior"] > 2 and task_base["complexity"] == "High":
            continue  # Too many juniors on complex tasks
        if counts["Senior"] > 0 and task_base["complexity"] == "Low":
            continue  # Don't assign seniors to very simple tasks

        avg_exp = np.mean([experience_map[lvl] for lvl in combo])

        task_input = task_base.copy()
        task_input.update({
            "team_size": team_size,
            "avg_experience": round(avg_exp, 2),
            "juniors": counts["Junior"],
            "mediors": counts["Mid"],
            "seniors": counts["Senior"],
            "tech_leads": counts["Tech Lead"]
        })

        prediction = model.predict(task_input)

        if prediction < best_duration:
            best_duration = prediction
            best_team = (counts.copy(), team_size, prediction)

# === Output best configuration ===
days = int(best_team[2])
hours = round((best_team[2] - days) * 24)

print("\nOptimal Team Configuration:")
print(f"Team Composition: {best_team[0]}")
print(f"Team Size: {best_team[1]}")
print(f"Predicted Duration: {days} days and {hours} hours")
