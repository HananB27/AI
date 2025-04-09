import pandas as pd
import random
import numpy as np

TASK_TYPES = [
    "Code Review", "Bug Fix", "Feature Dev", "Testing", "Documentation",
    "Design Review", "Client Meeting", "Deployment", "Refactoring"
]
COMPLEXITIES = ["Low", "Medium", "High"]
ASSIGNEE_LEVELS = ["Junior", "Mid", "Senior", "Tech Lead"]
TECH_STACKS = ["Python", "Java", "JavaScript", "C++", "Go", "Other"]
PRIORITY_LEVELS = ["Low", "Medium", "High", "Critical"]

def random_task():
    task_type = random.choice(TASK_TYPES)
    complexity = random.choice(COMPLEXITIES)
    assignee_level = random.choice(ASSIGNEE_LEVELS)
    tech_stack = random.choice(TECH_STACKS)
    task_priority = random.choice(PRIORITY_LEVELS)

    story_points = random.randint(1, 13)
    blockers = random.choices([True, False], weights=[0.25, 0.75])[0]
    meetings = random.randint(0, 3)
    deps = random.randint(0, 3)
    remote = random.choices([True, False], weights=[0.4, 0.6])[0]

    team_size = random.randint(1, 5)
    team_roles = random.choices(ASSIGNEE_LEVELS, weights=[4, 3, 2, 1], k=team_size)
    counts = {role: team_roles.count(role) for role in ASSIGNEE_LEVELS}

    exp_map = {
        "Junior": random.uniform(1, 2),
        "Mid": random.uniform(2.5, 4),
        "Senior": random.uniform(4.5, 6.5),
        "Tech Lead": random.uniform(6.5, 8)
    }
    avg_exp = round(np.mean([exp_map[role] for role in team_roles]), 2)

    base_duration = story_points * 0.4

    complexity_multiplier = {"Low": 0.9, "Medium": 1.0, "High": 1.15}
    priority_factor = {"Low": 1.1, "Medium": 1.0, "High": 0.9, "Critical": 0.85}

    duration = base_duration * complexity_multiplier[complexity]
    duration += deps * 0.15
    duration += meetings * 0.1

    team_factor = 1 - (0.03 * counts.get("Senior", 0) + 0.05 * counts.get("Tech Lead", 0))
    duration *= team_factor

    exp_factor = np.clip(1.05 - avg_exp * 0.03, 0.9, 1.05)
    duration *= exp_factor

    if blockers:
        duration *= 1.1
    if remote:
        duration *= 1.05

    duration += random.uniform(-0.2, 0.2)
    duration = round(np.clip(duration, 0.5, 8.0), 2)

    return {
        "task_type": task_type,
        "complexity": complexity,
        "assignee_level": assignee_level,
        "tech_stack": tech_stack,
        "task_priority": task_priority,
        "story_points": story_points,
        "team_size": team_size,
        "num_dependencies": deps,
        "estimated_hours": story_points * 2,
        "sprint_day": random.randint(1, 10),
        "created_hour": random.randint(9, 18),
        "remote_work": remote,
        "meetings_today": meetings,
        "blocker_flag": blockers,
        "avg_experience": avg_exp,
        "juniors": counts.get("Junior", 0),
        "mediors": counts.get("Mid", 0),
        "seniors": counts.get("Senior", 0),
        "tech_leads": counts.get("Tech Lead", 0),
        "predicted_duration_days": duration
    }

random.seed(42)
data = [random_task() for _ in range(50000)]

df = pd.DataFrame(data)
df.to_csv("realistic_tasks_large.csv", index=False)
print("Dataset saved as realistic_tasks_large.csv")
print(f"Example task duration: {data[0]['predicted_duration_days']} days")
