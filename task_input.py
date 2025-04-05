import numpy as np

# Categorical fields
TASK_TYPES = [
    "Code Review", "Bug Fix", "Feature Dev", "Testing", "Documentation",
    "Design Review", "Client Meeting", "Deployment", "Refactoring"
]

COMPLEXITIES = ["Low", "Medium", "High"]
ASSIGNEE_LEVELS = ["Junior", "Mid", "Senior", "Tech Lead"]
TECH_STACKS = ["Python", "Java", "JavaScript", "C++", "Go", "Other"]
PRIORITY_LEVELS = ["Low", "Medium", "High", "Critical"]

def encode_task(task):
    """
    Converts a detailed task dictionary into a numerical feature vector.
    Compatible with datasets structured for project management prediction models.
    """

    input_vector = []

    # One-hot encode task type, complexity, assignee level, tech stack, priority
    input_vector += [1 if task["task_type"] == t else 0 for t in TASK_TYPES]
    input_vector += [1 if task["complexity"] == c else 0 for c in COMPLEXITIES]
    input_vector += [1 if task["assignee_level"] == a else 0 for a in ASSIGNEE_LEVELS]
    input_vector += [1 if task["tech_stack"] == tech else 0 for tech in TECH_STACKS]
    input_vector += [1 if task["task_priority"] == p else 0 for p in PRIORITY_LEVELS]

    # Numerical fields
    input_vector.append(task.get("story_points", 0))
    input_vector.append(task.get("team_size", 1))
    input_vector.append(task.get("num_dependencies", 0))
    input_vector.append(task.get("estimated_hours", 0))
    input_vector.append(task.get("sprint_day", 1))
    input_vector.append(task.get("created_hour", 9))
    input_vector.append(1 if task.get("remote_work", False) else 0)
    input_vector.append(task.get("meetings_today", 0))
    input_vector.append(1 if task.get("blocker_flag", False) else 0)

    # Optional enhancements for team skill composition
    # Add these only if using dynamic team prediction
    if "avg_experience" in task:
        input_vector.append(task["avg_experience"])
    if "juniors" in task and "mediors" in task and "seniors" in task and "tech_leads" in task:
        input_vector.append(task["juniors"])
        input_vector.append(task["mediors"])
        input_vector.append(task["seniors"])
        input_vector.append(task["tech_leads"])

    return np.array([input_vector])
