from itertools import combinations_with_replacement
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from task_model import TaskDurationModel

app = Flask(__name__)
CORS(app)

model = TaskDurationModel()
model.load("models/model_weights.npz")

experience_map = {
    "Junior": 1.5,
    "Mid": 3.25,
    "Senior": 5.75,
    "Tech Lead": 7.75
}

levels = ["Junior", "Mid", "Senior", "Tech Lead"]

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    try:
        prediction = model.predict(data)
        days = int(prediction)
        hours = round((prediction - days) * 24)
        return jsonify({
            "duration": {"days": days, "hours": hours},
            "cost": data.get("team_cost", 0) * prediction * 8,
            "performance": 90,
            "teamEfficiency": max(0, 100 - data.get("team_size", 1) * 5),
            "riskLevel": "High" if data["complexity"] == "High" else "Medium"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/optimize-teams", methods=["POST"])
def optimize_teams():
    raw_task = request.json

    key_map = {
        "type": "task_type",
        "complexity": "complexity",
        "priority": "task_priority",
        "techStack": "tech_stack",
        "assigneeLevel": "assignee_level",
        "storyPoints": "story_points",
        "dependencies": "num_dependencies",
        "estimatedHours": "estimated_hours",
        "sprintDay": "sprint_day",
        "createdHour": "created_hour",
        "remoteWork": "remote_work",
        "meetingsToday": "meetings_today",
        "blockerFlag": "blocker_flag",
        "team_cost": "team_cost",
        "team_size": "team_size",
        "juniors": "juniors",
        "mediors": "mediors",
        "seniors": "seniors",
        "tech_leads": "tech_leads",
        "avg_experience": "avg_experience"
    }

    # Normalize keys
    task = {new_key: raw_task[old_key] for old_key, new_key in key_map.items()}
    print("[REQUESTED TASK]:", task)
    fastest = []
    cheapest = []
    all_teams = []

    for team_size in range(2, 6):
        for combo in combinations_with_replacement(levels, team_size):
            counts = {lvl: combo.count(lvl) for lvl in levels}

            if counts["Tech Lead"] > 1 or \
               (counts["Tech Lead"] and team_size < 3) or \
               counts["Senior"] > 2 or \
               (counts["Junior"] > 2 and task["complexity"] == "High") or \
               (counts["Senior"] > 0 and task["complexity"] == "Low"):
                continue

            avg_exp = np.mean([experience_map[lvl] for lvl in combo])
            input_data = {
                **task,
                "team_size": team_size,
                "avg_experience": round(avg_exp, 2),
                "juniors": counts["Junior"],
                "mediors": counts["Mid"],
                "seniors": counts["Senior"],
                "tech_leads": counts["Tech Lead"]
            }

            try:
                prediction = model.predict(input_data)
                days = int(prediction)
                hours = round((prediction - days) * 24)
                cost = (
                    counts["Junior"] * 25 +
                    counts["Mid"] * 50 +
                    counts["Senior"] * 75 +
                    counts["Tech Lead"] * 100
                ) * prediction * 8

                all_teams.append({
                    "juniors": counts["Junior"],
                    "mediors": counts["Mid"],
                    "seniors": counts["Senior"],
                    "tech_leads": counts["Tech Lead"],
                    "avg_experience": round(avg_exp, 2),
                    "duration": {"days": days, "hours": hours},
                    "duration_days": round(prediction, 2),
                    "cost": round(cost, 2)
                })
            except:
                continue

    fastest = sorted(all_teams, key=lambda x: x["duration_days"])[:5]
    cheapest = sorted(all_teams, key=lambda x: x["cost"])[:5]

    return jsonify({
        "fastest": fastest,
        "cheapest": cheapest
    })

if __name__ == "__main__":
    app.run(debug=True)
